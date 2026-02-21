import React from 'react';
import { useTranslation } from 'react-i18next'; 
import TypewriterEffect from './components/TypewriterEffect';
import LanguageSwitcher from './components/LanguageSwitcher'; 
import LastFmWidget from './components/LastFmWidget';
import CalendarWidget from './components/CalendarWidget';
import TelegramWidget from './components/TelegramWidget'; 
import StatusWidget from './components/StatusWidget';
import ContactWidget from './components/ContactWidget';
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

        <LanguageSwitcher /> 
        
      </main>
    </div>
  );
}

export default App;