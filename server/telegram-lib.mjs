/** Shared Telegram public-page scrape helpers (no deps). */
import dns from 'node:dns';

try {
  dns.setDefaultResultOrder('ipv4first');
} catch {
  // ignore in non-node bundlers
}

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

  let text = '';
  if (textMatch) {
    text = decodeEntities(textMatch[1]);
  }

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
  };
}

export async function fetchTelegramPost(channel, id) {
  const url = `https://t.me/s/${encodeURIComponent(channel)}/${encodeURIComponent(id)}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; timant32-tg-proxy/1.0)',
      'Accept-Language': 'ru,en;q=0.8',
    },
    redirect: 'follow',
  });
  if (!res.ok) {
    const err = new Error(`upstream ${res.status}`);
    err.status = res.status;
    throw err;
  }
  const html = await res.text();
  return extractPost(html, channel, id);
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
