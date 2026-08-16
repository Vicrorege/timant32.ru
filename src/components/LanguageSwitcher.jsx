import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const currentLang = i18n.language;

  return (
    <div className="language-switcher">
      <button 
        onClick={() => changeLanguage('ru')}
        disabled={currentLang === 'ru'}
        className={`lang-button ${currentLang === 'ru' ? 'active' : ''}`}
      >
        RU
      </button>
      /
      <button 
        onClick={() => changeLanguage('en')}
        disabled={currentLang === 'en'}
        className={`lang-button ${currentLang === 'en' ? 'active' : ''}`}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSwitcher;