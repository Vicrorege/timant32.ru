import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { resolveIdentity, setIdentityOverride, applyIdentityMetadata } from './identity';
import { applyIngressTheme, resolveIngress } from './tldTheme';
import HeroWidget from './components/HeroWidget';
import ProjectsWidget from './components/ProjectsWidget';
import LastFmWidget from './components/LastFmWidget';
import TelegramWidget from './components/TelegramWidget';
import StatusWidget from './components/StatusWidget';
import GithubWidget from './components/GithubWidget';
import ContactWidget from './components/ContactWidget';
import CountdownWidget from './components/CountdownWidget';
import AsciiVisualizerWidget from './components/AsciiVisualizerWidget';
import CalendarWidget from './components/CalendarWidget';
import CowsayWidget from './components/CowsayWidget';
import GameOfLifeWidget from './components/GameOfLifeWidget';
import BottomTerminal from './components/BottomTerminal';
import BootScreen from './components/BootScreen';
import MatrixRain from './components/MatrixRain';
import LanguageSwitcher from './components/LanguageSwitcher';
import './App.css';

function App() {
  const { t, i18n } = useTranslation();

  // 1. Identity & Ingress State
  const [identity, setIdentity] = useState(() => resolveIdentity());
  const [ingress, setIngress] = useState(() => resolveIngress());

  // 2. Interactive States
  const [isTerminalExpanded, setIsTerminalExpanded] = useState(false);
  const [matrixRain, setMatrixRain] = useState(false);
  const [isBooting, setIsBooting] = useState(!sessionStorage.getItem('booted'));
  const [asciiSize, setAsciiSize] = useState(null);

  // 3. Easter Egg States
  const [glitch, setGlitch] = useState(false);
  const [barrelRoll, setBarrelRoll] = useState(false);

  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';

  // Apply theme variables & SEO metadata
  useEffect(() => {
    const updated = applyIngressTheme();
    setIngress(updated);
  }, [identity]);

  useEffect(() => {
    applyIdentityMetadata(identity, i18n.language);
  }, [identity, i18n.language]);

  // Tab blur title change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        document.title = `[1]+  Stopped  ssh root@${identity.id}`;
      } else {
        applyIdentityMetadata(identity, i18n.language);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [identity, i18n.language]);

  // Global shortcut ~ (tilde) toggles bottom terminal
  useEffect(() => {
    const handleGlobalKey = (e) => {
      if (e.key === '`' || e.key === '~') {
        const tag = document.activeElement?.tagName?.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || document.activeElement?.isContentEditable) {
          return;
        }
        e.preventDefault();
        setIsTerminalExpanded((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  // Easter egg: sudo / rm -rf
  useEffect(() => {
    let buffer = '';
    const handleKeyDown = (e) => {
      if (e.key.length > 1 && e.key !== 'Backspace') return;
      if (e.key === 'Backspace') {
        buffer = buffer.slice(0, -1);
      } else {
        buffer += e.key;
      }
      if (buffer.length > 24) buffer = buffer.slice(-24);
      if (buffer.endsWith('sudo') || buffer.endsWith('rm -rf /')) {
        setGlitch(true);
        setTimeout(() => {
          setGlitch(false);
          buffer = '';
        }, 3000);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Easter egg: Konami code
  useEffect(() => {
    let konamiBuffer = [];
    const seq = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
    const handleKeyDown = (e) => {
      konamiBuffer.push(e.key.toLowerCase());
      if (konamiBuffer.length > 10) konamiBuffer.shift();
      if (konamiBuffer.join(',') === seq.join(',')) {
        setBarrelRoll(true);
        setTimeout(() => setBarrelRoll(false), 2000);
        konamiBuffer = [];
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Console message
  useEffect(() => {
    console.log(
      `%croot@${identity.id}%c: Arch Linux + React 19 = ♥\nIdentity: ${identity.brand} (${identity.role}) | Ingress: ${ingress.host}`,
      `color: ${identity.appearance.accentColor}; font-weight: bold; font-size: 14px;`,
      'color: inherit; font-size: 12px;'
    );
  }, [identity, ingress.host]);

  const handleBootFinish = useCallback(() => {
    sessionStorage.setItem('booted', 'true');
    setIsBooting(false);
  }, []);

  const handleSwitchIdentity = useCallback((targetId) => {
    setIdentityOverride(targetId);
    const next = resolveIdentity();
    setIdentity(next);
  }, []);

  const handleTerminalCommand = useCallback((cmd) => {
    if (cmd === 'matrix' || cmd === 'cmatrix') {
      setMatrixRain(true);
    } else if (cmd === 'reboot') {
      sessionStorage.removeItem('booted');
      setIsBooting(true);
    } else if (cmd === 'sudo') {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 3000);
    } else if (cmd.startsWith('theme')) {
      setIngress(resolveIngress());
    } else if (cmd.startsWith('ascii ')) {
      const parts = cmd.split(' ');
      if (parts[1] === 'auto') {
        setAsciiSize(null);
      } else if (parts.length === 3) {
        const w = parseInt(parts[1], 10);
        const h = parseInt(parts[2], 10);
        if (w >= 2 && w <= 24 && h >= 2 && h <= 20) {
          setAsciiSize({ w, h });
        }
      }
    }
  }, []);

  if (isBooting) {
    return <BootScreen onFinish={handleBootFinish} />;
  }

  if (currentPath !== '/') {
    return (
      <div className="App minimalist" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--color-text)', fontSize: '1.2rem', textAlign: 'left', padding: '20px', fontFamily: 'var(--font-main)' }}>
          <span style={{ color: '#ff3333' }}>root@{identity.id}</span>:<span style={{ color: '#5555ff' }}>~{currentPath}</span>$ cat index.html<br/>
          bash: {currentPath}: No such file or directory<br/><br/>
          <span style={{ opacity: 0.35, fontSize: '0.85rem' }}>;; connected via {identity.domain}</span><br/><br/>
          <a href="/" style={{ color: 'var(--color-primary)', textDecoration: 'none', borderBottom: '1px solid var(--color-primary)', cursor: 'pointer' }}>
            cd /
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`App minimalist ${glitch ? 'glitch-active' : ''} ${barrelRoll ? 'barrel-roll-active' : ''}`}>
      <main className="MainContent MinimalContent">
        {/* Top Floating Language Switcher */}
        <LanguageSwitcher />

        {/* Top System/Music Banner */}
        <div className="TopBannerContainer">
          <LastFmWidget />
        </div>

        {/* LEVEL 1: HERO / IDENTITY WINDOW */}
        <HeroWidget
          identity={identity}
          onSwitchIdentity={handleSwitchIdentity}
          onOpenTerminal={() => setIsTerminalExpanded(true)}
        />

        {/* LEVEL 2 & 3: TILED TWO-COLUMN DASHBOARD */}
        <div className="TwoColumns">
          {/* Left Column: Curated Projects + Telegram Proxy */}
          <div className="LeftColumn">
            <ProjectsWidget />
            <div className="TelegramContainer">
              <TelegramWidget
                key={i18n.language}
                channel={t('telegram_channel')}
                postId={t('telegram_post_id')}
              />
            </div>
          </div>

          {/* Right Column: System & Secondary Widgets */}
          <div className="SideWidgets">
            <StatusWidget />
            <GithubWidget />
            <ContactWidget identity={identity} />
            <CountdownWidget />
            <AsciiVisualizerWidget
              width={asciiSize?.w}
              height={asciiSize?.h}
            />
            <CalendarWidget />
            <CowsayWidget />
            <GameOfLifeWidget />
          </div>
        </div>

        {/* LEVEL 3 EASTER EGG: INTERACTIVE TERMINAL AT THE VERY BOTTOM */}
        <BottomTerminal
          identity={identity}
          isExpanded={isTerminalExpanded}
          onToggleExpand={setIsTerminalExpanded}
          onCommand={handleTerminalCommand}
        />

        {/* Subtle Footer */}
        <footer className="DashboardFooter">
          <span>root@{identity.domain} · Arch Linux · {new Date().getFullYear()}</span>
          <span style={{ opacity: 0.45 }}>[ press ~ for shell ]</span>
        </footer>

        {/* Fullscreen Matrix Screensaver (Easter egg / command) */}
        {matrixRain && <MatrixRain onFinish={() => setMatrixRain(false)} />}
      </main>
    </div>
  );
}

export default App;
