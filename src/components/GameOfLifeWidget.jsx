import React, { useState, useEffect } from 'react';

const GameOfLifeWidget = () => {
  const [gridData, setGridData] = useState('');
  const rows = 20;
  const cols = 38;

  useEffect(() => {
    let grid = Array(rows).fill().map(() => Array(cols).fill(false));
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        grid[i][j] = Math.random() > 0.7;
      }
    }

    const interval = setInterval(() => {
      let nextGrid = Array(rows).fill().map(() => Array(cols).fill(false));
      let changed = false;

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          let neighbors = 0;
          for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
              if (x === 0 && y === 0) continue;
              const ni = i + x;
              const nj = j + y;
              if (ni >= 0 && ni < rows && nj >= 0 && nj < cols && grid[ni][nj]) {
                neighbors++;
              }
            }
          }

          if (grid[i][j] && (neighbors === 2 || neighbors === 3)) {
            nextGrid[i][j] = true;
          } else if (!grid[i][j] && neighbors === 3) {
            nextGrid[i][j] = true;
            changed = true;
          } else if (grid[i][j]) {
            changed = true;
          }
        }
      }

      if (!changed) {
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < cols; j++) {
            nextGrid[i][j] = Math.random() > 0.7;
          }
        }
      }

      grid = nextGrid;

      let out = '';
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          out += grid[i][j] ? '█' : '·';
        }
        out += '\n';
      }
      setGridData(out);
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="WidgetContainer hide-on-mobile" style={{ marginBottom: '0', flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(0, 255, 0, 0.3)', paddingBottom: '8px', marginBottom: '12px' }}>
        <span style={{ backgroundColor: 'var(--color-primary)', color: '#000', padding: '2px 6px', borderRadius: '3px', marginRight: '10px', fontSize: '0.9rem', textShadow: 'none' }}>🧬</span>
        <span style={{ color: 'var(--color-primary)', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.85rem' }}>Game of Life</span>
      </div>
      <div className="WidgetContent" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
        <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: '8px', padding: '15px' }}>
          <pre style={{ color: 'var(--color-primary)', fontSize: '8px', lineHeight: '8px', letterSpacing: '2px', margin: 0 }}>
            {gridData}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default GameOfLifeWidget;