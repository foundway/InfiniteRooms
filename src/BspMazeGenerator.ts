import seedrandom from 'seedrandom';

interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface Room {
    rect: Rect;
    connections: Room[];
}

interface Config {
    SEED: number;
    MAP_WIDTH: number;
    MAP_HEIGHT: number;
    MAX_LEAVES_COUNT: number;
    MIN_SIZE: number;
    MAX_SIZE: number;
    QUIT_RATE: number;
    SINGLE_DOOR_PROB: number;
    DOUBLE_DOOR_PROB: number;
    HALLWAY_DOOR_PROB: number;
}

class BspMazeGenerator {
    private config: Config;
    private tree: Tree | null = null;
    private grid: string[][] = [];

    constructor(config: Partial<Config> = {}) {
        this.config = {
            SEED: config.SEED || 101,
            MAP_WIDTH: config.MAP_WIDTH || 40,
            MAP_HEIGHT: config.MAP_HEIGHT || 40,
            MAX_LEAVES_COUNT: config.MAX_LEAVES_COUNT || 100,
            MIN_SIZE: config.MIN_SIZE || 6,
            MAX_SIZE: config.MAX_SIZE || 20,
            QUIT_RATE: config.QUIT_RATE || 0.1,
            SINGLE_DOOR_PROB: config.SINGLE_DOOR_PROB || 2,
            DOUBLE_DOOR_PROB: config.DOUBLE_DOOR_PROB || 2,
            HALLWAY_DOOR_PROB: config.HALLWAY_DOOR_PROB || 1
        };
    }

    public setGrid(): string[][] {
        const rng = seedrandom(this.config.SEED.toString());
        const originalRandom = Math.random;
        Math.random = () => rng();
        
        this.tree = new Tree(this.config, 1, 1, this.config.MAP_WIDTH - 1, this.config.MAP_HEIGHT - 1);
        this.grid = Array(this.config.MAP_WIDTH).fill(null).map(() => 
            Array(this.config.MAP_HEIGHT).fill('#')
        );
        this.tree.buildRooms(this.grid);

        Math.random = originalRandom;
        return this.grid;
    }
}

class Tree {
    private config: Config;
    private root: Leaf;
    private tree: Leaf[] = [];
    private rooms: Room[] = [];

    constructor(config: Config, x: number, y: number, width: number, height: number) {
        this.config = config;
        this.root = new Leaf(x, y, width, height);
        this.tree.push(this.root);

        let splitIdx = 0;
        while (splitIdx < this.tree.length && this.tree.length < config.MAX_LEAVES_COUNT) {
            if (this.tree[splitIdx].split(config)) {
                this.tree.push(this.tree[splitIdx].leftChild!, this.tree[splitIdx].rightChild!);
            }
            splitIdx++;
        }

        this.root.createRooms(config);
        this.rooms = this.tree.map(leaf => leaf.room).filter((room): room is Room => room !== null);
    }

    public buildRooms(grid: string[][]): void {
        // Draw rooms
        for (const room of this.rooms) {
            const { x, y, width, height } = room.rect;
            for (let i = 0; i < width; i++) {
                for (let j = 0; j < height; j++) {
                    grid[x + i][y + j] = '.';
                }
            }
        }

        // Draw doors
        for (const leaf of this.tree) {
            for (const door of leaf.doors) {
                const { x, y, width, height } = door.rect;
                for (let i = 0; i < width; i++) {
                    for (let j = 0; j < height; j++) {
                        grid[x + i][y + j] = 'o';
                    }
                }
            }
        }
    }
}

class Leaf {
    public x: number;
    public y: number;
    public width: number;
    public height: number;
    public leftChild: Leaf | null = null;
    public rightChild: Leaf | null = null;
    public room: Room | null = null;
    public doors: Room[] = [];
    public connectDir: number;

