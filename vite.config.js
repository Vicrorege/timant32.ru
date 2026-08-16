import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fetchTelegramPost, isAllowedMedia } from './server/telegram-lib.mjs';

function proxyToFullUrl(rawUrl) {
  if (!rawUrl) return undefined;
  try {
    const u = new URL(rawUrl);
    return {
      target: u.origin,
      changeOrigin: true,
      secure: true,
      rewrite: () => `${u.pathname}${u.search}`,
    };
  } catch {
    return undefined;
  }
}

function localApiStubs(env) {
  const hasLastfm = Boolean(env.LASTFM_API_KEY);
  const hasCalendar = Boolean(env.CALENDAR_ICS_URL);

  return {
    name: 'local-api-stubs',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = req.url?.split('?')[0];
        const url = new URL(req.url || '/', 'http://localhost');

        if (path === '/healthz') {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/plain');
          res.end('ok\n');
          return;
        }

        if (path === '/api/status/site') {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end('{"online":true}\n');
          return;
        }

        if (path === '/api/lastfm' && !hasLastfm) {
          res.statusCode = 204;
          res.end();
          return;
        }

        if (path === '/api/calendar' && !hasCalendar) {
          res.statusCode = 204;
          res.end();
          return;
        }

        if (path === '/api/telegram/post') {
          try {
            const channel = (url.searchParams.get('channel') || '').replace(/[^a-zA-Z0-9_]/g, '');
            const id = (url.searchParams.get('id') || '').replace(/\D/g, '');
            if (!channel || !id) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'channel and id required' }));
              return;
            }
            const post = await fetchTelegramPost(channel, id);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify(post));
          } catch (error) {
            res.statusCode = error.status || 502;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: error.message || 'proxy failed' }));
          }
          return;
        }

        if (path === '/api/telegram/media') {
          try {
            const raw = url.searchParams.get('u') || '';
            if (!isAllowedMedia(raw)) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'host not allowed' }));
              return;
            }
            const upstream = await fetch(raw, {
              headers: { 'User-Agent': 'Mozilla/5.0 (compatible; timant32-tg-proxy/1.0)' },
            });
            if (!upstream.ok) {
              res.statusCode = upstream.status;
              res.end('media fetch failed');
              return;
            }
            const buf = Buffer.from(await upstream.arrayBuffer());
            res.statusCode = 200;
            res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/octet-stream');
            res.setHeader('Cache-Control', 'public, max-age=3600');
            res.end(buf);
          } catch (error) {
            res.statusCode = 502;
            res.end(error.message || 'media failed');
          }
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const lastfmKey = env.LASTFM_API_KEY || '';
  const lastfmUser = env.LASTFM_USER || 'tinant32';
  const mailUrl = env.STATUS_MAIL_URL || 'https://mail.timant32.su/';
  const mcUrl = env.STATUS_MC_URL || 'https://api.mcsrvstat.us/2/mc.timant32.ru';

  /** @type {Record<string, import('vite').ProxyOptions>} */
  const proxy = {};

  if (lastfmKey) {
    const qs = new URLSearchParams({
      method: 'user.getrecenttracks',
      user: lastfmUser,
      api_key: lastfmKey,
      format: 'json',
      limit: '1',
    });
    proxy['/api/lastfm'] = {
      target: 'https://ws.audioscrobbler.com',
      changeOrigin: true,
      secure: true,
      rewrite: () => `/2.0/?${qs.toString()}`,
    };
  }

  const calendarProxy = proxyToFullUrl(env.CALENDAR_ICS_URL);
  if (calendarProxy) proxy['/api/calendar'] = calendarProxy;

  const mailProxy = proxyToFullUrl(mailUrl);
  if (mailProxy) proxy['/api/status/mail'] = mailProxy;

  const mcProxy = proxyToFullUrl(mcUrl);
  if (mcProxy) proxy['/api/status/mc'] = mcProxy;

  return {
    plugins: [react(), localApiStubs(env)],
    server: {
      port: 3000,
      proxy,
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
  };
});
