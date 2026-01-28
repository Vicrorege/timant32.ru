import React from 'react';
import { useTranslation } from 'react-i18next'; 
import TypewriterEffect from './components/TypewriterEffect';
import LanguageSwitcher from './components/LanguageSwitcher'; 
import './App.css';

function App() {
  // Получаем t для локализации контактного текста
  const { t, i18n } = useTranslation(); 

  return (
    <div className="App minimalist">
      <main className="MainContent MinimalContent">
        
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

        <LanguageSwitcher /> 
        
      </main>
    </div>
  );
}

export default App;
