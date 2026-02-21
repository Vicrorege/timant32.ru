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
import './App.css';

function App() {
  const { t, i18n } = useTranslation(); 
  const [glitch, setGlitch] = useState(false);
  const [isBooting, setIsBooting] = useState(!sessionStorage.getItem('booted'));
  const [hideWidgets, setHideWidgets] = useState(false);
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

  const handleBootFinish = () => {
    sessionStorage.setItem('booted', 'true');
    setIsBooting(false);
  };

  const handleTerminalCommand = (cmd) => {
    if (cmd === 'clear') {
      setHideWidgets(true);
    } else if (cmd === 'show') {
      setHideWidgets(false);
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
    <div className={`App minimalist ${glitch ? 'glitch-active' : ''}`}>
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