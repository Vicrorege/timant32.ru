#!/bin/sh
# Start Telegram scrape proxy (server-side fetch of t.me) before nginx.
set -eu

if command -v node >/dev/null 2>&1; then
  NODE_BIN=node
elif command -v nodejs >/dev/null 2>&1; then
  NODE_BIN=nodejs
else
  echo "[telegram-proxy] FATAL: node not installed" >&2
  exit 1
fi

export TELEGRAM_PROXY_HOST="${TELEGRAM_PROXY_HOST:-127.0.0.1}"
export TELEGRAM_PROXY_PORT="${TELEGRAM_PROXY_PORT:-3099}"

# stdout/stderr → container logs
$NODE_BIN /opt/telegram-proxy.mjs &
echo $! > /tmp/telegram-proxy.pid

# Wait until the proxy accepts connections (avoids race with nginx)
i=0
while [ "$i" -lt 50 ]; do
  if wget -q -O /dev/null "http://${TELEGRAM_PROXY_HOST}:${TELEGRAM_PROXY_PORT}/healthz" 2>/dev/null \
    || curl -fsS "http://${TELEGRAM_PROXY_HOST}:${TELEGRAM_PROXY_PORT}/healthz" >/dev/null 2>&1; then
    echo "[telegram-proxy] ready on ${TELEGRAM_PROXY_HOST}:${TELEGRAM_PROXY_PORT}"
    exit 0
  fi
  i=$((i + 1))
  sleep 0.1
done

echo "[telegram-proxy] WARNING: did not become ready in time" >&2
exit 0
