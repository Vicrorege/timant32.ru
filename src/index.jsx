import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './i18n';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[sw] registered successfully with scope:', reg.scope);
      })
      .catch((err) => {
        console.warn('[sw] registration failed:', err);
      });
  });
}