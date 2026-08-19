import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// --- Очищенные Переводы ---
const resources = {
  ru: {
    translation: {
      phrase1: 'я тимант.',
      phrase2: 'я делаю ботов в тг на заказ.',
      phrase3: 'я бездельник.',
      phrase4: 'я люблю <a href="https://t.me/Vaaaalerix">Vaaaalerix</a>.',
      phrase5: 'а ещё, криво верстаю сайты на React.',
      phrase6: 'милый ублюдок.',
      contact: 'Telegram:',
      telegram_channel: 'timant32info',
      telegram_post_id: '4',
      servers: "Серверы",
      online: "В сети"
    }
  },
  en: {
    translation: {
      phrase1: 'I\'m timant32.',
      phrase2: 'I create Telegram bots on order.',
      phrase3: 'I\'m a loafer.',
      phrase4: 'I love <a href="https://t.me/Vaaaalerix">Vaaaalerix</a>.',
      phrase5: 'I also do some wonky React site layouts.',
      phrase6: 'cute bastard.',
      contact: 'Telegram:',
      telegram_channel: 'timant32info', 
      telegram_post_id: '7',
      servers: "Servers",
      online: "Online"
    }
  }
};

i18n
  .use(initReactI18next) // Передает i18n в react-i18next
  .init({
    resources,
    lng: 'ru', // Язык по умолчанию
    fallbackLng: 'en', // Резервный язык
    interpolation: {
      escapeValue: false // Не требуется для React
    }
  });

export default i18n;