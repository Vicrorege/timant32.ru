import React from 'react';
import { useTranslation } from 'react-i18next';

const ContactSection = ({ identity }) => {
  const { t } = useTranslation();

  return (
    <section id="contact" className="section-block contact-section">
      <div className="section-header">
        <h2 className="section-title">{t('section_contact', '03 / contact')}</h2>
      </div>

      <div className="contact-list">
        {/* Telegram */}
        <div className="contact-row">
          <span className="contact-key">telegram</span>
          <div className="contact-val">
            <a
              href={identity.links.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-link"
            >
              {identity.links.telegramHandle}
            </a>
            {identity.role === 'current' ? (
              <span className="contact-note">
                (legacy:{' '}
                <a
                  href={identity.links.telegramLegacyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-sublink"
                >
                  {identity.links.telegramLegacy}
                </a>
                )
              </span>
            ) : (
              <span className="contact-note">
                (current:{' '}
                <a
                  href={identity.links.telegramCurrentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-sublink"
                >
                  {identity.links.telegramCurrent}
                </a>
                )
              </span>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="contact-row">
          <span className="contact-key">email</span>
          <div className="contact-val">
            <a href={`mailto:${identity.links.email}`} className="contact-link">
              {identity.links.email}
            </a>
          </div>
        </div>

        {/* GitHub */}
        <div className="contact-row">
          <span className="contact-key">github</span>
          <div className="contact-val">
            <a
              href={identity.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-link"
            >
              github.com/{identity.links.githubHandle}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
