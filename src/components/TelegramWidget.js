import React, { useEffect, useRef } from 'react';

const TelegramWidget = ({ channel, postId }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Очищаем контейнер перед добавлением скрипта (на случай ре-рендера)
    container.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    
    // Настройки поста
    script.setAttribute('data-telegram-post', `${channel}/${postId}`);
    script.setAttribute('data-width', '100%');
    
    // === СТИЛИЗАЦИЯ ПОД ТВОЙ САЙТ ===
    // Включаем темную тему
    script.setAttribute('data-dark', '1'); 
    // Задаем акцентный цвет (твой --color-primary #00FF00)
    script.setAttribute('data-color', '00FF00'); 
    // Отключаем аватарку, если хочешь максимальный минимализм (опционально, можно убрать строку)
    script.setAttribute('data-userpic', 'true'); 

    script.async = true;

    container.appendChild(script);
  }, [channel, postId]);

  return (
    <div 
      ref={containerRef} 
      className="telegram-widget-inner"
    />
  );
};

export default TelegramWidget;
