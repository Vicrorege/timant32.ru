# syntax=docker/dockerfile:1

# --- build ---
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY index.html vite.config.js ./
COPY public ./public
COPY src ./src
COPY server ./server

ENV CI=true
RUN npm run build

# --- runtime ---
FROM nginx:1.27-alpine AS runtime

RUN apk add --no-cache curl nodejs \
  && rm -f /etc/nginx/conf.d/default.conf \
  && mkdir -p /etc/nginx/snippets /opt

COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/default.conf.template /etc/nginx/templates/default.conf.template
COPY docker/docker-entrypoint.d/10-telegram-proxy.sh /docker-entrypoint.d/10-telegram-proxy.sh
COPY docker/docker-entrypoint.d/99-api-proxies.sh /docker-entrypoint.d/99-api-proxies.sh
RUN chmod +x /docker-entrypoint.d/10-telegram-proxy.sh /docker-entrypoint.d/99-api-proxies.sh

COPY server/telegram-lib.mjs server/telegram-proxy.mjs /opt/

COPY --from=build /app/dist /usr/share/nginx/html

ENV CALENDAR_ICS_URL=""
ENV LASTFM_API_KEY=""
ENV LASTFM_USER="tinant32"
ENV STATUS_MAIL_URL="https://mail.timant32.su/"
ENV STATUS_MC_URL="https://api.mcsrvstat.us/2/mc.timant32.ru"
ENV TELEGRAM_PROXY_HOST="127.0.0.1"
ENV TELEGRAM_PROXY_PORT="3099"

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -fsS http://127.0.0.1/healthz >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
