import { useState, useEffect } from 'react'

interface Room {
  x: number
  y: number
  width: number
  height: number
}

class Node {
  x: number
  y: number
  width: number
  height: number
  left: Node | null = null
  right: Node | null = null
  room: Room | null = null
  isVerticalSplit: boolean = false

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }

  split() {
    this.isVerticalSplit = Math.random() > 0.5

    if (!this.isVerticalSplit && this.height > 12) {
      const splitAt = Math.floor(this.height / 2)
      this.left = new Node(this.x, this.y, this.width, splitAt)
      this.right = new Node(this.x, this.y + splitAt + 1, this.width, this.height - splitAt - 1)
      return true
    } else if (this.isVerticalSplit && this.width > 12) {
      const splitAt = Math.floor(this.width / 2)
      this.left = new Node(this.x, this.y, splitAt, this.height)
      this.right = new Node(this.x + splitAt + 1, this.y, this.width - splitAt - 1, this.height)
      return true
    }
    return false
  }

  createRoom() {
    this.room = {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    }
  }

  addDoor(grid: string[][]) {
    if (!this.left?.room || !this.right?.room) return

    const leftRoom = this.left.room
    const rightRoom = this.right.room

    if (this.isVerticalSplit) {
      // Vertical split means we need a door on the vertical wall
      const doorY = Math.floor((Math.max(leftRoom.y, rightRoom.y) + 
                              Math.min(leftRoom.y + leftRoom.height, rightRoom.y + rightRoom.height)) / 2)
      const doorX = leftRoom.x + leftRoom.width
      grid[doorX][doorY] = '>'
    } else {
      // Horizontal split means we need a door on the horizontal wall
      const doorX = Math.floor((Math.max(leftRoom.x, rightRoom.x) + 
                              Math.min(leftRoom.x + leftRoom.width, rightRoom.x + rightRoom.width)) / 2)
      const doorY = leftRoom.y + leftRoom.height
      grid[doorX][doorY] = '^'
    }
  }
}

function maze(width: number, height: number): string[][] {
  const grid = Array(width).fill(null).map(() => Array(height).fill('#'))
  
  const root = new Node(1, 1, width - 2, height - 2)
  const nodes: Node[] = [root]
  
  // Split nodes up to 8 times
  for (let i = 0; i < 8 && i < nodes.length; i++) {
    if (nodes[i].split()) {
      nodes.push(nodes[i].left!, nodes[i].right!)
    }
  }

  // Create rooms in leaf nodes
  nodes.forEach(node => {
    if (!node.left && !node.right) {
      node.createRoom()
      if (node.room) {
        // Carve the room
        for (let x = node.room.x; x < node.room.x + node.room.width; x++) {
          for (let y = node.room.y; y < node.room.y + node.room.height; y++) {
            if (x >= 0 && x < width && y >= 0 && y < height) {
              grid[x][y] = '.'
            }
          }
        }
      }
    }
  })

  // Add doors between rooms using BSP tree structure
  nodes.forEach(node => {
    node.addDoor(grid)
  })

  return grid
}

function App() {
  const [grid, setGrid] = useState<string[][]>([])

  useEffect(() => {
    setGrid(maze(30, 30))
  }, [])

  return (
    <div style={{ 
      fontFamily: 'monospace', 
      whiteSpace: 'pre',
      lineHeight: '1',
      fontSize: '14px',
      padding: '20px'
    }}>
      {grid.map((row, i) => (
        <div key={i}>
          {row.map((cell, j) => (
            <span key={j} style={{
              color: cell === '#' ? '#666' : 
                     cell === '.' ? '#fff' :
                     '#ffd700'
            }}>
              {cell}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

export default App
