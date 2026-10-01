import React, { useEffect, useRef } from 'react';

const MatrixRain = ({ onFinish, durationMs = 7000 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Characters: katakana + latin + digits + symbols
    const chars = '0123456789ABCDEFｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ'.split('');
    const fontSize = 15;
    const columns = Math.floor(width / fontSize);
    const drops = Array(columns).fill(1);

    const primaryColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-primary')
      .trim() || '#00FF00';

    let animationId;
    let startTime = Date.now();

    const isReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);
      ctx.font = `${fontSize}px monospace`;
      ctx.fillStyle = primaryColor;
      for (let i = 0; i < columns; i++) {
        for (let j = 0; j < Math.floor(height / fontSize); j++) {
          if (Math.random() > 0.4) {
            ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * fontSize, j * fontSize);
          }
        }
      }
      const timer = setTimeout(() => onFinish?.(), 2000);
      return () => clearTimeout(timer);
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Leading char is bright white/primary, tail is primary
        ctx.fillStyle = Math.random() > 0.85 ? '#ffffff' : primaryColor;
        ctx.fillText(text, x, y);

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      if (Date.now() - startTime < durationMs) {
        animationId = requestAnimationFrame(draw);
      } else {
        onFinish?.();
      }
    };

    animationId = requestAnimationFrame(draw);

    const handleDismiss = () => {
      onFinish?.();
    };

    window.addEventListener('click', handleDismiss);
    window.addEventListener('keydown', handleDismiss);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('click', handleDismiss);
      window.removeEventListener('keydown', handleDismiss);
    };
  }, [durationMs, onFinish]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        backgroundColor: '#000000',
        cursor: 'pointer',
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'var(--color-primary)',
          fontSize: '0.85rem',
          fontFamily: 'var(--font-main)',
          opacity: 0.75,
          textShadow: '0 0 8px var(--glow-color)',
          pointerEvents: 'none',
        }}
      >
        [press any key or click to exit matrix]
      </div>
    </div>
  );
};

export default MatrixRain;
