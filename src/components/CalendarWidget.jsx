import React, { useState, useEffect } from 'react';
import ICAL from 'ical.js';
import { useTranslation } from 'react-i18next';

const UPCOMING_WINDOW_MS = 24 * 60 * 60 * 1000;
const RECUR_LOOKBACK_MS = 2 * 24 * 60 * 60 * 1000;

function parseEventMeta(summary = '') {
  const [title, tags = ''] = summary.split('|');
  return {
    title: title.trim(),
    header:
      tags.match(/\[header="([^"]+)"\]/)?.[1] ||
      (tags.includes('[event]') ? 'EVENT' : 'BUSY'),
    url: tags.match(/\[onclick="([^"]+)"\]/)?.[1] || null,
    color:
      tags.match(/\[color(?:hex)?=([^\]]+)\]/)?.[1] ||
      (tags.includes('[event]') ? '#00FF00' : '#ff3333'),
  };
}

function getOccurrences(event, fromMs, toMs) {
  if (!event.startDate) return [];

  const durationMs = event.duration ? event.duration.toSeconds() * 1000 : 3600000;
  const occurrences = [];

  const pushOccurrence = (startDate) => {
    const start = startDate.toJSDate();
    const end = new Date(start.getTime() + durationMs);
    const startMs = start.getTime();
    const endMs = end.getTime();
    if (endMs < fromMs || startMs > toMs) return;
    occurrences.push({ start, end, startMs, endMs });
  };

  if (event.isRecurring()) {
    const iterStart = ICAL.Time.fromJSDate(new Date(fromMs), false);
    const iter = event.iterator(iterStart);
    let nextStart;
    let safety = 0;

    while ((nextStart = iter.next()) && safety++ < 200) {
      const startMs = nextStart.toJSDate().getTime();
      if (startMs > toMs) break;
      pushOccurrence(nextStart);
    }
  } else {
    pushOccurrence(event.startDate);
  }

  return occurrences;
}

function formatWhen(start, end, now) {
  const sameDay = start.toDateString() === end.toDateString();
  const dateFmt = new Intl.DateTimeFormat('ru-RU', {
    timeZone: 'Europe/Moscow',
    day: '2-digit',
    month: '2-digit',
  });
  const timeFmt = new Intl.DateTimeFormat('ru-RU', {
    timeZone: 'Europe/Moscow',
    hour: '2-digit',
    minute: '2-digit',
  });

  const startDate = dateFmt.format(start);
  const startTime = timeFmt.format(start);
  const endTime = timeFmt.format(end);

  if (now >= start.getTime() && now <= end.getTime()) {
    return sameDay ? `до ${endTime}` : `${startDate} ${startTime} – ${endTime}`;
  }

  const today = dateFmt.format(new Date(now));
  const tomorrow = dateFmt.format(new Date(now + 24 * 60 * 60 * 1000));
  const eventDay = dateFmt.format(start);

  let dayLabel = startDate;
  if (eventDay === today) dayLabel = 'сегодня';
  else if (eventDay === tomorrow) dayLabel = 'завтра';

  return sameDay ? `${dayLabel} ${startTime}` : `${dayLabel} ${startTime} – ${endTime}`;
}

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
        const fromMs = now - RECUR_LOOKBACK_MS;
        const toMs = now + UPCOMING_WINDOW_MS;
        const seen = new Set();
        const collected = [];

        comp.getAllSubcomponents('vevent').forEach((vevent) => {
          const event = new ICAL.Event(vevent);
          const meta = parseEventMeta(event.summary || '');

          getOccurrences(event, fromMs, toMs).forEach((occ) => {
            const isActive = now >= occ.startMs && now <= occ.endMs;
            const isUpcoming = occ.startMs > now;
            if (!isActive && !isUpcoming) return;

            const key = `${meta.title}|${occ.startMs}`;
            if (seen.has(key)) return;
            seen.add(key);

            collected.push({
              ...meta,
              when: formatWhen(occ.start, occ.end, now),
              sortKey: isActive ? occ.startMs : occ.startMs + 1e15,
              status: isActive ? 'active' : 'upcoming',
            });
          });
        });

        collected.sort((a, b) => a.sortKey - b.sortKey);

        if (!cancelled) setEvents(collected.slice(0, 4));
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
    <div
      className="WidgetContainer"
      style={{ flexDirection: 'column', alignItems: 'stretch' }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '8px',
          marginBottom: '12px',
        }}
      >
        <span
          style={{
            backgroundColor: 'var(--color-primary)',
            color: '#000',
            padding: '2px 6px',
            borderRadius: '3px',
            marginRight: '10px',
            fontSize: '0.9rem',
            textShadow: 'none',
          }}
        >
          📅
        </span>
        <span
          style={{
            color: 'var(--color-primary)',
            fontWeight: 'bold',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            fontSize: '0.85rem',
          }}
        >
          {t('calendar', 'Calendar')}
        </span>
      </div>
      <div
        className="WidgetContent"
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          overflow: 'visible',
        }}
      >
        {events.map((evt, i) => (
          <div
            key={`${evt.title}-${evt.when}-${i}`}
            onClick={
              evt.url
                ? () => window.open(evt.url, '_blank', 'noopener,noreferrer')
                : undefined
            }
            style={{
              cursor: evt.url ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'flex-start',
            }}
          >
            <div
              style={{
                color: evt.color,
                marginRight: '8px',
                fontSize: '12px',
                marginTop: '2px',
              }}
            >
              ●
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <div
                style={{
                  color: evt.color,
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                }}
              >
                {evt.status === 'upcoming' ? 'SOON' : evt.header}
              </div>
              <div
                style={{
                  color: 'var(--color-text)',
                  fontSize: '0.85rem',
                  wordBreak: 'break-word',
                }}
              >
                {evt.title}
              </div>
              <div
                style={{
                  color: 'var(--color-secondary-text)',
                  fontSize: '0.75rem',
                  marginTop: '2px',
                }}
              >
                {evt.when}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarWidget;
