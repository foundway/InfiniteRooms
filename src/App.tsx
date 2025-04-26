// Reference: https://github.com/RealiteerCorp/Cheers/blob/master/Assets/_Cheers/_BSPMaze/Scripts/BspMaze.cs

import { useState, useEffect } from 'react'
import BspMazeGenerator from './BspMazeGenerator'

function App() {
  const [grid, setGrid] = useState<string[][]>([])

  useEffect(() => {
    const generator = new BspMazeGenerator({
      SEED: Math.floor(Math.random() * 1000)
    });
    setGrid(generator.setGrid());
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
                     cell === 'o' ? '#ffd700' : 
                     '#fff'
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
