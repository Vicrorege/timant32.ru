import React, { useEffect, useMemo, useState } from 'react';
import ICAL from 'ical.js';
import { useTranslation } from 'react-i18next';

const RECUR_LOOKBACK_MS = 7 * 24 * 60 * 60 * 1000;
const TZ = 'Europe/Moscow';
const MSK_OFFSET_MS = 3 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

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

function mskDateKey(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(date);
}

function mskMidnightMs(dateKey) {
  return Date.parse(`${dateKey}T00:00:00+03:00`);
}

function getWeekBounds(now = Date.now()) {
  const todayKey = mskDateKey(new Date(now));
  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    weekday: 'short',
  }).format(new Date(now));
  const dayMap = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };
  const dayIdx = dayMap[weekday] ?? 0;
  const weekStartMs = mskMidnightMs(todayKey) - dayIdx * DAY_MS;
  return { weekStartMs, weekEndMs: weekStartMs + 7 * DAY_MS };
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

    while ((nextStart = iter.next()) && safety++ < 300) {
      const startMs = nextStart.toJSDate().getTime();
      if (startMs > toMs) break;
      pushOccurrence(nextStart);
    }
  } else {
    pushOccurrence(event.startDate);
  }

  return occurrences;
}

function collectEvents(comp, fromMs, toMs, now) {
  const seen = new Set();
  const collected = [];

  comp.getAllSubcomponents('vevent').forEach((vevent) => {
    const event = new ICAL.Event(vevent);
    const meta = parseEventMeta(event.summary || '');

    getOccurrences(event, fromMs, toMs).forEach((occ) => {
      const key = `${meta.title}|${occ.startMs}`;
      if (seen.has(key)) return;
      seen.add(key);

      const isActive = now >= occ.startMs && now <= occ.endMs;
      collected.push({
        ...meta,
        start: occ.start,
        end: occ.end,
        startMs: occ.startMs,
        endMs: occ.endMs,
        dayKey: mskDateKey(occ.start),
        status: isActive ? 'active' : occ.startMs > now ? 'upcoming' : 'past',
      });
    });
  });

  collected.sort((a, b) => a.startMs - b.startMs);
  return collected;
}

