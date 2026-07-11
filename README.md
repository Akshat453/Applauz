# Rewards & Recognition Platform

Initial scaffolding for a Rewards & Recognition Platform with a React frontend, Express API backend, and PostgreSQL via Prisma ORM.

Detailed status and implementation notes are available in [docs/project-status.md](/Users/akshatsingh/Desktop/RecognitonHub/docs/project-status.md:1).

## Tech Stack

- Frontend: React + Vite
- Backend: Express.js
- Database: PostgreSQL
- ORM: Prisma

## Project Structure

- `client/` - Vite React application
- `server/` - Express API

## Local Setup

1. Start PostgreSQL with Docker Compose:

```bash
docker compose up -d
```

2. Open a terminal for the backend and create your local env file:

```bash
cd server
cp .env.example .env
npm run dev
```

3. Open a second terminal for the frontend:

```bash
cd client
npm run dev
```

4. Open the Vite app in your browser at the URL shown in the terminal, usually:

```bash
http://localhost:5173
```

## Full First-Time Setup Commands

If you are setting this project up from a fresh clone, run:

```bash
docker compose up -d
cd server
cp .env.example .env
npm install
npm run dev
```

In a second terminal:

```bash
cd client
npm install
npm run dev
```

## Notes

- The Express API runs on `http://localhost:5055`.
- The React app runs on Vite's dev server, usually `http://localhost:5173`.
- Client requests use `/api/*`.
- Vite proxies `/api/*` to `http://localhost:5055` during local development.
- PostgreSQL is exposed locally on `localhost:5433` to avoid conflicts with any existing Postgres service using `5432`.
