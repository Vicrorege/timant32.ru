#!/usr/bin/env bash
# One-time server bootstrap for GH Actions deploys.
# Run on the VPS as the deploy user (with docker permissions).
set -euo pipefail

DEPLOY_DIR="${1:-/opt/timant32}"
REPO_COMPOSE_URL="${2:-}"

mkdir -p "$DEPLOY_DIR"
cd "$DEPLOY_DIR"

if [ ! -f docker-compose.yml ]; then
  if [ -n "$REPO_COMPOSE_URL" ]; then
    curl -fsSL "$REPO_COMPOSE_URL" -o docker-compose.yml
  else
    cat > docker-compose.yml <<'EOF'
services:
  web:
    image: ${IMAGE:-ghcr.io/vicrorege/timant32.ru:latest}
    container_name: timant32
    ports:
      - "${HOST_PORT:-8080}:80"
    environment:
      CALENDAR_ICS_URL: ${CALENDAR_ICS_URL:-}
      LASTFM_API_KEY: ${LASTFM_API_KEY:-}
      LASTFM_USER: ${LASTFM_USER:-tinant32}
      STATUS_MAIL_URL: ${STATUS_MAIL_URL:-https://mail.timant32.su/}
      STATUS_MC_URL: ${STATUS_MC_URL:-https://api.mcsrvstat.us/2/mc.timant32.ru}
    restart: unless-stopped
    read_only: true
    tmpfs:
      - /etc/nginx/conf.d:mode=1777
      - /etc/nginx/snippets:mode=1777
      - /var/cache/nginx:uid=101,gid=101,mode=1777
      - /var/run:uid=101,gid=101,mode=1777
      - /tmp:uid=101,gid=101,mode=1777
    security_opt:
      - no-new-privileges:true
    healthcheck:
      test: ["CMD", "curl", "-fsS", "http://127.0.0.1/healthz"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 10s
EOF
  fi
fi

if [ ! -f .env ]; then
  cat > .env <<'EOF'
HOST_PORT=8080
LASTFM_API_KEY=
LASTFM_USER=tinant32
CALENDAR_ICS_URL=
STATUS_MAIL_URL=https://mail.timant32.su/
STATUS_MC_URL=https://api.mcsrvstat.us/2/mc.timant32.ru
EOF
  echo "Created $DEPLOY_DIR/.env — fill in secrets before first deploy."
fi

echo "Deploy directory ready: $DEPLOY_DIR"
echo "Point GitHub secret DEPLOY_PATH to this directory."
