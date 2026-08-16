# https://timant32.ru | Terminal Dashboard

Личный дашборд и сайт-визитка, стилизованные под терминал Linux и тайловый оконный менеджер (в духе Hyprland). React + Vite, в проде — nginx.

## Как устроен календарь

В `.env` React-ключа для календаря **никогда не было** — и не нужно.

1. Браузер всегда ходит на **same-origin** `GET /api/calendar`.
2. Nginx (в Docker или твой глобальный) проксирует этот путь на секретный `.ics` URL.
3. Фронт парсит ICS через `ical.js` и показывает только **сейчас идущие** события.

Раньше пункт 2 жил только в хостовом nginx — поэтому старый `.env` содержал лишь Last.fm.  
В этом репо тот же паттерн оформлен как `CALENDAR_ICS_URL` для контейнера. Если крутишь свой nginx снаружи — проксируй `/api/calendar` туда же, переменная в `.env` приложения не обязательна.

Last.fm и status-проверки сделаны так же: ключи/внешние URL остаются на сервере (`/api/lastfm`, `/api/status/*`).

## Особенности

* **Интерактивный терминал**: `help`, `whoami`, `ping`, `clear`, `show`, `reboot`, `ascii <w> <h>`.
* **Виджеты**: status, BFS, Game of Life, cowsay, Last.fm, Telegram, calendar, countdown.
* **Easter eggs**: Konami, glitch на `sudo` / `rm -rf /`.
* **Адаптив**: второстепенные виджеты прячутся на узких экранах.

## Стек

* React 19 + Vite
* i18next, ical.js
* nginx (static + API proxies)

## Локально

```bash
cp .env.example .env
# LASTFM_API_KEY=...
# CALENDAR_ICS_URL=https://.../calendar.ics   # опционально

npm install
npm start
```

Dev-сервер (порт 3000) сам проксирует `/api/*` по значениям из `.env`.

## Docker

```bash
cp .env.example .env
docker compose up -d --build
curl -fsS http://localhost:8067/healthz
```

Порт: `HOST_PORT` (по умолчанию 8067). TLS — на глобальном nginx/прокси перед контейнером.

Смена `LASTFM_API_KEY` / `CALENDAR_ICS_URL` — **runtime** (правь `.env` на сервере и `docker compose up -d`), без пересборки образа.

## CI/CD (GitHub Actions)

На каждый PR: `vite build` + сборка Docker-образа.  
На push в `master`/`main`: то же + push в **GHCR** + деплой по SSH.

Образ: `ghcr.io/vicrorege/timant32.ru:latest`

### Секреты репозитория

Settings → Secrets and variables → Actions:

| Secret | Пример | Зачем |
|--------|--------|--------|
| `DEPLOY_HOST` | `timant32.ru` / IP | SSH host |
| `DEPLOY_USER` | `deploy` | SSH user (нужен доступ к Docker) |
| `DEPLOY_SSH_KEY` | `-----BEGIN OPENSSH PRIVATE KEY-----...` | Приватный ключ |
| `DEPLOY_PATH` | `/opt/timant32` | Каталог с `docker-compose.yml` и `.env` |
| `DEPLOY_PORT` | `22` | Опционально, по умолчанию 22 |

### Один раз на сервере

```bash
# от пользователя деплоя
curl -fsSL https://raw.githubusercontent.com/Vicrorege/timant32.ru/master/docker/bootstrap-server.sh | bash -s -- /opt/timant32
nano /opt/timant32/.env   # LASTFM_API_KEY=... ; CALENDAR_ICS_URL=  (пусто — календарь на хостовом nginx)
```

Пользователь должен быть в группе `docker` (или root).

Глобальный nginx: TLS + **только** `/api/calendar` (SOGo ICS), **всё остальное** (включая Telegram-пост) — на контейнер `127.0.0.1:8067`.  
Схема: браузер → `https://timant32.ru/api/telegram/post` → docker nginx → node scrape `t.me` (на VPS TG открывается) → JSON обратно.  
Готовый conf: [`docker/host-nginx-timant32.ru.example.conf`](docker/host-nginx-timant32.ru.example.conf).

Проверка на сервере после деплоя:

```bash
curl -fsS 'http://127.0.0.1:8067/api/telegram/post?channel=timant32info&id=4' | head
curl -fsS 'https://timant32.ru/api/telegram/post?channel=timant32info&id=4' | head
docker exec timant32 curl -fsS http://127.0.0.1:3099/healthz
```

Если первый curl ок, а https — нет: хостовый nginx ещё отдаёт старый `root /opt/timant32/build` вместо `proxy_pass` на `:8067`.

В серверном `.env` для Docker **`CALENDAR_ICS_URL` оставляй пустым** — календарь уже закрыт хостовым nginx. Нужны `LASTFM_API_KEY` (и при желании остальное).

После пуша в `master` Actions сам: соберёт образ → зальёт в GHCR → скопирует compose → `pull` + `up -d`.

## Лицензия

[MIT License](LICENSE)
