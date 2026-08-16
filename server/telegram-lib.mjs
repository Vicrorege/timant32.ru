/** Shared Telegram public-page scrape helpers (no deps). */
import dns from 'node:dns';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

try {
  dns.setDefaultResultOrder('ipv4first');
} catch {
  // ignore
}

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_CACHE_DIRS = [
  path.resolve(HERE, '../public/telegram-cache'),
  '/usr/share/nginx/html/telegram-cache',
  path.resolve(process.cwd(), 'public/telegram-cache'),
  path.resolve(process.cwd(), 'telegram-cache'),
];

export const MEDIA_HOSTS = new Set([
  'cdn1.telesco.pe',
  'cdn2.telesco.pe',
  'cdn3.telesco.pe',
  'cdn4.telesco.pe',
  'cdn5.telesco.pe',
  'telegram.org',
  'www.telegram.org',
  't.me',
]);

export function decodeEntities(str = '') {
  return str
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\u200b|\u200c|\u200d|\ufeff/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Keep formatting + custom TG emoji (proxied via /api/telegram/emoji/:id).
 * Public t.me pages expose <tg-emoji emoji-id="...">; art is at t.me/i/emoji/{id}.webp
 */
export function formatMessageHtml(innerHtml = '') {
  let html = String(innerHtml);

  html = html.replace(/<tg-emoji\s+emoji-id="(\d+)">([\s\S]*?)<\/tg-emoji>/gi, (_, id, inner) => {
    const alt = decodeEntities(inner).slice(0, 16) || 'emoji';
    return `<img class="tg-custom-emoji" src="/api/telegram/emoji/${id}" alt="${alt.replace(/"/g, '')}" loading="lazy" draggable="false" />`;
  });

  // Drop leftover unicode-emoji <i class="emoji"> wrappers if any remain
  html = html.replace(/<i class="emoji"[^>]*>[\s\S]*?<\/i>/gi, (block) => decodeEntities(block));

  html = html.replace(/\s+onclick="[^"]*"/gi, '');
  html = html.replace(/\s+on\w+="[^"]*"/gi, '');
  html = html.replace(/target="_blank"/gi, 'target="_blank" rel="noopener noreferrer"');

  // Protocol-relative → https
  html = html.replace(/url\('\/\//g, "url('https://");
  html = html.replace(/src="\/\//g, 'src="https://');

  // Whitelist tags; strip the rest but keep text
  html = html.replace(/<\/?(?!\/?(?:br|b|strong|i|em|a|code|img)\b)([a-z0-9-]+)(?:\s[^>]*)?>/gi, '');

  // Sanitize <a href>
  html = html.replace(/<a\s+([^>]*?)>/gi, (full, attrs) => {
    const href = (attrs.match(/href="([^"]*)"/i) || [])[1] || '';
    if (!/^(https?:|tg:|mailto:)/i.test(href)) return '<a>';
    return `<a href="${href}" target="_blank" rel="noopener noreferrer">`;
  });

  // Sanitize <img> — only our emoji proxy or already-relative api paths
  html = html.replace(/<img\s+([^>]*?)\/?>/gi, (full, attrs) => {
    const src = (attrs.match(/src="([^"]*)"/i) || [])[1] || '';
    const alt = (attrs.match(/alt="([^"]*)"/i) || [])[1] || '';
    if (!/^\/api\/telegram\/emoji\/\d+$/.test(src)) return alt;
    return `<img class="tg-custom-emoji" src="${src}" alt="${alt}" loading="lazy" draggable="false" />`;
  });

  return html.trim();
}

/** t.me/s pages include a feed; isolate the exact data-post="channel/id" block. */
export function sliceMessageHtml(html, channel, id) {
  const needle = `data-post="${channel}/${id}"`;
  const start = html.indexOf(needle);
  if (start === -1) return null;

  const next = html.indexOf('data-post="', start + needle.length);
  return html.slice(start, next === -1 ? html.length : next);
}

export function extractPost(html, channel, id) {
  const chunk = sliceMessageHtml(html, channel, id) || html;

  const textMatch = chunk.match(
    /<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/i
  );
  const rawInner = textMatch?.[1] || '';
  const text = rawInner ? decodeEntities(rawInner) : '';
  const formattedHtml = rawInner ? formatMessageHtml(rawInner) : '';

  const dateMatch = chunk.match(/<time[^>]*datetime="([^"]+)"/i);
  const viewsMatch = chunk.match(/class="tgme_widget_message_views"[^>]*>([^<]+)</i);

  // Prefer author inside the message bubble, not the page/channel chrome
  const authorMatch =
    chunk.match(/class="tgme_widget_message_owner_name"[^>]*>\s*<span[^>]*>([^<]+)</i) ||
    chunk.match(/class="tgme_widget_message_from_author"[^>]*>([^<]+)</i);

  // Only real message media — never og:image / user avatars
  const photos = [];
  const photoTagRe =
    /class="([^"]*)"[^>]*style="([^"]*background-image[^"]*)"/gi;
  let m;
  while ((m = photoTagRe.exec(chunk)) && photos.length < 4) {
    const cls = m[1];
    const style = m[2];
    if (/user_photo|owner|author|avatar/i.test(cls)) continue;
    if (!/photo|thumb|video/i.test(cls)) continue;
    const urlMatch = style.match(/url\('?(https:\/\/[^')]+)'?\)/i);
    if (urlMatch && !photos.includes(urlMatch[1])) photos.push(urlMatch[1]);
  }

  return {
    channel,
    id: String(id),
    text: text || '',
    html: formattedHtml || '',
    date: dateMatch?.[1] || null,
    views: viewsMatch?.[1]?.trim() || null,
    author: authorMatch ? decodeEntities(authorMatch[1]) : `@${channel}`,
    photos,
    link: `https://t.me/${channel}/${id}`,
    source: 'live',
  };
}

function browserHeaders() {
  return {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
  };
}

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: browserHeaders(),
    redirect: 'follow',
  });
  if (!res.ok) {
    const err = new Error(`upstream ${res.status} for ${url}`);
    err.status = res.status;
    throw err;
  }
  return res.text();
}

export function cacheKey(channel, id) {
  return `${channel}-${id}.json`;
}

export async function readTelegramCache(channel, id, extraDirs = []) {
  const dirs = [
    ...extraDirs,
    ...(process.env.TELEGRAM_CACHE_DIR ? [process.env.TELEGRAM_CACHE_DIR] : []),
    ...DEFAULT_CACHE_DIRS,
  ];
  const file = cacheKey(channel, id);
  for (const dir of dirs) {
    try {
      const raw = await readFile(path.join(dir, file), 'utf8');
      const data = JSON.parse(raw);
      return { ...data, channel, id: String(id), source: 'cache' };
    } catch {
      // try next
    }
  }
  return null;
}

export async function fetchTelegramPostLive(channel, id) {
  const urls = [
    `https://t.me/s/${encodeURIComponent(channel)}/${encodeURIComponent(id)}`,
    `https://t.me/${encodeURIComponent(channel)}/${encodeURIComponent(id)}?embed=1`,
  ];

  let lastError;
  for (const url of urls) {
    try {
      const html = await fetchHtml(url);
      const post = extractPost(html, channel, id);
      // Require the exact data-post slice when parsing /s/ feed pages
      if (sliceMessageHtml(html, channel, id) && (post.text || post.html || post.photos.length)) {
        return post;
      }
      if (post.text || post.html || post.photos.length) return post;
      lastError = new Error('empty parse');
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('telegram unreachable');
}

/** Live first, then on-disk cache (for RU hosts where t.me times out). */
export async function fetchTelegramPost(channel, id) {
  try {
    return await fetchTelegramPostLive(channel, id);
  } catch (liveError) {
    const cached = await readTelegramCache(channel, id);
    if (cached) {
      cached.stale = true;
      cached.liveError = liveError.message;
      return cached;
    }
    throw liveError;
  }
}

export function isAllowedMedia(raw) {
  try {
    const u = new URL(raw);
    if (u.protocol !== 'https:') return false;
    return MEDIA_HOSTS.has(u.hostname) || u.hostname.endsWith('.telesco.pe');
  } catch {
    return false;
  }
}
