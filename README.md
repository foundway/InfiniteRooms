# Infinite Rooms

A procedural room generator using Binary Space Partitioning (BSP) algorithm to create connected rooms and hallways.

## Features

- Generates random room layouts using BSP
- Creates connected rooms with single doors and hallways
- Configurable parameters for room size, count, and layout
- Seeded random generation for reproducible results

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/foundway/InfiniteRooms.git
cd InfiniteRooms
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

## Configuration

The room generator can be configured with the following parameters:

- `MAP_WIDTH`: Width of the map (default: 40)
- `MAP_HEIGHT`: Height of the map (default: 40)
- `MAX_LEAVES_COUNT`: Maximum number of rooms (default: 100)
- `MIN_SIZE`: Minimum room size (default: 6)
- `MAX_SIZE`: Maximum room size (default: 20)
- `QUIT_RATE`: Probability to stop splitting (default: 0.1)
- `HALLWAY_DOOR_PROB`: Probability of creating a hallway instead of a single door (default: 0.3)

## License

MIT License
