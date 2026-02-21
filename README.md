# https://timant32.ru | Terminal Dashboard

Личный дашборд и сайт-визитка, стилизованные под терминал Linux и тайловый оконный менеджер (в духе Hyprland). Написано на React.

## Особенности

* **Интерактивный терминал**: поддержка команд (`help`, `whoami`, `ping`, `clear`, `show`, `reboot`, `ascii <w> <h>`).
* **Динамические виджеты**:
  * **Servers Status**: мониторинг личных узлов (timant32.ru, mail.timant32.su, mc.timant32.ru).
  * **BFS Pathfinding**: генерация лабиринтов и пошаговая визуализация поиска в ширину.
  * **Game of Life**: клеточный автомат Джона Конвея.
  * **Cowsay**: консольный пингвин, выдающий цитаты и мемы.
  * **Last.fm / Telegram / Calendar**: интеграция внешних API.
* **Easter Eggs**: Konami code, глитч-эффекты на опасные команды (`rm -rf /`).
* **Адаптивность**: второстепенные виджеты скрываются на узких экранах для сохранения чистоты интерфейса.

## Стек технологий

* React.js
* CSS3 (Custom properties, flexbox, CSS-анимации)
* i18next (Локализация)
* ical.js (Парсинг календаря)

## Запуск локально

1. Клонируй репозиторий:
```bash
git clone [https://github.com/Vicrorege/timant32.ru.git](https://github.com/Vicrorege/timant32.ru.git)
cd timant32.ru
```

2. Установи зависимости:
```bash
npm install
```

3. Создай файл `.env` в корне проекта и пропиши ключи API:
```env
REACT_APP_LASTFM_KEY=твой_ключ
```

4. Запусти dev-сервер:
```bash
npm start
```

## Сборка для продакшена

```bash
npm run build
```
Готовые статические файлы появятся в директории `build/`.

## Лицензия

[MIT License](LICENSE)