    constructor(x: number, y: number, width: number, height: number, connectDir: number = 0) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.connectDir = connectDir;
    }

    public split(config: Config): boolean {
        if (this.leftChild || this.rightChild) return false;
        if (Math.random() < config.QUIT_RATE && Math.max(this.width, this.height) < config.MAX_SIZE) return false;

        const isSplitTopBottom = this.height > this.width;
        const max = (isSplitTopBottom ? this.height : this.width) - config.MIN_SIZE;
        if (max <= config.MIN_SIZE) return false;

        const splitPos = Math.floor(Math.random() * (max - config.MIN_SIZE + 1)) + config.MIN_SIZE;
        if (isSplitTopBottom) {
            this.leftChild = new Leaf(this.x, this.y, this.width, splitPos, 3);
            this.rightChild = new Leaf(this.x, this.y + splitPos, this.width, this.height - splitPos, 2);
        } else {
            this.leftChild = new Leaf(this.x, this.y, splitPos, this.height, 1);
            this.rightChild = new Leaf(this.x + splitPos, this.y, this.width - splitPos, this.height, 0);
        }
        return true;
    }

    public createRooms(config: Config): void {
        if (this.leftChild || this.rightChild) {
            if (this.leftChild) this.leftChild.createRooms(config);
            if (this.rightChild) this.rightChild.createRooms(config);

            if (this.leftChild && this.rightChild) {
                const leftRoom = this.leftChild.getRoomConnectToward(this.leftChild.connectDir);
                if (leftRoom) {
                    const rightRoom = this.rightChild.getRoomNextTo(leftRoom);
                    if (rightRoom) {
                        this.createDoor(config, leftRoom, rightRoom);
                    }
                }
            }
        } else {
            this.room = {
                rect: {
                    x: this.x,
                    y: this.y,
                    width: Math.max(this.width, config.MIN_SIZE) - 1,
                    height: Math.max(this.height, config.MIN_SIZE) - 1
                },
                connections: []
            };
        }
    }

    private getRoomConnectToward(connectDir: number): Room | null {
        if (this.room) return this.room;

        const lRoom = this.leftChild?.getRoomConnectToward(connectDir) ?? null;
        const rRoom = this.rightChild?.getRoomConnectToward(connectDir) ?? null;

        if (!lRoom && !rRoom) return null;
        if (!rRoom) return lRoom;
        if (!lRoom) return rRoom;

        switch (connectDir) {
            case 0: return rRoom.rect.x < lRoom.rect.x ? rRoom : lRoom;
            case 1: return rRoom.rect.x + rRoom.rect.width > lRoom.rect.x + lRoom.rect.width ? rRoom : lRoom;
            case 2: return rRoom.rect.y < lRoom.rect.y ? rRoom : lRoom;
            case 3: return rRoom.rect.y + rRoom.rect.height > lRoom.rect.y + lRoom.rect.height ? rRoom : lRoom;
            default: return Math.random() < 0.5 ? rRoom : lRoom;
        }
    }

    private getRoomNextTo(target: Room): Room | null {
        if (this.room) return this.room;

        const lRoom = this.leftChild?.getRoomNextTo(target) ?? null;
        const rRoom = this.rightChild?.getRoomNextTo(target) ?? null;

        if (rRoom && this.getSharedWall(rRoom, target)) return rRoom;
        if (lRoom && this.getSharedWall(lRoom, target)) return lRoom;
        return null;
    }

    private createDoor(config: Config, l: Room, r: Room): void {
        const sharedWall = this.getSharedWall(r, l);
        if (!sharedWall) return;

        const isVertical = sharedWall.width < sharedWall.height;
        const wallWidth = isVertical ? sharedWall.height : sharedWall.width;
        const doorWidth = this.getDoorWidth(config, wallWidth);
        const margin = wallWidth - doorWidth;

        if (margin < 0) return;

        const door: Room = {
            rect: isVertical
                ? { x: sharedWall.x, y: sharedWall.y + Math.floor(Math.random() * margin), width: 1, height: doorWidth }
                : { x: sharedWall.x + Math.floor(Math.random() * margin), y: sharedWall.y, width: doorWidth, height: 1 },
            connections: []
        };

        this.doors.push(door);
        l.connections.push(r);
        r.connections.push(l);
    }

    private getSharedWall(r: Room, l: Room): Rect | null {
        if (!r || !l) return null;

        const shared = {
            x: Math.max(r.rect.x - 1, l.rect.x - 1),
            y: Math.max(r.rect.y - 1, l.rect.y - 1),
            width: Math.min(r.rect.x + r.rect.width + 1, l.rect.x + l.rect.width + 1) - Math.max(r.rect.x - 1, l.rect.x - 1),
            height: Math.min(r.rect.y + r.rect.height + 1, l.rect.y + l.rect.height + 1) - Math.max(r.rect.y - 1, l.rect.y - 1)
        };

        if (shared.width * shared.height < 3) return null;

        if (shared.width > 1) {
            shared.x += 1;
            shared.width -= 2;
        }
        if (shared.height > 1) {
            shared.y += 1;
            shared.height -= 2;
        }

        if (shared.width !== 1 && shared.height !== 1) return null;
        return shared;
    }

    private getDoorWidth(config: Config, max: number): number {
        const x = Math.floor(Math.random() * (config.SINGLE_DOOR_PROB + config.DOUBLE_DOOR_PROB + config.HALLWAY_DOOR_PROB));
        if (x < config.SINGLE_DOOR_PROB) return 1;
        if (x < config.SINGLE_DOOR_PROB + config.DOUBLE_DOOR_PROB) return Math.min(2, max);
        return max >= 3 ? Math.floor(Math.random() * (max - 2)) + 3 : max;
    }
}

export default BspMazeGenerator; 