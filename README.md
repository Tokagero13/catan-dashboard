# Catan Manager

Web application for managing Catan games: tracking players, groups, tournaments, and generating random maps.

## Key Features

- Random Catan map generator (resources, numbers, ports)
- Player group management and player profiles
- Game sessions and game history tracking
- Global and per-group leaderboard
- Achievements and records tracking
- Game statistics (wins, points, sessions)
- Winner photos storage (via backend uploads)

For dice rolls we recommend using the separate web application IceDice (see section below).

## Tech Stack & Architecture

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + SQLite
- **Styles**: Tailwind CSS
- **Containerization**: Docker + docker-compose (optional)
- **Reverse proxy**: Nginx (production)

Frontend and backend live in the same repository:

- the frontend is a SPA that talks to the API under `/api`
- the backend is a separate Node.js process that automatically creates the SQLite database and tables on first run

## IceDice Integration (Dice Roller)

For fair and visual dice rolls during Catan games you can use the external project [IceDice](https://github.com/Tokagero13/IceDice).

Recommended usage flow:

- run Catan Manager to handle game tracking and statistics
- open IceDice in a separate browser tab
- use IceDice to generate all dice rolls during the game

In this setup Catan Manager is responsible for organizing games and analytics, while IceDice is responsible for randomizing dice rolls.

## Quick Start

### 1. Requirements

- Node.js LTS (recommended 18+)
- npm 8+

### 2. Install Dependencies

```bash
# Install root & frontend dependencies
npm install

# Install backend dependencies (catan-server)
npm run postinstall
```

### 3. Run in Development Mode

```bash
npm run dev
```

This will start:
- frontend: http://localhost:3000
- backend API: http://localhost:3002

The frontend proxies API requests through the `/api` path.

### 4. Production Build & Deployment

#### Build

```bash
npm run build:prod
```

This command builds the production frontend bundle and prepares the project to be served behind a reverse proxy (e.g. Nginx).

#### Nginx Configuration

Minimal example for proxying the API (see `nginx-config.txt`):

```nginx
location /api/ {
    rewrite ^/api/(.*)$ /$1 break;
    proxy_pass http://YOUR_SERVER_IP:3002;
    # ... other headers and settings
}
```

Static frontend files can be served directly from the build directory (`dist`).

#### Run Backend in Production

```bash
cd catan-server && node index.js
```

For production it is recommended to run the backend under a process manager (pm2, systemd, etc.) with auto-restart configured.

## Project Structure

```text
├── components/          # Reusable React components
├── pages/               # Application pages (routes)
├── services/            # Client-side services & API client
├── catan-server/        # Backend (Express + SQLite)
├── src/                 # Vite config and support files
├── .env                 # Local environment variables (git-ignored)
├── .env.example         # Example environment configuration
└── nginx-config.txt     # Example Nginx configuration
```

## Configuration

### Frontend Environment Variables

The frontend uses Vite environment variables:

- `VITE_API_URL` — base URL of the API server (defaults to `/api` in production)
- `VITE_ALLOWED_HOSTS` — comma-separated list of hosts allowed to access the Vite dev server

See `.env.example` for a reference.

### Backend

The Node.js backend:

- runs an HTTP server on port `3002` by default
- creates the SQLite database file and required tables on first start
- stores uploaded files (winner photos, etc.) in `catan-server/uploads`

## npm Scripts

```bash
npm run dev              # Start dev environment (frontend + backend)
npm run dev:frontend     # Frontend dev server only
npm run dev:backend      # Backend (Node.js) only
npm run build            # Build frontend for production
npm run build:prod       # Build using production env variables
npm run preview          # Preview the built frontend locally
```

## Main API Endpoints

(Simplified description — see backend source for details.)

- `GET /groups` — get all groups
- `POST /groups` — create a new group
- `GET /sessions` — get all game sessions
- `POST /sessions` — create a new game session
- `GET /leaderboard` — get aggregated leaderboard

## Roadmap

- More detailed per-game statistics (resources, development, longest road, etc.)
- Additional map generation modes
- Data export/import
- Integrations with other utilities for playing Catan
