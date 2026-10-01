import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const Hero = ({ identity, onOpenTerminal, onSwitchIdentity }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith('ru') ? 'ru' : 'en';

  const titleText = identity.heroTitle;
  const [displayedTitle, setDisplayedTitle] = useState('');
  const [typingComplete, setTypingComplete] = useState(false);

  // Check prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setDisplayedTitle(titleText);
      setTypingComplete(true);
      return;
    }

    setDisplayedTitle('');
    setTypingComplete(false);

    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      setDisplayedTitle(titleText.slice(0, idx));
      if (idx >= titleText.length) {
        clearInterval(interval);
        setTypingComplete(true);
      }
    }, 60);

    return () => clearInterval(interval);
  }, [titleText]);

  const tagline = identity.tagline[lang] || identity.tagline.ru;
  const subtagline = identity.subtagline[lang] || identity.subtagline.ru;
  const statusNote = identity.statusText[lang] || identity.statusText.ru;
  const altBadge = identity.altBadgeText[lang] || identity.altBadgeText.ru;

  const scrollToSection = (id) => (e) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="hero-container">
      {/* Identity bridge tag */}
      <div className="hero-identity-tag">
        <a
          href={`https://${identity.altDomain}`}
          onClick={(e) => {
            if (onSwitchIdentity) {
              e.preventDefault();
              onSwitchIdentity(identity.role === 'current' ? 'timant32' : 'vicrorege');
            }
          }}
          className="identity-bridge-link"
          title={identity.role === 'current' ? 'Legacy identity' : 'Current identity'}
        >
          <span className="identity-bridge-dot">⤷</span> {altBadge}
        </a>
      </div>

      <div className="hero-main">
        <h1 className="hero-title">
          {displayedTitle}
          {!typingComplete && <span className="hero-cursor">▌</span>}
        </h1>
        <div className="hero-subtitle">{identity.heroSubtitle}</div>

        <p className="hero-description">{tagline}</p>
        <p className="hero-subdescription">{subtagline}</p>

        <nav className="hero-actions" aria-label="Quick links">
          <a
            href="#projects"
            onClick={scrollToSection('projects')}
            className="hero-action-link"
          >
            projects
          </a>
          <span className="hero-action-sep">/</span>
          <a
            href={identity.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="hero-action-link"
          >
            github
          </a>
          <span className="hero-action-sep">/</span>
          <a
            href={identity.links.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="hero-action-link"
          >
            telegram
          </a>
          <span className="hero-action-sep">/</span>
          <a
            href={`mailto:${identity.links.email}`}
            className="hero-action-link"
          >
            email
          </a>
          <span className="hero-action-sep">/</span>
          <button
            type="button"
            onClick={onOpenTerminal}
            className="hero-terminal-btn"
            title="Open terminal (press ~)"
          >
            &gt;_ terminal
          </button>
        </nav>

        <div className="hero-status">
          <span className="status-indicator-dot" />
          <span className="status-indicator-text">{statusNote}</span>
          <span className="hero-status-domain">;; {identity.domain}</span>
        </div>
      </div>
    </header>
  );
};

export default Hero;
