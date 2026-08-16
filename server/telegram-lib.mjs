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
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function extractPost(html, channel, id) {
  const textMatch =
    html.match(/<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
    html.match(/<meta property="og:description" content="([^"]*)"/i);

  const text = textMatch ? decodeEntities(textMatch[1]) : '';

  const dateMatch = html.match(/<time[^>]*datetime="([^"]+)"/i);
  const viewsMatch = html.match(/class="tgme_widget_message_views"[^>]*>([^<]+)</i);
  const authorMatch =
    html.match(/class="tgme_widget_message_owner_name"[^>]*>\s*<span[^>]*>([^<]+)</i) ||
    html.match(/property="og:title" content="([^"]+)"/i);

  const photos = [];
  const photoRe = /background-image:\s*url\('?(https:\/\/[^'")\s]+)'?\)/gi;
  let m;
  while ((m = photoRe.exec(html)) && photos.length < 4) {
    if (!photos.includes(m[1])) photos.push(m[1]);
  }

  const ogImage = html.match(/property="og:image" content="(https:\/\/[^"]+)"/i);
  if (ogImage && !photos.includes(ogImage[1])) photos.unshift(ogImage[1]);

  return {
    channel,
    id: String(id),
    text: text || '',
    date: dateMatch?.[1] || null,
    views: viewsMatch?.[1]?.trim() || null,
    author: authorMatch ? decodeEntities(authorMatch[1]) : channel,
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
  const dirs = [...extraDirs, ...(process.env.TELEGRAM_CACHE_DIR ? [process.env.TELEGRAM_CACHE_DIR] : []), ...DEFAULT_CACHE_DIRS];
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
      if (post.text || post.photos.length) return post;
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
