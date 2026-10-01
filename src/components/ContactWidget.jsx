import React from 'react';
import { useTranslation } from 'react-i18next';

const ContactWidget = ({ identity }) => {
  const { t } = useTranslation();

  const isCurrent = identity?.role === 'current';
  const email = identity?.links?.email || (isCurrent ? 'me@vicrorege.com' : 'me@timant32.ru');
  const tgLink = identity?.links?.telegram || (isCurrent ? 'https://t.me/vicrorege' : 'https://t.me/tim_ant32');
  const tgHandle = identity?.links?.telegramHandle || (isCurrent ? '@vicrorege' : '@tim_ant32');
  const tgAltLink = isCurrent ? 'https://t.me/tim_ant32' : 'https://t.me/vicrorege';
  const tgAltHandle = isCurrent ? '@tim_ant32' : '@vicrorege';
  const altRoleLabel = isCurrent ? 'legacy' : 'current';

  return (
    <div
      className="WidgetContainer ContactWidget"
      style={{ marginBottom: '20px', flexDirection: 'column', alignItems: 'stretch' }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '8px',
          marginBottom: '12px',
        }}
      >
        <span
          style={{
            backgroundColor: 'var(--color-primary)',
            color: '#000',
            padding: '2px 6px',
            borderRadius: '3px',
            marginRight: '10px',
            fontSize: '0.9rem',
            textShadow: 'none',
          }}
        >
          ✉️
        </span>
        <span
          style={{
            color: 'var(--color-primary)',
            fontWeight: 'bold',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            fontSize: '0.85rem',
          }}
        >
          {t('contacts', 'Contacts')}
        </span>
      </div>

      <div className="WidgetContent" style={{ width: '100%' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontSize: '0.85rem',
            color: 'var(--color-text)',
            gap: '8px',
          }}
        >
          <div>
            <span style={{ color: 'var(--color-primary)', marginRight: '8px' }}>E-MAIL:</span>
            <a href={`mailto:${email}`} style={{ color: 'inherit', textDecoration: 'none' }}>
              {email}
            </a>
          </div>

          <div>
            <span style={{ color: 'var(--color-primary)', marginRight: '8px' }}>TELEGRAM:</span>
            <a
              href={tgLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              {tgHandle}
            </a>
            <span style={{ color: 'var(--color-secondary-text)', fontSize: '0.78rem', marginLeft: '6px' }}>
              ({altRoleLabel}:{' '}
              <a
                href={tgAltLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--color-text)', opacity: 0.8, textDecoration: 'none' }}
              >
                {tgAltHandle}
              </a>
              )
            </span>
          </div>

          <div>
            <span style={{ color: 'var(--color-primary)', marginRight: '8px' }}>GITHUB:</span>
            <a
              href="https://github.com/Vicrorege"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              github.com/Vicrorege
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactWidget;
