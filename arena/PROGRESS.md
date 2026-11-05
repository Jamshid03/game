# PROGRESS

## Verified
- `npm run test:sim` passes: glove/energy/spring/hammer/gas hit detection + damage, knockback, airborne launch+landing, hammer return, kills/scoring/respawn, server speed cap, compact snapshots (~750 B for 2 players).
- All JS files pass `node --check`.

## NOT verified (sandbox had no network → `npm install` impossible, no browser)
- Server startup with express/socket.io, `npm run test:net`, the client in a real browser (rendering, input, UI flow), audio. Expect small bugs on first run. **First step next session: `npm install && npm start`, open two tabs, fix whatever breaks, run `npm run test:net`.**
- Internet deployment: not deployed or tested.

## Implemented
- Server (server/): rooms (private code, public matchmaking, max 4, full/in-progress rejection), lobby ready-up + 3 s countdown, 30 Hz fixed tick, input validation, server-side movement/cooldowns/damage/knockback/stun/airborne bounce, 5 weapons, 3 arenas with obstacle collision, scoring (first to 5 KOs or 120 s), respawn with invulnerability, disconnect handling with 20 s reconnect window (token via sessionStorage), match end + return to lobby after 8 s.
- Client (client/): Canvas-drawn heroes (Bolt, Tank, Zip) with walk/idle/attack/hurt/stun/airborne-spin animations, cached arena art (nature/desert/futuristic), particles, screen shake, interpolated remote players (100 ms), smoothed self position, camera follow, WebAudio synthesized SFX + music, full DOM UI (menu, lobby, char select, ready, HUD, weapon bar with cooldowns, pause, victory/defeat).
- Deploy config: vercel.json, scripts/build.js, BACKEND_URL via client/env.js, CORS_ORIGIN on server.

## Remaining / known gaps
- No client-side prediction for the local player (movement waits for server round trip, smoothed only).
- Pause menu does not pause the match (multiplayer); "restart" = Back to Lobby → Ready.
- Obstacles drawn under characters (no tree-canopy overdraw); tree collision box is larger than the trunk.
- Reconnect during a match restores the player but the match HUD relies on the next room event for names.
- No mobile/touch controls; no per-hero special abilities; weapon choice is free (all 5 for every hero).
- Per-hero attack differences are only speed/HP/knockback resistance.

## Next steps
1. Install, run, play-test with two tabs; fix bugs. 2. Run test:net. 3. Add client prediction + lag compensation tuning. 4. Hero-specific abilities, canopy overdraw, minimap, kill feed. 5. Deploy backend + Vercel frontend and test across machines.

## Technical decisions
- ESM everywhere (`"type":"module"`); `shared/config.js` is imported by server and client (served at /shared locally; copied to client/shared on Vercel build).
- Snapshots: players `[id,x,y,angle,hp,z,flags,weapon,cooldowns,score]`, projectiles `[id,type,x,y,angle]`, clouds `[x,y,r,lifeFrac]`, events `e` (fire/hit/land/kill). flags: 1 dead,2 moving,4 stun,8 hurt,16 air,32 attack,64 slowed,128 offline,256 invulnerable.
- Client sends `in` {x,y,a,att,w} at 30 Hz; server never trusts outcomes.
