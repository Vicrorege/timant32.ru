import React, { useState, useEffect } from 'react';

const BootScreen = ({ onFinish }) => {
  const [lines, setLines] = useState([]);
  const bootSequence = [
    "[  OK  ] Mounted Root Filesystem.",
    "[  OK  ] Reached target Local File Systems.",
    "[  OK  ] Started React Framework.",
    "[  OK  ] Started Nginx Web Server.",
    "[  OK  ] Started Mailcow Server.",
    "[  OK  ] Reached target Graphical Interface.",
    "Starting timant32.ru..."
  ];

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < bootSequence.length) {
        const nextLine = bootSequence[currentIndex];
        if (nextLine) {
          setLines(prev => [...prev, nextLine]);
        }
        currentIndex++;
      } else {
        clearInterval(interval);
        setTimeout(onFinish, 600);
      }
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: '#030303', color: '#E0E0E0',
      fontFamily: 'Consolas, monospace', padding: '20px', zIndex: 9999,
      display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
      fontSize: '1rem'
    }}>
      {lines.map((line, i) => (
        <div key={i}>
          {line && line.startsWith('[') ? (
            <>
              [ <span style={{ color: '#00FF00' }}>OK</span> ] {line.substring(8)}
            </>
          ) : line}
        </div>
      ))}
    </div>
  );
};

export default BootScreen;