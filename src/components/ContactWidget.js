import React from 'react';
import { useTranslation } from 'react-i18next';

const ContactWidget = () => {
  const { t } = useTranslation();

  return (
    <div className="WidgetContainer" style={{ marginBottom: '20px', flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(0, 255, 0, 0.3)', paddingBottom: '8px', marginBottom: '12px' }}>
        <span style={{ backgroundColor: 'var(--color-primary)', color: '#000', padding: '2px 6px', borderRadius: '3px', marginRight: '10px', fontSize: '0.9rem', textShadow: 'none' }}>✉️</span>
        <span style={{ color: 'var(--color-primary)', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.85rem' }}>{t('contacts', 'Contacts')}</span>
      </div>
      <div className="WidgetContent" style={{ width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.85rem', color: 'var(--color-text)' }}>
          <div style={{ marginBottom: '6px' }}>
            <span style={{ color: 'var(--color-primary)', marginRight: '8px' }}>E-MAIL:</span>
            <a href="mailto:me@timant32.ru" style={{ color: 'inherit', textDecoration: 'none' }}>me@timant32.ru</a>
          </div>
          <div>
            <span style={{ color: 'var(--color-primary)', marginRight: '8px' }}>TELEGRAM:</span>
            <a href="https://t.me/tim_ant32" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>@tim_ant32</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactWidget;