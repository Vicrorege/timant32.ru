import React, { useEffect, useMemo, useState } from 'react';
import ICAL from 'ical.js';
import { useTranslation } from 'react-i18next';

const TZ = 'Europe/Moscow';
const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_HEIGHT = 44;
const GRID_HEIGHT = HOUR_HEIGHT * 24;
const RECUR_LOOKBACK_MS = 14 * DAY_MS;

const WEEKDAY_NAMES = {
  Mon: 'Понедельник',
  Tue: 'Вторник',
  Wed: 'Среда',
  Thu: 'Четверг',
  Fri: 'Пятница',
  Sat: 'Суббота',
  Sun: 'Воскресенье',
};

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
      (tags.includes('[event]') ? '#00FF00' : '#888888'),
  };
}

function mskDateKey(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(date);
}

function mskMidnightMs(dateKey) {
  return Date.parse(`${dateKey}T00:00:00+03:00`);
}

function getWeekBounds(baseMs = Date.now()) {
  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    weekday: 'short',
  }).format(new Date(baseMs));
  const dayMap = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };
  const dayIdx = dayMap[weekday] ?? 0;
  const todayKey = mskDateKey(new Date(baseMs));
  const weekStartMs = mskMidnightMs(todayKey) - dayIdx * DAY_MS;
  return { weekStartMs, weekEndMs: weekStartMs + 7 * DAY_MS };
}

function getISOWeekNumber(ms) {
  const date = new Date(ms);
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  utc.setUTCDate(utc.getUTCDate() + 4 - (utc.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  return Math.ceil(((utc - yearStart) / DAY_MS + 1) / 7);
}

function mskMinutesFromMidnight(date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const hour = Number(parts.find((p) => p.type === 'hour')?.value || 0);
  const minute = Number(parts.find((p) => p.type === 'minute')?.value || 0);
  return hour * 60 + minute;
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
    const iter = event.iterator();
    let nextStart;
    let safety = 0;

    while ((nextStart = iter.next()) && safety++ < 500) {
      const start = nextStart.toJSDate();
      const end = new Date(start.getTime() + durationMs);
      const startMs = start.getTime();
      const endMs = end.getTime();
      if (endMs < fromMs) continue;
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
    const recurring = event.isRecurring();

    getOccurrences(event, fromMs, toMs).forEach((occ) => {
      const key = `${meta.title}|${occ.startMs}`;
      if (seen.has(key)) return;
      seen.add(key);

      collected.push({
        ...meta,
        start: occ.start,
        end: occ.end,
        startMs: occ.startMs,
        endMs: occ.endMs,
        dayKey: mskDateKey(occ.start),
        recurring,
        status:
          now >= occ.startMs && now <= occ.endMs
            ? 'active'
            : occ.startMs > now
              ? 'upcoming'
              : 'past',
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

function eventStyleForDay(evt, dayStartMs, dayEndMs) {
  const clipStart = Math.max(evt.startMs, dayStartMs);
  const clipEnd = Math.min(evt.endMs, dayEndMs);
  if (clipEnd <= clipStart) return null;

  const startMin = mskMinutesFromMidnight(new Date(clipStart));
  const endMin = mskMinutesFromMidnight(new Date(clipEnd));
  const durationMin = endMin - startMin;
  if (durationMin < 8) return null;

  const top = (startMin / 60) * HOUR_HEIGHT;
  const height = Math.max((durationMin / 60) * HOUR_HEIGHT, 18);

  return { top, height };
}

function WeekGridCalendar({ events, weekStartMs, onClose }) {
  const { t } = useTranslation();
  const [weekOffset, setWeekOffset] = useState(0);

  const displayWeekStart = weekStartMs + weekOffset * 7 * DAY_MS;
  const displayWeekEnd = displayWeekStart + 7 * DAY_MS;
  const now = Date.now();
  const todayKey = mskDateKey(new Date(now));
  const weekNumber = getISOWeekNumber(displayWeekStart + 3 * DAY_MS);

  const days = useMemo(() => {
    const result = [];
    for (let i = 0; i < 7; i++) {
      const dayStartMs = displayWeekStart + i * DAY_MS;
      const dayEndMs = dayStartMs + DAY_MS;
      const dayKey = mskDateKey(new Date(dayStartMs));
      const weekdayShort = new Intl.DateTimeFormat('en-US', {
        timeZone: TZ,
        weekday: 'short',
      }).format(new Date(dayStartMs));
      const dayNum = new Intl.DateTimeFormat('ru-RU', {
        timeZone: TZ,
        day: 'numeric',
      }).format(new Date(dayStartMs));
      const monthShort =
        i === 0
          ? new Intl.DateTimeFormat('ru-RU', {
              timeZone: TZ,
              month: 'short',
              year: 'numeric',
            }).format(new Date(dayStartMs))
          : null;

      const dayEvents = events
        .filter((evt) => evt.startMs < dayEndMs && evt.endMs > dayStartMs)
        .map((evt) => {
          const layout = eventStyleForDay(evt, dayStartMs, dayEndMs);
          if (!layout) return null;
          return { ...evt, ...layout };
        })
        .filter(Boolean);

      result.push({
        dayKey,
        dayStartMs,
        dayEndMs,
        weekday: WEEKDAY_NAMES[weekdayShort] || weekdayShort,
        dayNum,
        monthShort,
        isToday: dayKey === todayKey,
        events: dayEvents,
      });
    }
    return result;
  }, [events, displayWeekStart, todayKey]);

  const nowLine = useMemo(() => {
    if (now < displayWeekStart || now >= displayWeekEnd) return null;
    const todayIdx = days.findIndex((d) => d.isToday);
    if (todayIdx < 0) return null;
    const top = (mskMinutesFromMidnight(new Date(now)) / 60) * HOUR_HEIGHT;
    return { dayIdx: todayIdx, top };
  }, [days, displayWeekStart, displayWeekEnd, now]);

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="calendar-week-overlay" onClick={onClose}>
      <div className="calendar-grid-panel" onClick={(e) => e.stopPropagation()}>
        <div className="calendar-grid-toolbar">
          <div className="calendar-grid-toolbar-left">
            <button
              type="button"
              className="calendar-grid-nav"
              onClick={() => setWeekOffset((v) => v - 1)}
              aria-label="Previous week"
            >
              ‹
            </button>
            <span className="calendar-grid-week-label">неделя {weekNumber}</span>
            <button
              type="button"
              className="calendar-grid-nav"
              onClick={() => setWeekOffset((v) => v + 1)}
              aria-label="Next week"
            >
              ›
            </button>
            <button
              type="button"
              className="calendar-grid-today"
              onClick={() => setWeekOffset(0)}
            >
              {t('calendar_today', 'сегодня')}
            </button>
          </div>
          <button
            type="button"
            className="calendar-week-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="calendar-grid-scroll">
          <div
            className="calendar-grid"
            style={{ gridTemplateColumns: `52px repeat(7, minmax(72px, 1fr))` }}
          >
            <div className="calendar-grid-corner" />
            {days.map((day) => (
              <div
                key={day.dayKey}
                className={`calendar-grid-dayhead${day.isToday ? ' is-today' : ''}`}
              >
                <div className="calendar-grid-dayname">{day.weekday}</div>
                <div className="calendar-grid-daynum">{day.dayNum}</div>
                {day.monthShort && (
                  <div className="calendar-grid-month">{day.monthShort}</div>
                )}
              </div>
            ))}

            <div className="calendar-grid-times" style={{ height: GRID_HEIGHT }}>
              {hours.map((h) => (
                <div
                  key={h}
                  className="calendar-grid-hour-label"
                  style={{ height: HOUR_HEIGHT }}
                >
                  {String(h).padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {days.map((day, dayIdx) => (
              <div
                key={`col-${day.dayKey}`}
                className={`calendar-grid-daycol${day.isToday ? ' is-today' : ''}`}
              >
                <div className="calendar-grid-daytrack" style={{ height: GRID_HEIGHT }}>
                  {hours.map((h) => (
                    <div
                      key={h}
                      className="calendar-grid-hour-line"
                      style={{ top: h * HOUR_HEIGHT }}
                    />
                  ))}

                  {day.events.map((evt) => (
                    <div
                      key={`${evt.title}-${evt.startMs}`}
                      className={`calendar-grid-event${evt.url ? ' clickable' : ''}${
                        evt.status === 'active' ? ' is-active' : ''
                      }`}
                      style={{
                        top: evt.top,
                        height: evt.height,
                        '--evt-color': evt.color,
                      }}
                      title={`${evt.title}\n${formatTime(evt.start)} – ${formatTime(evt.end)}`}
                      onClick={
                        evt.url
                          ? (e) => {
                              e.stopPropagation();
                              window.open(evt.url, '_blank', 'noopener,noreferrer');
                            }
                          : undefined
                      }
                    >
                      <div className="calendar-grid-event-title">{evt.title}</div>
                      {evt.recurring && (
                        <span className="calendar-grid-event-recur" aria-hidden>
                          ↻
                        </span>
                      )}
                    </div>
                  ))}

                  {nowLine?.dayIdx === dayIdx && (
                    <div
                      className="calendar-grid-now"
                      style={{ top: nowLine.top }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const CalendarWidget = () => {
  const [allEvents, setAllEvents] = useState([]);
  const [calendarLoaded, setCalendarLoaded] = useState(false);
  const [weekStartMs, setWeekStartMs] = useState(() => getWeekBounds().weekStartMs);
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    let cancelled = false;

    const fetchEvents = async () => {
      try {
        const res = await fetch(`/api/calendar?t=${Date.now()}`);
        if (res.status === 204) {
          if (!cancelled) {
            setAllEvents([]);
            setCalendarLoaded(false);
          }
          return;
        }
        if (!res.ok) {
          console.warn('[calendar] upstream HTTP', res.status);
          return;
        }

        const data = await res.text();
        if (!data?.trim()) {
          if (!cancelled) setAllEvents([]);
          return;
        }

        const comp = new ICAL.Component(ICAL.parse(data));
        const now = Date.now();
        const { weekStartMs: currentWeekStart, weekEndMs: currentWeekEnd } =
          getWeekBounds(now);
        const fromMs = currentWeekStart - RECUR_LOOKBACK_MS;
        const toMs = currentWeekEnd + 8 * 7 * DAY_MS;
        const events = collectEvents(comp, fromMs, toMs, now);

        if (!cancelled) {
          setAllEvents(events);
          setWeekStartMs(currentWeekStart);
          setCalendarLoaded(true);
        }
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

  const activeEvent = useMemo(() => {
    const now = Date.now();
    return allEvents.find((evt) => now >= evt.startMs && now <= evt.endMs) || null;
  }, [allEvents]);

  if (!calendarLoaded) return null;

  return (
    <>
      <div
        className="WidgetContainer calendar-widget-compact"
        style={{ flexDirection: 'column', alignItems: 'stretch', cursor: 'pointer' }}
        onClick={() => setOpen(true)}
        title={t('calendar_week_hint', 'Click for this week')}
      >
        {activeEvent ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              minWidth: 0,
            }}
          >
            <span
              style={{
                color: activeEvent.color,
                fontSize: '10px',
                flexShrink: 0,
              }}
            >
              ●
            </span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  color: activeEvent.color,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  lineHeight: 1.2,
                }}
              >
                {activeEvent.header}
              </div>
              <div
                style={{
                  color: 'var(--color-text)',
                  fontSize: '0.8rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {activeEvent.title}
                <span style={{ color: 'var(--color-secondary-text)' }}>
                  {' '}
                  · до {formatTime(activeEvent.end)}
                </span>
              </div>
            </div>
            <span style={{ flexShrink: 0 }}>📅</span>
          </div>
        ) : (
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
                color: 'var(--color-primary)',
                fontSize: '0.8rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              {t('calendar', 'Календарь')}
            </div>
          </div>
        )}
      </div>

      {open && (
        <WeekGridCalendar
          events={allEvents}
          weekStartMs={weekStartMs}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
};

export default CalendarWidget;
