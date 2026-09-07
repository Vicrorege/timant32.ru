import React, { useState, useEffect, useRef } from 'react';
import { resolveIngress } from '../tldTheme';

const BootScreen = ({ onFinish }) => {
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

  const [lines, setLines] = useState([bootSequence[0]]);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  useEffect(() => {
    let currentIndex = 1;
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
        finishTimer = setTimeout(() => onFinishRef.current?.(), 400);
      }
    }, 120);

    const handleSkip = () => {
      clearInterval(interval);
      clearTimeout(finishTimer);
      onFinishRef.current?.();
    };

    window.addEventListener('keydown', handleSkip);
    window.addEventListener('click', handleSkip);

    return () => {
      clearInterval(interval);
      clearTimeout(finishTimer);
      window.removeEventListener('keydown', handleSkip);
      window.removeEventListener('click', handleSkip);
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
        fontFamily: 'var(--font-main)',
        padding: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        fontSize: '1rem',
        cursor: 'pointer',
        userSelect: 'none',
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
      <div
        style={{
          marginTop: 'auto',
          fontSize: '0.75rem',
          color: 'var(--color-secondary-text)',
          opacity: 0.6,
        }}
      >
        [press any key or click to skip]
      </div>
    </div>
  );
};

export default BootScreen;
