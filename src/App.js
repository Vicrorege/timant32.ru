import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; 
import TypewriterEffect from './components/TypewriterEffect';
import LanguageSwitcher from './components/LanguageSwitcher'; 
import LastFmWidget from './components/LastFmWidget';
import CalendarWidget from './components/CalendarWidget';
import TelegramWidget from './components/TelegramWidget'; 
import StatusWidget from './components/StatusWidget';
import ContactWidget from './components/ContactWidget';
import BootScreen from './components/BootScreen';
import Terminal from './components/Terminal';
import CountdownWidget from './components/CountdownWidget';
import AsciiVisualizerWidget from './components/AsciiVisualizerWidget';
import './App.css';

function App() {
  const { t, i18n } = useTranslation(); 
  const [glitch, setGlitch] = useState(false);
  const [barrelRoll, setBarrelRoll] = useState(false);
  const [isBooting, setIsBooting] = useState(!sessionStorage.getItem('booted'));
  const [hideWidgets, setHideWidgets] = useState(false);
  const [asciiSize, setAsciiSize] = useState({ w: 10, h: 5 });
  const currentPath = window.location.pathname;

  useEffect(() => {
    const originalTitle = document.title;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        document.title = '[1]+  Stopped  ssh root@timant32';
      } else {
        document.title = originalTitle;
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    let buffer = '';
    const handleKeyDown = (e) => {
      if (e.key.length > 1 && e.key !== 'Backspace') return;
      if (e.key === 'Backspace') {
        buffer = buffer.slice(0, -1);
      } else {
        buffer += e.key;
      }
      if (buffer.length > 20) buffer = buffer.slice(-20);
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

  useEffect(() => {
    let konamiBuffer = [];
    const konamiSequence = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
    const handleKeyDown = (e) => {
      konamiBuffer.push(e.key.toLowerCase());
      if (konamiBuffer.length > 10) konamiBuffer.shift();
      if (konamiBuffer.join(',') === konamiSequence.join(',')) {
        setBarrelRoll(true);
        setTimeout(() => setBarrelRoll(false), 2000);
        konamiBuffer = [];
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    console.log(
      "%croot@timant32%c: You found the secret console.\nArch Linux + React = ♥",
      "color: #00FF00; font-weight: bold; font-size: 14px;",
      "color: inherit; font-size: 12px;"
    );
  }, []);

  useEffect(() => {
    let isVisible = true;
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.type = 'image/svg+xml';
    const cursorOn = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect y="12" width="16" height="4" fill="%2300FF00"/></svg>';
    const cursorOff = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"></svg>';
    const interval = setInterval(() => {
      link.href = isVisible ? cursorOn : cursorOff;
      isVisible = !isVisible;
    }, 600);
    return () => clearInterval(interval);
  }, []);

  const handleBootFinish = () => {
    sessionStorage.setItem('booted', 'true');
    setIsBooting(false);
  };

  const handleTerminalCommand = (cmd) => {
    if (cmd === 'clear') {
      setHideWidgets(true);
    } else if (cmd === 'show') {
      setHideWidgets(false);
    } else if (cmd === 'reboot') {
      sessionStorage.removeItem('booted');
      setIsBooting(true);
    } else if (cmd.startsWith('ascii ')) {
      const parts = cmd.split(' ');
      if (parts.length === 3) {
        const w = parseInt(parts[1], 10);
        const h = parseInt(parts[2], 10);
        if (w >= 2 && w <= 14 && h >= 2 && h <= 25) {
          setAsciiSize({ w, h });
        }
      }
    }
  };

  if (isBooting) {
    return <BootScreen onFinish={handleBootFinish} />;
  }

  if (currentPath !== '/') {
    return (
      <div className="App minimalist" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--color-text)', fontSize: '1.2rem', textAlign: 'left', padding: '20px', fontFamily: 'Consolas, monospace' }}>
          <span style={{ color: '#ff3333' }}>root@timant32</span>:<span style={{ color: '#5555ff' }}>~{currentPath}</span>$ cat index.html<br/>
          bash: {currentPath}: No such file or directory<br/><br/>
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
        {!hideWidgets && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
              <LastFmWidget />
          </div>
        )}
        <h1 className="TypingTitle">
          <TypewriterEffect />
        </h1>
        {!hideWidgets && (
          <div className="TwoColumns">
            <div className="TelegramContainer">
              <TelegramWidget 
                key={i18n.language}
                channel={t('telegram_channel')} 
                postId={t('telegram_post_id')} 
              />
            </div>
            <div className="SideWidgets">
              <StatusWidget />
              <CountdownWidget />
              <AsciiVisualizerWidget width={asciiSize.w} height={asciiSize.h} />
              <CalendarWidget />
              <ContactWidget />
            </div>
          </div>
        )}
        <Terminal onCommand={handleTerminalCommand} />
        <LanguageSwitcher /> 
      </main>
    </div>
  );
}

export default App;