import React, { useState, useEffect, useRef } from 'react';

const AsciiVisualizerWidget = ({ width = 10, height = 5 }) => {
  const [gridData, setGridData] = useState([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    let currentFrames = [];
    let frameIdx = 0;

    const generateFrames = () => {
      const targetSolvable = Math.random() > 0.2;
      let baseGrid, finalPath;
      let found = false;
      let attempts = 0;
      let parent = new Map();
      const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];

      while (true) {
        attempts++;
        baseGrid = Array(height).fill().map(() => Array(width).fill('.'));
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            if (Math.random() < 0.25) baseGrid[y][x] = '#';
          }
        }
        baseGrid[0][0] = 'S';
        baseGrid[height - 1][width - 1] = 'E';

        let bfsQueue = [[0,0]];
        let bfsVisited = new Set(['0,0']);
        parent.clear();
        found = false;

        while(bfsQueue.length > 0) {
          let [x, y] = bfsQueue.shift();
          if (x === width - 1 && y === height - 1) {
            found = true;
            break;
          }
          for (let [dx, dy] of dirs) {
            let nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height && baseGrid[ny][nx] !== '#' && !bfsVisited.has(`${nx},${ny}`)) {
              bfsVisited.add(`${nx},${ny}`);
              parent.set(`${nx},${ny}`, [x, y]);
              bfsQueue.push([nx, ny]);
            }
          }
        }

        if (found === targetSolvable) break;
        if (attempts > 500) break;
      }

      if (found) {
        finalPath = [];
        let curr = [width - 1, height - 1];
        while (curr[0] !== 0 || curr[1] !== 0) {
          finalPath.push(curr);
          curr = parent.get(`${curr[0]},${curr[1]}`);
        }
        finalPath.push([0, 0]);
        finalPath.reverse();
      }

      const frames = [];
      const render = (currentWave, currentPath, isError = false) => {
        let rows = [];
        for (let y = 0; y < height; y++) {
          let cols = [];
          for (let x = 0; x < width; x++) {
            if (isError) {
              cols.push({ char: '!', color: '#ff3333' });
            } else if (x === 0 && y === 0) {
              cols.push({ char: 'S', color: '#00ff00' });
            } else if (x === width - 1 && y === height - 1) {
              cols.push({ char: 'E', color: '#00ff00' });
            } else if (baseGrid[y][x] === '#') {
              cols.push({ char: '#', color: 'var(--color-text)' });
            } else {
              const pathIdx = currentPath ? currentPath.findIndex(p => p[0] === x && p[1] === y) : -1;
              if (pathIdx !== -1) {
                cols.push({ char: '*', color: '#ff3333' });
              } else {
                const waveIdx = currentWave ? currentWave.findIndex(w => w[0] === x && w[1] === y) : -1;
                cols.push({ char: waveIdx !== -1 ? 'o' : '.', color: waveIdx !== -1 ? 'var(--color-primary)' : 'var(--color-text)' });
              }
            }
          }
          rows.push(cols);
        }
        return rows;
      };

      frames.push(render([], []));
      frames.push(render([], []));

      let queue = [[0, 0]];
      let waveVisitedSet = new Set(['0,0']);
      let waveFound = false;

      while (queue.length > 0 && !waveFound) {
        let nextQueue = [];
        let currentWave = [];
        for (let i = 0; i < queue.length; i++) {
          let [x, y] = queue[i];
          if (!(x === 0 && y === 0) && !(x === width - 1 && y === height - 1)) {
            currentWave.push([x, y]);
          }
          for (let [dx, dy] of dirs) {
            let nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height && baseGrid[ny][nx] !== '#' && !waveVisitedSet.has(`${nx},${ny}`)) {
              waveVisitedSet.add(`${nx},${ny}`);
              nextQueue.push([nx, ny]);
              if (nx === width - 1 && ny === height - 1) waveFound = true;
            }
          }
        }
        if (currentWave.length > 0) frames.push(render(currentWave, []));
        queue = nextQueue;
      }

      frames.push(render([], []));

      if (found) {
        let pathTrace = [];
        for (let i = 1; i < finalPath.length - 1; i++) {
          pathTrace.push(finalPath[i]);
          frames.push(render([], [...pathTrace]));
        }
        for (let i = 0; i < 15; i++) frames.push(render([], [...finalPath.slice(1, -1)]));
      } else {
        const flash = render([], [], true);
        const empty = render([], []);
        for (let i = 0; i < 4; i++) { frames.push(flash); frames.push(empty); }
        for (let i = 0; i < 3; i++) frames.push(flash);
      }
      return frames;
    };

    currentFrames = generateFrames();
    setGridData(currentFrames[0]);

    intervalRef.current = setInterval(() => {
      frameIdx++;
      if (frameIdx >= currentFrames.length) {
        currentFrames = generateFrames();
        frameIdx = 0;
      }
      setGridData(currentFrames[frameIdx]);
    }, 150);

    return () => clearInterval(intervalRef.current);
  }, [width, height]);

  return (
    <div className="WidgetContainer hide-on-mobile" style={{ marginBottom: '20px', flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(0, 255, 0, 0.3)', paddingBottom: '8px', marginBottom: '12px' }}>
        <span style={{ backgroundColor: 'var(--color-primary)', color: '#000', padding: '2px 6px', borderRadius: '3px', marginRight: '10px', fontSize: '0.9rem', textShadow: 'none' }}>🤖</span>
        <span style={{ color: 'var(--color-primary)', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.85rem' }}>BFS Pathfinding</span>
      </div>
      <div className="WidgetContent" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <div style={{ fontFamily: 'Consolas, monospace', fontSize: '0.85rem', marginTop: '8px', lineHeight: '1.2', whiteSpace: 'pre' }}>
          {gridData.map((row, y) => (
            <div key={y}>
              {row.map((cell, x) => (
                <span key={x} style={{ color: cell.color }}>{cell.char} </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AsciiVisualizerWidget;