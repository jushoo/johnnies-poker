# Johnnie's Poker

Minimalist real-time Planning Poker for agile teams. Built with **SolidStart**, **Nitro**, and **WebSockets**.

## Features

- **Real-time voting** — Join a room and vote simultaneously with your team via WebSockets.
- **Fibonacci scale** — Standard planning poker values (`1`, `2`, `3`, `5`, `8`, `13`, `21`, `?`, `☕`).
- **Reveal & stats** — Instantly reveal votes with calculated average, median, mode, and agreement percentage.
- **Spectator mode** — Observe without voting.
- **Responsive design** — Works on desktop and mobile.

## Tech Stack

- [SolidStart](https://start.solidjs.com/) — Full-stack SolidJS framework
- [Nitro](https://nitro.unjs.io/) — Universal server engine (via Vinxi)
- [crossws](https://crossws.unjs.io/) — WebSocket abstraction for Nitro
- [Vanilla Extract](https://vanilla-extract.style/) — Zero-runtime CSS-in-JS

## Getting Started

Requires **Node.js ≥20**.

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

## Building for Production

```bash
npm run build
npm run start
```

The build output is generated in `.output/` and can be run directly with Node.js:

```bash
node .output/server/index.mjs
```

## Project Structure

```
src/
  app.tsx              # Root app component with <MetaProvider>
  entry-client.tsx     # Client entry point
  entry-server.tsx     # Server entry point
  routes/
    index.tsx          # Landing page (create/join room)
    [roomId].tsx       # Planning poker room
  components/
    PokerCard.tsx      # Individual vote card
    PokerHand.tsx      # Row of selectable vote cards
    MemberList.tsx     # Room members with vote status
    VoteResults.tsx    # Revealed votes and statistics
    RoomControls.tsx   # Issue title, reveal/reset buttons
    ui/                # Reusable UI primitives (Button, Card, Input)
  server/
    websocket.ts       # WebSocket message handler & room state
  lib/
    websocket.ts       # Client-side WebSocket hook
    room-store.ts      # Reactive room state store
    constants.ts       # Fibonacci values and other constants
  styles/
    theme.css.ts       # Design tokens (colors, spacing, typography)
    global.css.ts      # Global styles
    recipes/           # Vanilla Extract style recipes
```

## Deployment

### Dokploy (Docker on VPS)

The easiest way to deploy is with **Dokploy** (or any Docker-based PaaS).

1. Push this repo to GitHub.
2. In Dokploy, create a new **Application** → link your GitHub repo.
3. Set the **Build Type** to `Dockerfile`.
4. Set the **Port** to `3000`.
5. Enable HTTPS and hit **Deploy**.

Dokploy will build the image and run the container. The `Dockerfile` in this repo handles the build and runtime.

### Self-hosted (Node.js directly)

```bash
npm run build
node .output/server/index.mjs
```

The server runs on port `3000` by default. Use a reverse proxy (Nginx/Caddy) for HTTPS. See [`NEXT_STEPS.md`](./NEXT_STEPS.md) for a detailed checklist.

## License

MIT
