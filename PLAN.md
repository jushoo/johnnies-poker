# Johnny's Poker — Project Plan

A real-time Planning Poker app, inspired by [planningpokeronline.com](https://planningpokeronline.com).

---

## 1. Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | **SolidStart** | Full-stack Solid.js with file-based routing, SSR, and server functions. Vite-based dev experience. |
| UI Library | **Solid.js** | Fine-grained reactivity, small bundle, great performance for a real-time UI. |
| Styling | **Vanilla Extract** | Zero-runtime CSS-in-JS, type-safe theme contracts, works seamlessly with Vite. |
| Real-time | **Nitro WebSockets** (via `crossws`) or a **dedicated WS server** | SolidStart sits on Nitro; we can attach a WebSocket handler to the same Node process for low-latency room updates. |
| State (server) | **In-memory** (MVP) | Simplest for rooms/votes. Add Redis or SQLite later if persistence is needed. |
| State (client) | **Solid signals + stores** | No heavy client state library needed; local UI state in signals, server-synced state in a reactive store. |
| Icons | **Lucide Solid** | Clean, lightweight SVG icons. |
| Deployment target | **Node.js** (via `nitropack` preset) | Easiest path for custom WebSocket support. Can move to edge later. |

---

## 2. Features

### MVP (Must-have)
- [ ] **Create room** — auto-generated short code (e.g. `ABCD-1234`).
- [ ] **Join room** — enter code + display name; optional spectator mode.
- [ ] **Voting system** — Fibonacci (0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, ?, ☕) as default.
- [ ] **Cast / change vote** — hidden until reveal.
- [ ] **Reveal votes** — triggered by any participant (configurable) or auto-reveal when all voted.
- [ ] **Show statistics** — average, median, mode, agreement %.
- [ ] **Reset / start new round** — clears votes for next issue.
- [ ] **Real-time sync** — all room members see updates instantly.
- [ ] **Responsive layout** — works on desktop and mobile.

### V2 (Nice-to-have)
- [ ] **Issue / story list** — add titles/descriptions, import from JIRA/CSV.
- [ ] **Timer** — countdown per round.
- [ ] **Room settings** — who can reveal, voting system (T-shirts, powers of 2), hide cards until reveal.
- [ ] **Persistent history** — export session results to CSV/JSON.
- [ ] **Dark mode** — theme toggle via Vanilla Extract themes.
- [ ] **QR code / share link** — easy mobile join.
- [ ] **Observer / spectator** — watch without voting.

---

## 3. Architecture

### Room Lifecycle
```
Client A (Host)          Server (SolidStart + WS)          Client B (Joiner)
    |                             |                                |
    |--- POST /api/room --------->|                                |
    |<-- { roomId, wsToken } -----|                                |
    |--- WS /ws?room=xxx -------->|                                |
    |                             |<--- WS /ws?room=xxx -----------|
    |<-- WS: member_joined -------|                                |
    |                             |--- WS: member_joined --------->|
    |--- WS: vote ----------------|                                |
    |                             |--- WS: vote ------------------>|
    |--- WS: reveal --------------|                                |
    |                             |--- WS: reveal ---------------->|
```

### Server Functions (HTTP)
| Endpoint | Purpose |
|----------|---------|
| `POST /api/room` | Create a new room; return roomId + initial WS token. |
| `GET /api/room/[id]` | Get public room metadata (exists, voting system). |

### WebSocket Messages
| Event | Direction | Payload |
|-------|-----------|---------|
| `join` | C → S | `{ name, roomId, isSpectator }` |
| `member_joined` | S → C | `{ memberId, name, isSpectator }` |
| `member_left` | S → C | `{ memberId }` |
| `vote` | C → S | `{ value }` |
| `vote_update` | S → C | `{ memberId, voted: true }` (value hidden) |
| `reveal` | C → S | `{}` |
| `reveal_result` | S → C | `{ votes: { memberId, value }[], stats: {...} }` |
| `reset` | C → S | `{}` |
| `round_reset` | S → C | `{}` |
| `issue_change` | C → S / S → C | `{ title, description }` |

### Data Models (Server Memory)
```ts
interface Room {
  id: string;
  createdAt: number;
  members: Map<string, Member>;
  currentIssue?: Issue;
  votesRevealed: boolean;
  votingSystem: VotingSystem;
  settings: RoomSettings;
}

interface Member {
  id: string;
  name: string;
  isSpectator: boolean;
  vote: string | null;      // null = not voted
  connection: WebSocket;    // active socket
}

interface RoomSettings {
  allowOthersToReveal: boolean;
  autoReveal: boolean;
}
```

---

## 4. Project Structure

```
├── src/
│   ├── app.tsx                 # Root layout (SolidStart)
│   ├── app.css.ts              # Global Vanilla Extract styles / theme contract
│   ├── entry-client.tsx        # Client entry (SolidStart default)
│   ├── entry-server.tsx        # Server entry (SolidStart default)
│   ├── routes/
│   │   ├── index.tsx           # Landing page (create / join room)
│   │   ├── [roomId].tsx        # Room page (the poker table)
│   │   └── api/
│   │       └── room.ts         # Server functions for room CRUD
│   ├── components/
│   │   ├── ui/                 # Buttons, inputs, modals (Vanilla Extract)
│   │   ├── PokerCard.tsx       # Individual voting card
│   │   ├── PokerTable.tsx      # The table / board area
│   │   ├── MemberList.tsx      # Avatars + names + vote status
│   │   ├── VoteReveal.tsx      # Statistics display
│   │   └── CreateRoomForm.tsx
│   ├── lib/
│   │   ├── websocket.ts        # Client-side WS hook/manager
│   │   ├── room-store.ts       # Client reactive store for room state
│   │   └── constants.ts        # Voting systems, default settings
│   ├── styles/
│   │   ├── theme.css.ts        # Colors, spacing, radii (theme contract)
│   │   ├── sprinkles.css.ts    # Responsive/sprinkle atoms (optional)
│   │   └── recipes/            # Button, card, badge recipes
│   └── server/
│       └── websocket.ts        # WebSocket handler + room state logic
├── public/                     # Static assets
├── app.config.ts               # SolidStart config (Nitro preset: node-server)
├── package.json
├── tsconfig.json
└── PLAN.md                     # This file
```

---

## 5. Styling Strategy (Vanilla Extract)

1. **Theme Contract** (`theme.css.ts`)
   - Define a `vars` contract for colors (brand, surface, text, success, warning), spacing scale, font sizes, radii.
   - Provide a light theme class; dark theme can be a second class toggled on `<html>`.

2. **Sprinkles** (`sprinkles.css.ts`) — Optional but recommended
   - Atomic utility properties (margin, padding, color, display) for rapid layout composition without writing one-off style files.

3. **Recipes** (`recipes/*.css.ts`)
   - `buttonRecipe` — variants: `primary`, `secondary`, `ghost`, `size`.
   - `cardRecipe` — variants: `default`, `selected`, `disabled`.
   - `badgeRecipe` — for status tags (voted, spectator, host).

4. **Global Styles**
   - Reset + base typography in `app.css.ts`.

---

## 6. Real-time Strategy

SolidStart's server functions alone aren't enough for bidirectional real-time. Options:

| Option | Pros | Cons |
|--------|------|------|
| **A. Nitro native WS** (`experimental.websocket`) | Same port, same process, clean integration. | Still experimental; API may change. |
| **B. Separate WS server** (e.g. `ws` lib on another port) | Simple, battle-tested. | CORS/port complexity in dev/prod; harder to share session state. |
| **C. SSE (Server-Sent Events)** | Works over HTTP; no extra port. | Uni-directional; client actions still need HTTP POSTs. Slightly more latency. |

**Recommendation:** Start with **Option A** (Nitro/`crossws`). If it proves unstable, fall back to a lightweight `ws` server mounted in a custom server entry or a separate microservice.

### Connection Flow
1. Client calls server function `createRoom` or `joinRoom`.
2. Server returns a short-lived token (JWT or signed string) bound to the room.
3. Client opens WS with `?token=xyz`.
4. Server validates token, attaches socket to the room's broadcast set.

---

## 7. Open Questions / Decisions

1. **Do we need SSR for the room page?**
   - Probably not critical; the room is empty until WS connects. Could render a skeleton on the server and hydrate state client-side.
   
2. **How long do rooms live?**
   - In-memory with a TTL (e.g., 24h of inactivity) is fine for MVP.

3. **Do we want auth?**
   - No for MVP. Display names are enough.

4. **Do we want to support edge deployment (Vercel/Netlify)?**
   - Node preset locks us out of pure edge. If edge is a goal later, we'd need to swap WS for Durable Objects (Cloudflare) or PartyKit. Accept Node for now.

5. **Vanilla Extract sprinkles vs. recipes for layout?**
   - Use recipes for component patterns, sprinkles for utility spacing/alignment. Keep it lightweight.

---

## 8. Next Steps (Implementation Order)

1. Scaffold SolidStart project (`npm create solid@latest`) with SSR enabled.
2. Install & configure Vanilla Extract (`@vanilla-extract/css`, `@vanilla-extract/vite-plugin`, `@vanilla-extract/sprinkles` optionally).
3. Set up Nitro `node-server` preset and a basic health-check server function.
4. Build the landing page (`/`) with create/join UI.
5. Implement in-memory room store + HTTP endpoints.
6. Wire up WebSocket handler and room broadcast logic.
7. Build the room UI (`/[roomId]`) — member list, cards, reveal, reset.
8. Polish responsive layout & theme tokens.
9. Add V2 features (history, timer, settings).

---

*Last updated: 2026-05-12*
