import React, { useState, useEffect } from 'react';
import ICAL from 'ical.js';
import { useTranslation } from 'react-i18next';

const CalendarWidget = () => {
  const [events, setEvents] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    let cancelled = false;

    const fetchEvents = async () => {
      try {
        const res = await fetch(`/api/calendar?t=${Date.now()}`);
        if (res.status === 204) {
          if (!cancelled) setEvents([]);
          return;
        }
        if (!res.ok) {
          console.warn('[calendar] upstream HTTP', res.status);
          return;
        }

        const data = await res.text();
        if (!data?.trim()) {
          if (!cancelled) setEvents([]);
          return;
        }

        const comp = new ICAL.Component(ICAL.parse(data));
        const now = Date.now();
        const active = [];

        comp.getAllSubcomponents('vevent').forEach((vevent) => {
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
              if (now >= start.getTime() && now <= end.getTime()) isHappening = true;
              if (start.getTime() > now) break;
            }
          } else {
            const start = event.startDate.toJSDate();
            const end = new Date(start.getTime() + durationMs);
            if (now >= start.getTime() && now <= end.getTime()) isHappening = true;
          }

          if (isHappening) {
            const [title, tags = ''] = (event.summary || '').split('|');
            active.push({
              title: title.trim(),
              header: tags.match(/\[header="([^"]+)"\]/)?.[1] || (tags.includes('[event]') ? 'EVENT' : 'BUSY'),
              url: tags.match(/\[onclick="([^"]+)"\]/)?.[1] || null,
              color: tags.match(/\[color(?:hex)?=([^\]]+)\]/)?.[1] || (tags.includes('[event]') ? '#00FF00' : '#ff3333'),
            });
          }
        });

        if (!cancelled) setEvents(active);
      } catch (error) {
        console.warn('[calendar] parse/fetch failed', error);
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 60000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (!events.length) return null;

  return (
    <div className="WidgetContainer hide-on-mobile" style={{ marginBottom: '20px', flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(0, 255, 0, 0.3)', paddingBottom: '8px', marginBottom: '12px' }}>
        <span style={{ backgroundColor: 'var(--color-primary)', color: '#000', padding: '2px 6px', borderRadius: '3px', marginRight: '10px', fontSize: '0.9rem', textShadow: 'none' }}>📅</span>
        <span style={{ color: 'var(--color-primary)', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.85rem' }}>{t('calendar', 'Calendar')}</span>
      </div>
      <div className="WidgetContent" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {events.map((evt, i) => (
          <div
            key={`${evt.title}-${i}`}
            onClick={evt.url ? () => window.open(evt.url, '_blank', 'noopener,noreferrer') : undefined}
            style={{ cursor: evt.url ? 'pointer' : 'default', display: 'flex', alignItems: 'flex-start' }}
          >
            <div style={{ color: evt.color, marginRight: '8px', fontSize: '12px', marginTop: '2px' }}>●</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ color: evt.color, fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>{evt.header}</div>
              <div style={{ color: 'var(--color-text)', fontSize: '0.85rem' }}>{evt.title}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarWidget;
