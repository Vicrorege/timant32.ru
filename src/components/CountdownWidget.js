import React, { useState, useEffect } from 'react';

const CountdownWidget = () => {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [targetName, setTargetName] = useState('FETCHING_DATA...');

  useEffect(() => {
    let targetDate = new Date().getTime();

    fetch('/countdown.json')
      .then(res => res.json())
      .then(data => {
        setTargetName(data.target);
        targetDate = new Date(data.date).getTime();
      })
      .catch(() => {
        setTargetName('UNKNOWN_TARGET');
      });

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
        return;
      }

      setTimeLeft({
        d: Math.floor(distance / (1000 * 60 * 60 * 24)),
        h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="WidgetContainer" style={{ marginBottom: '20px' }}>
      <div className="WidgetIcon" style={{ color: 'var(--color-primary)' }}>⏳</div>
      <div className="WidgetContent">
         <div className="WidgetTitle" style={{ color: 'var(--color-primary)' }}>
           {targetName}
         </div>
         <div className="WidgetSubtitle">
           T-Minus: {timeLeft.d}d {timeLeft.h}h {timeLeft.m}m {timeLeft.s}s
         </div>
      </div>
    </div>
  );
};

export default CountdownWidget;