# Catan Server (Express + SQLite)

## Запуск

1. Установите зависимости:
   ```
   npm install
   ```
2. Запустите сервер:
   ```
   npm start
   ```

## API

- `GET    /groups` — список групп
- `POST   /groups` — создать группу (JSON: id, name, players, lastUpdated)
- `PUT    /groups/:id` — обновить группу (JSON: name, players)
- `DELETE /groups/:id` — удалить группу и все связанные с ней сессии

- `GET    /sessions` — список сессий
- `POST   /sessions` — создать сессию (полный объект сессии в JSON)
- `PUT    /sessions/:id` — обновить сессию (частичный объект сессии в JSON)
- `DELETE /sessions/:id` — удалить сессию

- `GET    /leaderboard` — получить рассчитанную статистику игроков

## Файл базы данных

- SQLite-файл: `catan.db` (создаётся автоматически)

---

Минимальный сервер для хранения данных Catan. Можно расширять под свои нужды.
