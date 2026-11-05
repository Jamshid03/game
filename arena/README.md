# Cartoon Arena — online 2D top-down arena brawler
Node.js + Express + Socket.IO (server-authoritative, 30 Hz tick) · HTML5 Canvas client (ES modules, no build step for local play).

## Run locally
```
npm install
npm run dev      # or: npm start   → http://localhost:3000
```
Open the page in two browser windows/computers: one clicks **Create Private Room** and shares the 4-letter code, or both click **PLAY** for public matchmaking. Both press **READY**.
Controls: WASD move · mouse aim · left click attack · 1–5 weapons · ESC menu · M mute.

## Tests
- `npm run test:sim` — headless authoritative-simulation tests (no network needed).
- `npm start` in one terminal, then `npm run test:net` — real Socket.IO clients: rooms, full-room rejection, matchmaking, movement, disconnect/reconnect.

## Deployment
Backend (persistent Node host: Render, Railway, Fly.io, a VPS — **not** Vercel serverless, which cannot hold Socket.IO connections):
- Start command `npm start`; it listens on `process.env.PORT` and `0.0.0.0`.
- Env var `CORS_ORIGIN` = your Vercel frontend URL (default `*`).

Frontend (Vercel): import the repo; `vercel.json` sets build `npm run build` and output `client`.
- Env var `BACKEND_URL` = your deployed backend URL (e.g. `https://arena.onrender.com`). The build writes it into `client/env.js` and copies `shared/config.js` into `client/shared/`.
- Alternatively the backend alone serves the whole game (it hosts `client/`), so a single Node host is enough.
