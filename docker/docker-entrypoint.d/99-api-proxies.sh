#!/bin/sh
# Generate nginx location snippets for backend proxies (secrets stay server-side).
set -eu

mkdir -p /etc/nginx/snippets
TARGET=/etc/nginx/snippets/api-proxies.conf
: > "$TARGET"

# --- Calendar (.ics) ---
if [ -n "${CALENDAR_ICS_URL:-}" ]; then
  cat >> "$TARGET" <<EOF
  location = /api/calendar {
    proxy_ssl_server_name on;
    proxy_http_version 1.1;
    proxy_set_header Host \$proxy_host;
    proxy_set_header Accept "text/calendar, text/plain, */*";
    proxy_set_header Cookie "";
    proxy_hide_header Set-Cookie;
    proxy_buffering off;
    proxy_connect_timeout 5s;
    proxy_read_timeout 15s;
    add_header Cache-Control "no-store" always;
    proxy_pass ${CALENDAR_ICS_URL};
  }
EOF
else
  cat >> "$TARGET" <<'EOF'
  location = /api/calendar {
    access_log off;
    default_type text/plain;
    return 204;
  }
EOF
fi

# --- Last.fm (API key never reaches the browser) ---
if [ -n "${LASTFM_API_KEY:-}" ]; then
  LASTFM_USER_VALUE="${LASTFM_USER:-tinant32}"
  cat >> "$TARGET" <<EOF
  location = /api/lastfm {
    proxy_ssl_server_name on;
    proxy_http_version 1.1;
    proxy_set_header Host ws.audioscrobbler.com;
    proxy_set_header Cookie "";
    proxy_hide_header Set-Cookie;
    proxy_connect_timeout 5s;
    proxy_read_timeout 10s;
    add_header Cache-Control "no-store" always;
    proxy_pass https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USER_VALUE}&api_key=${LASTFM_API_KEY}&format=json&limit=1;
  }
EOF
else
  cat >> "$TARGET" <<'EOF'
  location = /api/lastfm {
    access_log off;
    default_type application/json;
    return 204;
  }
EOF
fi

# --- Status probes (same-origin; avoids browser CORS / no-cors lies) ---
STATUS_MAIL_URL_VALUE="${STATUS_MAIL_URL:-https://mail.timant32.su/}"
STATUS_MC_URL_VALUE="${STATUS_MC_URL:-https://api.mcsrvstat.us/2/mc.timant32.ru}"

cat >> "$TARGET" <<EOF
  location = /api/status/site {
    access_log off;
    default_type application/json;
    add_header Cache-Control "no-store" always;
    return 200 '{"online":true}\n';
  }

  location = /api/status/mail {
    proxy_ssl_server_name on;
    proxy_http_version 1.1;
    proxy_set_header Host \$proxy_host;
    proxy_set_header Cookie "";
    proxy_hide_header Set-Cookie;
    proxy_connect_timeout 4s;
    proxy_read_timeout 4s;
    proxy_intercept_errors off;
    add_header Cache-Control "no-store" always;
    proxy_pass ${STATUS_MAIL_URL_VALUE};
  }

  location = /api/status/mc {
    proxy_ssl_server_name on;
    proxy_http_version 1.1;
    proxy_set_header Host \$proxy_host;
    proxy_set_header Cookie "";
    proxy_hide_header Set-Cookie;
    proxy_connect_timeout 5s;
    proxy_read_timeout 8s;
    add_header Cache-Control "no-store" always;
    proxy_pass ${STATUS_MC_URL_VALUE};
  }
EOF
