# Catan Server (Express + SQLite)

Backend service for Catan Manager. Provides a simple JSON API on top of a SQLite database to store groups, sessions, and calculated leaderboard statistics.

## Requirements

- Node.js LTS (recommended 18+)
- npm 8+

## Installation & Run

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

By default the server listens on port `3002` (can be proxied from the frontend via `/api`).

## API Overview

All endpoints return and accept JSON.

### Groups

- `GET    /groups`
  - Description: Get the list of all groups.

- `POST   /groups`
  - Description: Create a new group.
  - Body (JSON example):
    ```json
    {
      "id": "group-id-1",
      "name": "Friday Catan Club",
      "players": ["Alice", "Bob", "Carol"],
      "lastUpdated": "2026-01-18T10:00:00.000Z"
    }
    ```

- `PUT    /groups/:id`
  - Description: Update an existing group.
  - Body (JSON): typically includes `name` and `players`.

- `DELETE /groups/:id`
  - Description: Delete a group and all related sessions.

### Sessions

- `GET    /sessions`
  - Description: Get the list of all game sessions.

- `POST   /sessions`
  - Description: Create a new game session.
  - Body: full session object in JSON (structure defined by the frontend; includes group reference, players, scores, date, etc.).

- `PUT    /sessions/:id`
  - Description: Update an existing game session.
  - Body: partial session object in JSON (only the fields to be updated).

- `DELETE /sessions/:id`
  - Description: Delete a session.

### Leaderboard

- `GET    /leaderboard`
  - Description: Get calculated player statistics (wins, games played, total points, etc.).

## Database File

- SQLite file: `catan.db` (created automatically on first run in the server directory).
- The schema is initialized programmatically when the server starts.

## Notes

This is an intentionally minimal server focused on storing and aggregating Catan game data. It is designed to be:

- simple to run (single Node.js process + SQLite file),
- easy to extend with new endpoints or statistics as needed,
- suitable to be used behind a reverse proxy (e.g. Nginx) together with the Catan Manager frontend.

