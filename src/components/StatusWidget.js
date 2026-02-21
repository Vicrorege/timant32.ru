import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const StatusWidget = () => {
  const { t } = useTranslation();
  const [siteStatus, setSiteStatus] = useState('checking');
  const [mailStatus, setMailStatus] = useState('checking');
  const [mcStatus, setMcStatus] = useState('checking');

  useEffect(() => {
    fetch('/')
      .then(res => setSiteStatus(res.ok ? 'online' : 'offline'))
      .catch(() => setSiteStatus('offline'));

    fetch('https://mail.timant32.su', { mode: 'no-cors' })
      .then(() => setMailStatus('online'))
      .catch(() => setMailStatus('offline'));

    fetch('https://api.mcsrvstat.us/2/mc.timant32.ru')
      .then(res => res.json())
      .then(data => setMcStatus(data.online ? 'online' : 'offline'))
      .catch(() => setMcStatus('offline'));
  }, []);

  const getColor = (status) => {
    if (status === 'online') return 'var(--color-primary)';
    if (status === 'offline') return '#ff3333';
    return 'var(--color-text)';
  };

  return (
    <div className="WidgetContainer" style={{ marginBottom: '20px' }}>
      <div className="WidgetIcon" style={{ color: 'var(--color-primary)' }}>🖥️</div>
      <div className="WidgetContent">
        <div className="WidgetTitle" style={{ color: 'var(--color-primary)' }}>{t('servers')}</div>
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