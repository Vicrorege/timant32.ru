import React, { useState, useEffect, useRef } from 'react';
import { resolveIngress } from '../tldTheme';

const BootScreen = ({ onFinish }) => {
  const [lines, setLines] = useState([]);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  useEffect(() => {
    const ingress = resolveIngress();
    const bootSequence = [
      '[  OK  ] Mounted Root Filesystem.',
      '[  OK  ] Reached target Local File Systems.',
      `[  OK  ] Bound virtual host ${ingress.host}.`,
      `[  OK  ] Applied accent profile (${ingress.tierLabel} / .${ingress.tld}).`,
      '[  OK  ] Started React Framework.',
      '[  OK  ] Started Nginx Web Server.',
      '[  OK  ] Started Mailcow Server.',
      '[  OK  ] Reached target Graphical Interface.',
      `Starting ${ingress.host}...`,
    ];

    let currentIndex = 0;
    let finishTimer;

    const interval = setInterval(() => {
      if (currentIndex < bootSequence.length) {
        const nextLine = bootSequence[currentIndex];
        if (nextLine) {
          setLines((prev) => [...prev, nextLine]);
        }
        currentIndex++;
      } else {
        clearInterval(interval);
        finishTimer = setTimeout(() => onFinishRef.current?.(), 600);
      }
    }, 150);

    return () => {
      clearInterval(interval);
      clearTimeout(finishTimer);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#030303',
        color: '#E0E0E0',
        fontFamily: 'Consolas, monospace',
        padding: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        fontSize: '1rem',
      }}
    >
      {lines.map((line, i) => (
        <div key={i}>
          {line && line.startsWith('[') ? (
            <>
              [ <span style={{ color: 'var(--color-primary)' }}>OK</span> ] {line.substring(8)}
            </>
          ) : (
            line
          )}
        </div>
      ))}
    </div>
  );
};

export default BootScreen;
