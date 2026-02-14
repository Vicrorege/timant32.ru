import React from 'react';
import { useTranslation } from 'react-i18next'; 
import TypewriterEffect from './components/TypewriterEffect';
import LanguageSwitcher from './components/LanguageSwitcher'; 
import LastFmWidget from './components/LastFmWidget';
import CalendarWidget from './components/CalendarWidget';
import TelegramWidget from './components/TelegramWidget'; 
import './App.css';

function App() {
  const { t, i18n } = useTranslation(); 

  return (
    <div className="App minimalist">
      <main className="MainContent MinimalContent">
        
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
            <LastFmWidget />
        </div>

        <h1 className="TypingTitle">
          <TypewriterEffect />
        </h1>

        <div className="ContactInfo">
          <a 
            href="https://t.me/tim_ant32" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            {t('contact')} <span className="ContactHandle">@tim_ant32</span>
          </a>
        </div>
        <div className="TelegramContainer">
          <TelegramWidget 
            key={i18n.language}
            channel={t('telegram_channel')} 
            postId={t('telegram_post_id')} 
          />
        </div>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
            <CalendarWidget />
        </div>


        <LanguageSwitcher /> 
        
      </main>
    </div>
  );
}

export default App;
