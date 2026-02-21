import React from 'react';
import { useTranslation } from 'react-i18next';

const ContactWidget = () => {
  const { t } = useTranslation();

  return (
    <div 
      className="WidgetContainer" 
      onClick={() => window.open('https://t.me/tim_ant32', '_blank')}
      style={{ cursor: 'pointer', marginBottom: '20px' }}
    >
      <div className="WidgetIcon" style={{ color: 'var(--color-primary)' }}>💬</div>
      <div className="WidgetContent">
         <div className="WidgetTitle" style={{ color: 'var(--color-primary)' }}>
           {t('contact').replace(':', '')}
         </div>
         <div className="WidgetSubtitle">@tim_ant32</div>
      </div>
    </div>
  );
};

export default ContactWidget;