import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const HeroWidget = ({ identity, onSwitchIdentity, onOpenTerminal }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith('ru') ? 'ru' : 'en';

  const titleText = identity.heroTitle;
  const [displayedTitle, setDisplayedTitle] = useState('');
  const [isTyped, setIsTyped] = useState(false);

  useEffect(() => {
    const isReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) {
      setDisplayedTitle(titleText);
      setIsTyped(true);
      return;
    }

    setDisplayedTitle('');
    setIsTyped(false);

    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      setDisplayedTitle(titleText.slice(0, idx));
      if (idx >= titleText.length) {
        clearInterval(interval);
        setIsTyped(true);
      }
    }, 60);

    return () => clearInterval(interval);
  }, [titleText]);

  const tagline = identity.tagline[lang] || identity.tagline.ru;
  const subtagline = identity.subtagline[lang] || identity.subtagline.ru;
  const statusNote = identity.statusText[lang] || identity.statusText.ru;
  const altBadge = identity.altBadgeText[lang] || identity.altBadgeText.ru;

  const scrollToProjects = (e) => {
    e.preventDefault();
    const el = document.getElementById('projects-widget');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="WidgetContainer HeroWindow">
      {/* Window Titlebar */}
      <div className="hero-window-titlebar">
        <div className="hero-window-dots">
          <span className="dot red" />
          <span className="dot yellow" />
          <span className="dot green" />
          <span className="hero-window-path">
            root@{identity.id}: ~/identity
          </span>
        </div>
        <div className="hero-window-bridge">
          <a
            href={`https://${identity.altDomain}`}
            onClick={(e) => {
              if (onSwitchIdentity) {
                e.preventDefault();
                onSwitchIdentity(identity.role === 'current' ? 'timant32' : 'vicrorege');
              }
            }}
            className="hero-bridge-link"
            title={identity.role === 'current' ? 'Legacy identity' : 'Current identity'}
          >
            ⤷ {altBadge}
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="hero-window-body">
        <div className="hero-header-row">
          <h1 className="hero-main-title">
            {displayedTitle}
            {!isTyped && <span className="hero-title-cursor">▌</span>}
          </h1>
          <span className="hero-main-subtitle">{identity.heroSubtitle}</span>
        </div>

        <p className="hero-text-line">{tagline}</p>
        <p className="hero-tech-line">{subtagline}</p>

        {/* Quick actions & live status */}
        <div className="hero-window-footer">
          <div className="hero-quick-links">
            <a href="#projects" onClick={scrollToProjects} className="hero-link">
              [ projects ]
            </a>
            <a
              href={identity.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="hero-link"
            >
              [ github ]
            </a>
            <a
              href={identity.links.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="hero-link"
            >
              [ telegram ]
            </a>
            <a
              href={`mailto:${identity.links.email}`}
              className="hero-link"
            >
              [ email ]
            </a>
            <button
              type="button"
              onClick={onOpenTerminal}
              className="hero-shell-trigger"
              title="Jump to shell (~)"
            >
              [ &gt;_ shell ]
            </button>
          </div>

          <div className="hero-live-status">
            <span className="hero-status-dot" />
            <span className="hero-status-label">{statusNote}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroWidget;
