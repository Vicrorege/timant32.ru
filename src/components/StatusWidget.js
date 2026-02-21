import React, { useState, useEffect } from 'react';

const StatusWidget = () => {
  const [siteStatus, setSiteStatus] = useState('checking');
  const [mailStatus, setMailStatus] = useState('checking');
  const mcStatus = 'offline';

  useEffect(() => {
    fetch('/')
      .then(res => setSiteStatus(res.ok ? 'online' : 'offline'))
      .catch(() => setSiteStatus('offline'));

    fetch('/api/calendar')
      .then(res => setMailStatus(res.ok ? 'online' : 'offline'))
      .catch(() => setMailStatus('offline'));
  }, []);

  const getColor = (status) => {
    if (status === 'online') return '#00FF00';
    if (status === 'offline') return '#ff3333';
    return '#aaaaaa';
  };

  return (
    <div className="WidgetContainer" style={{ marginBottom: '20px' }}>
      <div className="WidgetIcon" style={{ color: '#00FF00' }}>🖥️</div>
      <div className="WidgetContent">
        <div className="WidgetTitle">серверы</div>
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: '8px', fontSize: '0.85rem', color: 'var(--color-text)' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ color: getColor(siteStatus), marginRight: '8px', fontSize: '12px' }}>●</span>
            <span>timant32.ru</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ color: getColor(mailStatus), marginRight: '8px', fontSize: '12px' }}>●</span>
            <span>mail.timant32.su</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ color: getColor(mcStatus), marginRight: '8px', fontSize: '12px' }}>●</span>
            <span>mc.timant32.ru</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusWidget;