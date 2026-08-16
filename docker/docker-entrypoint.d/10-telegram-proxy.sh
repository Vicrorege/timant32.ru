#!/bin/sh
# Start local Telegram scrape proxy before nginx.
set -eu

if command -v node >/dev/null 2>&1; then
  NODE_BIN=node
elif command -v nodejs >/dev/null 2>&1; then
  NODE_BIN=nodejs
else
  echo "[telegram-proxy] node not installed; /api/telegram will fail" >&2
  exit 0
fi

TELEGRAM_PROXY_HOST=127.0.0.1
TELEGRAM_PROXY_PORT=3099
export TELEGRAM_PROXY_HOST TELEGRAM_PROXY_PORT

$NODE_BIN /opt/telegram-proxy.mjs &
echo $! > /tmp/telegram-proxy.pid