function formatTime(date) {
  return new Intl.DateTimeFormat('ru-RU', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatCompact(evt, now) {
  const time = formatTime(evt.start);
  if (evt.status === 'active') {
    return `${evt.header} · ${evt.title} · до ${formatTime(evt.end)}`;
  }
  const today = mskDateKey(new Date(now));
  const tomorrow = mskDateKey(new Date(now + DAY_MS));
  let dayLabel;
  if (evt.dayKey === today) dayLabel = 'сегодня';
  else if (evt.dayKey === tomorrow) dayLabel = 'завтра';
  else {
    dayLabel = new Intl.DateTimeFormat('ru-RU', {
      timeZone: TZ,
      day: '2-digit',
      month: '2-digit',
    }).format(evt.start);
  }
  return `${evt.title} · ${dayLabel} ${time}`;
}

function formatWeekRange(weekStartMs) {
  const start = new Date(weekStartMs + MSK_OFFSET_MS);
  const end = new Date(weekStartMs + 6 * DAY_MS + MSK_OFFSET_MS);
  const fmt = new Intl.DateTimeFormat('ru-RU', {
    timeZone: TZ,
    day: 'numeric',
    month: 'short',
  });
  return `${fmt.format(start)} – ${fmt.format(end)}`;
}

function dayLabel(dayKey, now) {
  const today = mskDateKey(new Date(now));
  const tomorrow = mskDateKey(new Date(now + DAY_MS));
  if (dayKey === today) return 'Сегодня';
  if (dayKey === tomorrow) return 'Завтра';
  const [y, m, d] = dayKey.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return new Intl.DateTimeFormat('ru-RU', {
    timeZone: TZ,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(date);
}

const CalendarWidget = () => {
  const [weekEvents, setWeekEvents] = useState([]);
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    let cancelled = false;

    const fetchEvents = async () => {
      try {
        const res = await fetch(`/api/calendar?t=${Date.now()}`);
        if (res.status === 204) {
          if (!cancelled) setWeekEvents([]);
          return;
        }
        if (!res.ok) {
          console.warn('[calendar] upstream HTTP', res.status);
          return;
        }

        const data = await res.text();
        if (!data?.trim()) {
          if (!cancelled) setWeekEvents([]);
          return;
        }

        const comp = new ICAL.Component(ICAL.parse(data));
        const now = Date.now();
        const { weekStartMs, weekEndMs } = getWeekBounds(now);
        const fromMs = weekStartMs - RECUR_LOOKBACK_MS;
        const events = collectEvents(comp, fromMs, weekEndMs, now).filter(
          (evt) => evt.startMs >= weekStartMs && evt.startMs < weekEndMs
        );

        if (!cancelled) setWeekEvents(events);
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

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const preview = useMemo(() => {
    const now = Date.now();
    const active = weekEvents.find((evt) => evt.status === 'active');
    if (active) return active;
    return weekEvents.find((evt) => evt.status === 'upcoming') || weekEvents[0];
  }, [weekEvents]);

  const weekByDay = useMemo(() => {
    const now = Date.now();
    const { weekStartMs } = getWeekBounds(now);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const dayKey = mskDateKey(new Date(weekStartMs + i * DAY_MS));
      days.push({
        dayKey,
        label: dayLabel(dayKey, now),
        events: weekEvents.filter((evt) => evt.dayKey === dayKey),
      });
    }
    return { weekStartMs, days };
  }, [weekEvents]);

  if (!weekEvents.length) return null;

  const now = Date.now();
  const { weekStartMs } = weekByDay;

  return (
    <>
      <div
        className="WidgetContainer calendar-widget-compact"
        style={{ flexDirection: 'column', alignItems: 'stretch', cursor: 'pointer' }}
        onClick={() => setOpen(true)}
        title={t('calendar_week_hint', 'Click for this week')}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            minWidth: 0,
          }}
        >
          <span style={{ flexShrink: 0 }}>📅</span>
          <div
            style={{
              color: preview?.color || 'var(--color-primary)',
              fontSize: '0.8rem',
              fontWeight: preview?.status === 'active' ? 700 : 500,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              minWidth: 0,
              flex: 1,
            }}
          >
            {preview ? formatCompact(preview, now) : t('calendar', 'Calendar')}
          </div>
          <span
            style={{
              color: 'var(--color-secondary-text)',
              fontSize: '0.65rem',
              flexShrink: 0,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {weekEvents.length}
          </span>
        </div>
      </div>

      {open && (
        <div className="calendar-week-overlay" onClick={() => setOpen(false)}>
          <div
            className="calendar-week-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="calendar-week-header">
              <div>
                <div className="calendar-week-title">{t('calendar', 'Calendar')}</div>
                <div className="calendar-week-subtitle">{formatWeekRange(weekStartMs)}</div>
              </div>
              <button
                type="button"
                className="calendar-week-close"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="calendar-week-body">
              {weekByDay.days.map((day) => (
                <div key={day.dayKey} className="calendar-week-day">
                  <div className="calendar-week-day-label">{day.label}</div>
                  {day.events.length ? (
                    day.events.map((evt) => (
                      <div
                        key={`${evt.title}-${evt.startMs}`}
                        className={`calendar-week-event${evt.url ? ' clickable' : ''}`}
                        onClick={
                          evt.url
                            ? (e) => {
                                e.stopPropagation();
                                window.open(evt.url, '_blank', 'noopener,noreferrer');
                              }
                            : undefined
                        }
                      >
                        <span
                          className="calendar-week-dot"
                          style={{ color: evt.color }}
                        >
                          ●
                        </span>
                        <div className="calendar-week-event-main">
                          <div className="calendar-week-event-time">
                            {formatTime(evt.start)}–{formatTime(evt.end)}
                          </div>
                          <div className="calendar-week-event-title">{evt.title}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="calendar-week-empty">—</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CalendarWidget;
