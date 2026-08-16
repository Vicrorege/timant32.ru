#!/usr/bin/env node
import http from 'node:http';
import dns from 'node:dns';
import { URL } from 'node:url';
import { fetchTelegramPost, isAllowedMedia } from './telegram-lib.mjs';

dns.setDefaultResultOrder('ipv4first');

const PORT = Number(process.env.TELEGRAM_PROXY_PORT || 3099);
const HOST = process.env.TELEGRAM_PROXY_HOST || '127.0.0.1';

function send(res, status, body, headers = {}) {
  const payload = typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body);
  res.writeHead(status, {
    'Cache-Control': headers['Cache-Control'] || 'no-store',
    ...headers,
    'Content-Length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

async function proxyMedia(rawUrl, res) {
  if (!isAllowedMedia(rawUrl)) {
    send(res, 400, { error: 'host not allowed' }, { 'Content-Type': 'application/json' });
    return;
  }
  const upstream = await fetch(rawUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; timant32-tg-proxy/1.0)' },
    redirect: 'follow',
  });
  if (!upstream.ok) {
    send(res, upstream.status, { error: 'media fetch failed' }, { 'Content-Type': 'application/json' });
    return;
  }
  const buf = Buffer.from(await upstream.arrayBuffer());
  const type = upstream.headers.get('content-type') || 'application/octet-stream';
  send(res, 200, buf, {
    'Content-Type': type,
    'Cache-Control': 'public, max-age=3600',
  });
}

async function proxyEmoji(id, res) {
  if (!/^\d{5,32}$/.test(id)) {
    send(res, 400, { error: 'bad emoji id' }, { 'Content-Type': 'application/json' });
    return;
  }
  const upstream = await fetch(`https://t.me/i/emoji/${id}.webp`, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      Accept: 'image/webp,image/apng,image/*,*/*;q=0.8',
      Referer: 'https://t.me/',
    },
    redirect: 'follow',
  });
  if (!upstream.ok) {
    send(res, upstream.status, { error: 'emoji fetch failed' }, { 'Content-Type': 'application/json' });
    return;
  }
  const buf = Buffer.from(await upstream.arrayBuffer());
  if (!buf.length) {
    send(res, 502, { error: 'empty emoji' }, { 'Content-Type': 'application/json' });
    return;
  }
  const type = upstream.headers.get('content-type') || 'image/webp';
  send(res, 200, buf, {
    'Content-Type': type,
    'Cache-Control': 'public, max-age=86400',
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${HOST}:${PORT}`);

    if (url.pathname === '/healthz') {
      send(res, 200, 'ok\n', { 'Content-Type': 'text/plain' });
      return;
    }

    if (url.pathname === '/post') {
      const channel = (url.searchParams.get('channel') || '').replace(/[^a-zA-Z0-9_]/g, '');
      const id = (url.searchParams.get('id') || '').replace(/\D/g, '');
      if (!channel || !id) {
        send(res, 400, { error: 'channel and id required' }, { 'Content-Type': 'application/json' });
        return;
      }
      const post = await fetchTelegramPost(channel, id);
      send(res, 200, post, { 'Content-Type': 'application/json; charset=utf-8' });
      return;
    }

    if (url.pathname === '/media') {
      await proxyMedia(url.searchParams.get('u') || '', res);
      return;
    }

    const emojiMatch = url.pathname.match(/^\/emoji\/(\d+)$/);
    if (emojiMatch) {
      await proxyEmoji(emojiMatch[1], res);
      return;
    }

    send(res, 404, { error: 'not found' }, { 'Content-Type': 'application/json' });
  } catch (error) {
    const status = error.status && Number(error.status) >= 400 ? Number(error.status) : 502;
    send(res, status, { error: error.message || 'proxy failed' }, { 'Content-Type': 'application/json' });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[telegram-proxy] listening on ${HOST}:${PORT}`);
});
