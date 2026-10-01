import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  resolveIdentity,
  setIdentityOverride,
  applyIdentityMetadata,
} from './identity';
import { applyIngressTheme, resolveIngress } from './tldTheme';
import Hero from './components/Hero';
import Projects from './components/Projects';
import NowActivity from './components/NowActivity';
import ContactSection from './components/ContactSection';
import DevRandom from './components/DevRandom';
import Terminal from './components/Terminal';
import BootScreen from './components/BootScreen';
import MatrixRain from './components/MatrixRain';
import LanguageSwitcher from './components/LanguageSwitcher';
import './App.css';

function App() {
  const { t, i18n } = useTranslation();

  // 1. Identity & Ingress State
  const [identity, setIdentity] = useState(() => resolveIdentity());
  const [ingress, setIngress] = useState(() => resolveIngress());

  // 2. Interactive Secondary Layers State
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [matrixRain, setMatrixRain] = useState(false);
  const [devRandomExp, setDevRandomExp] = useState(null);
  const [isBooting, setIsBooting] = useState(!sessionStorage.getItem('booted'));

  // 3. Easter Egg States
  const [glitch, setGlitch] = useState(false);
  const [barrelRoll, setBarrelRoll] = useState(false);

  // Sync theme and metadata when identity, ingress, or language changes
  useEffect(() => {
    const updatedIngress = applyIngressTheme();
    setIngress(updatedIngress);
  }, [identity]);

  useEffect(() => {
    applyIdentityMetadata(identity, i18n.language);
  }, [identity, i18n.language]);

  // Handle Tab blur title change
  useEffect(() => {
    const originalTitle = document.title;
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

  // Terminal shortcut (~ or `)
  useEffect(() => {
    const handleGlobalKey = (e) => {
      if (e.key === '`' || e.key === '~') {
        const tag = document.activeElement?.tagName?.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || document.activeElement?.isContentEditable) {
          return;
        }
        e.preventDefault();
        setIsTerminalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  // Easter egg: sudo / rm -rf typing buffer
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

  // Console easter egg
  useEffect(() => {
    console.log(
      `%croot@${identity.id}%c: Welcome to ${identity.domain}\nArch Linux + React 19\nIdentity: ${identity.brand} (${identity.role})`,
      `color: ${identity.appearance.accentColor}; font-weight: bold; font-size: 14px;`,
      'color: inherit; font-size: 12px;'
    );
  }, [identity]);

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
    }
  }, []);

  if (isBooting) {
    return <BootScreen onFinish={handleBootFinish} />;
  }

  return (
    <div
      className={`app-container ${identity.appearance.badgeClass} ${
        glitch ? 'glitch-active' : ''
      } ${barrelRoll ? 'barrel-roll-active' : ''}`}
    >
      {/* Top Utility Header Bar */}
      <header className="top-nav-bar">
        <div className="top-nav-left">
          <span className="top-identity-badge">
            <span className="identity-dot" />
            <span className="identity-name">{identity.brand}</span>
            <span className="identity-role">[{identity.role}]</span>
          </span>
          <button
            type="button"
            className="top-switch-btn"
            onClick={() =>
              handleSwitchIdentity(identity.role === 'current' ? 'timant32' : 'vicrorege')
            }
            title={
              identity.role === 'current'
                ? 'Preview legacy identity (timant32)'
                : 'Preview current identity (vicrorege)'
            }
          >
            ↔ {identity.role === 'current' ? 'timant32' : 'vicrorege'}
          </button>
        </div>

        <div className="top-nav-right">
          <button
            type="button"
            className="top-terminal-trigger"
            onClick={() => setIsTerminalOpen(true)}
            title="Open terminal (~)"
          >
            &gt;_ <span className="terminal-key-hint">~</span>
          </button>
          <LanguageSwitcher />
        </div>
      </header>

      {/* Main Single-Column Document Layout */}
      <main className="main-content-flow">
        {/* LEVEL 1: HERO */}
        <Hero
          identity={identity}
          onOpenTerminal={() => setIsTerminalOpen(true)}
          onSwitchIdentity={handleSwitchIdentity}
        />

        {/* LEVEL 2: 01 / PROJECTS */}
        <Projects />

        {/* LEVEL 2: 02 / NOW */}
        <NowActivity
          onOpenServerDetails={() => setDevRandomExp('servers')}
        />

        {/* LEVEL 2: 03 / CONTACT */}
        <ContactSection identity={identity} />

        {/* LEVEL 3: 04 / /dev/random */}
        <DevRandom
          onOpenTerminal={() => setIsTerminalOpen(true)}
          onTriggerMatrix={() => setMatrixRain(true)}
          activeExperimentProp={devRandomExp}
        />
      </main>

      {/* Subtle Colophon Footer */}
      <footer className="page-footer">
        <div className="footer-content">
          <span>
            root@{identity.domain} · {identity.brand} · Arch Linux
          </span>
          <span className="footer-subtext">
            dual identity system · 80% calm, 20% weird
          </span>
        </div>
      </footer>

      {/* Interactive Secondary Layer: Terminal Drawer / Modal */}
      <Terminal
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
        onCommand={handleTerminalCommand}
        identity={identity}
      />

      {/* Fullscreen Matrix Screensaver */}
      {matrixRain && <MatrixRain onFinish={() => setMatrixRain(false)} />}
    </div>
  );
}

export default App;
