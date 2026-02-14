import React, { useState, useEffect } from 'react';

const CalendarWidget = () => {
  const [currentEvent, setCurrentEvent] = useState(null);
  
  // 🔴 ССЫЛКА (Убедись, что путь public/me@... точный, как в SOGo)
  const icalUrl = 'https://mail.timant32.su/SOGo/dav/public/me@timant32.ru/Calendar/personal.ics';

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        // Добавляем timestamp, чтобы избежать кэширования браузером
        const noCacheUrl = `${icalUrl}?t=${Date.now()}`;
        
        const response = await fetch(noCacheUrl);
        
        if (!response.ok) {
           // Если 404 или ошибка сети — скрываем виджет
           throw new Error(`Error loading calendar: ${response.status}`);
        }
        
        const data = await response.text();
        const eventName = parseICS(data);
        
        setCurrentEvent(eventName);

      } catch (error) {
        console.error("Calendar Widget:", error);
        setCurrentEvent(null);
      }
    };

    fetchEvent();
    // Проверка каждую минуту
    const interval = setInterval(fetchEvent, 60000); 

    return () => clearInterval(interval);
  }, []);

  if (!currentEvent) return null;

  return (
    <div className="WidgetContainer CalendarWidget">
      <div className="WidgetIcon CalendarIcon">●</div>
      <div className="WidgetContent">
         <div className="WidgetTitle" style={{ color: '#ff3333' }}>BUSY</div>
         <div className="WidgetSubtitle">{currentEvent}</div>
      </div>
    </div>
  );
};

// === ПАРСЕР (Ищет событие, идущее прямо сейчас) ===
const parseICS = (icsData) => {
  const now = new Date();
  const events = icsData.split('BEGIN:VEVENT');

  for (let rawEvent of events) {
    const dtStart = extractValue(rawEvent, 'DTSTART');
    const dtEnd = extractValue(rawEvent, 'DTEND');
    const summary = extractValue(rawEvent, 'SUMMARY');

    if (dtStart && summary) {
      const startDate = parseICSDate(dtStart);
      
      // Если у события нет конца (редко), считаем его часовым
      const endDate = dtEnd ? parseICSDate(dtEnd) : new Date(startDate.getTime() + 60*60*1000);

      // Проверка: СЕЙЧАС находится внутри интервала события
      if (now >= startDate && now <= endDate) {
        return summary;
      }
    }
  }
  return null;
};

// Вспомогательная функция для извлечения значений (SUMMARY:Meeting -> Meeting)
const extractValue = (text, key) => {
  const regex = new RegExp(`${key}(?:;.*)?:(.*)`);
  const match = text.match(regex);
  return match ? match[1].trim() : null;
};

// Парсинг даты ICS (20251025T143000Z -> Date Object)
const parseICSDate = (icsDate) => {
  if (!icsDate) return new Date(0);
  
  const cleanDate = icsDate.replace('Z', '');
  const year = cleanDate.substring(0, 4);
  const month = cleanDate.substring(4, 6) - 1; // Месяцы в JS с 0
  const day = cleanDate.substring(6, 8);
  const hour = cleanDate.substring(9, 11) || '00';
  const minute = cleanDate.substring(11, 13) || '00';
  const second = cleanDate.substring(13, 15) || '00';

  if (icsDate.includes('Z')) {
      // Если есть Z — это UTC время
      return new Date(Date.UTC(year, month, day, hour, minute, second));
  } else {
      // Если нет Z — это локальное время (Floating time)
      return new Date(year, month, day, hour, minute, second);
  }
};

export default CalendarWidget;