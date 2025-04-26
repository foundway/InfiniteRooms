// Reference: https://github.com/RealiteerCorp/Cheers/blob/master/Assets/_Cheers/_BSPMaze/Scripts/BspMaze.cs

import { useState, useEffect } from 'react'
import RoomGenerator from './RoomGenerator'

function App() {
  const [grid, setGrid] = useState<string[][]>([])

  useEffect(() => {
    const generator = new RoomGenerator({
      SEED: Math.floor(Math.random() * 1000)
    });
    setGrid(generator.setGrid());
  }, [])

  return (
    <div style={{ 
      fontFamily: 'monospace', 
      whiteSpace: 'pre',
      lineHeight: '1.2',
      fontSize: '14px',
    }}>
      {grid.map((row, i) => (
        <div key={i}>
          {row.map((cell, j) => (
            <span key={j} style={{
              color: cell === '# ' ? '#666' : 
                     cell === '. ' ? '#eee' :
                     cell === 'o ' ? '#ffd700' : 
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
