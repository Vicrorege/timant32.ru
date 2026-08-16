import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const checkReachable = async (url) => {
  const res = await fetch(url, { method: 'GET', cache: 'no-store' });
  // 2xx/3xx (and some 401/403 login walls) mean the host answered
  if (res.status > 0 && res.status < 500) return 'online';
  return 'offline';
};

const StatusWidget = () => {
  const { t } = useTranslation();
  const [siteStatus, setSiteStatus] = useState('checking');
  const [mailStatus, setMailStatus] = useState('checking');
  const [mcStatus, setMcStatus] = useState('checking');

  useEffect(() => {
    let cancelled = false;

    const probe = async () => {
      try {
        const res = await fetch('/api/status/site', { cache: 'no-store' });
        if (!cancelled) setSiteStatus(res.ok ? 'online' : 'offline');
      } catch (error) {
        console.warn('[status] site probe failed', error);
        if (!cancelled) setSiteStatus('offline');
      }

      try {
        const status = await checkReachable('/api/status/mail');
        if (!cancelled) setMailStatus(status);
      } catch (error) {
        console.warn('[status] mail probe failed', error);
        if (!cancelled) setMailStatus('offline');
      }

      try {
        const res = await fetch('/api/status/mc', { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setMcStatus(data.online ? 'online' : 'offline');
      } catch (error) {
        console.warn('[status] mc probe failed', error);
        if (!cancelled) setMcStatus('offline');
      }
    };

    probe();
    const interval = setInterval(probe, 60000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const getColor = (status) => {
    if (status === 'online') return 'var(--color-primary)';
    if (status === 'offline') return '#ff3333';
    return 'var(--color-text)';
  };

  return (
    <div className="WidgetContainer hide-on-mobile" style={{ marginBottom: '20px', flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(0, 255, 0, 0.3)', paddingBottom: '8px', marginBottom: '12px' }}>
        <span style={{ backgroundColor: 'var(--color-primary)', color: '#000', padding: '2px 6px', borderRadius: '3px', marginRight: '10px', fontSize: '0.9rem', textShadow: 'none' }}>🖥️</span>
        <span style={{ color: 'var(--color-primary)', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.85rem' }}>{t('servers')}</span>
      </div>
      <div className="WidgetContent" style={{ width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.85rem', color: 'var(--color-text)' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ color: getColor(siteStatus), marginRight: '8px', fontSize: '12px' }}>●</span>
            <span>timant32.ru</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
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
