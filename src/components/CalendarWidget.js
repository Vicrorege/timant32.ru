import React, { useState, useEffect } from 'react';
import ICAL from 'ical.js';

const CalendarWidget = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`/api/calendar?t=${Date.now()}`);
        if (!res.ok) return;
        const data = await res.text();
        
        const comp = new ICAL.Component(ICAL.parse(data));
        const nowMsk = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Moscow" }));
        const active = [];

        comp.getAllSubcomponents('vevent').forEach(vevent => {
          const event = new ICAL.Event(vevent);
          if (!event.startDate) return;

          let isHappening = false;
          const durationMs = event.duration ? event.duration.toSeconds() * 1000 : 3600000;

          if (event.isRecurring()) {
            const iter = event.iterator();
            let nextStart;
            let maxLoops = 50;
            while ((nextStart = iter.next()) && maxLoops-- > 0) {
              const start = nextStart.toJSDate();
              const end = new Date(start.getTime() + durationMs);
              if (nowMsk >= start && nowMsk <= end) isHappening = true;
              if (start > nowMsk) break;
            }
          } else {
            const start = event.startDate.toJSDate();
            const end = new Date(start.getTime() + durationMs);
            if (nowMsk >= start && nowMsk <= end) isHappening = true;
          }

          if (isHappening) {
            const [title, tags = ''] = (event.summary || '').split('|');
            active.push({
              title: title.trim(),
              header: tags.match(/\[header="([^"]+)"\]/)?.[1] || (tags.includes('[event]') ? 'EVENT' : 'BUSY'),
              url: tags.match(/\[onclick="([^"]+)"\]/)?.[1] || null,
              color: tags.match(/\[color(?:hex)?=([^\]]+)\]/)?.[1] || (tags.includes('[event]') ? '#00FF00' : '#ff3333')
            });
          }
        });
        setEvents(active);
      } catch (e) {}
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!events.length) return null;

  return (
    <>
      {events.map((evt, i) => (
        <div key={i} className="WidgetContainer CalendarWidget" 
             onClick={evt.url ? () => window.open(evt.url, '_blank') : undefined}
             style={{ cursor: evt.url ? 'pointer' : 'default', marginBottom: '20px' }}>
          <div className="WidgetIcon CalendarIcon" style={{ color: evt.color }}>●</div>
          <div className="WidgetContent">
             <div className="WidgetTitle" style={{ color: evt.color }}>{evt.header}</div>
             <div className="WidgetSubtitle">{evt.title}</div>
          </div>
        </div>
      ))}
    </>
  );
};

export default CalendarWidget;