# Next Steps — Johnny's Poker Implementation Plan

## Phase 1: WebSocket Integration (Foundation)

Everything depends on this. We need bidirectional real-time communication between clients and the Nitro server.

### 1.1 Add `crossws` dependency and configure Nitro WebSockets
- **File:** `app.config.ts`
- **Action:** Enable the experimental WebSocket layer in Nitro via `crossws`.
- **Details:**
  - Install `crossws` if not already present (it may be bundled with vinxi/nitro).
  - In `app.config.ts`, add `experimental: { websocket: true }` under the `nitro` or server config.
  - Verify the dev server still starts and the `/ws` route is reachable.

### 1.2 Rewrite `src/server/websocket.ts`
- **Action:** Replace the stub with a `crossws`-compatible message handler.
- **Requirements:**
  - Export a handler object with `open`, `message`, `close`, and `error` hooks.
  - On `open`: read `roomId` from the query string (`ws.url.searchParams`).
  - On `message`: parse JSON, dispatch by `type` field.
  - Maintain the in-memory `rooms` Map, but store `Peer` (crossws peer object) instead of raw WebSocket.
  - On `close`: remove member from room, broadcast `member_left` to remaining members.

### 1.3 Wire the server handler into the app
- **File:** `src/entry-server.tsx` or a dedicated server plugin file.
- **Action:** Import the crossws handler and attach it to the Nitro app lifecycle.
- **Details:**
  - Use `nitroApp.hooks.hook('crossws:message', ...)` or the equivalent SolidStart/Nitro API.
  - Ensure the handler runs in both `dev` and production (`node .output/server/index.mjs`).

### 1.4 Update client WebSocket hook
- **File:** `src/lib/websocket.ts`
- **Action:** Make `createWebSocket` production-ready.
- **Requirements:**
  - Accept `roomId` and construct the correct URL: `wss?` in prod, `ws://localhost:3000/ws?room=` in dev.
  - Auto-reconnect with exponential backoff (max 5 retries, then show error state).
  - Export connection status: `connecting`, `open`, `closed`, `error`.
  - Heartbeat/ping to detect stale connections (optional for MVP, nice-to-have).

### 1.5 Pass display name into the room
- **Problem:** The landing page (`/`) collects a name, but navigating to `/[roomId]` loses it.
- **Solution:** Use `sessionStorage`.
  - On "Create" or "Join", write `{ name: string }` to `sessionStorage`.
  - On the room page, read it on mount. If missing, redirect back to `/` with a query param `?redirect=/ABCD`.
  - Send the name in the first WS `join` message.

---

## Phase 2: Server State & Message Protocol

### 2.1 Finalize server data models
- **File:** `src/server/websocket.ts`
- **Models:**
  ```ts
  interface ServerRoom {
    id: string;
    createdAt: number;
    members: Map<string, ServerMember>;
    currentIssue: string;
    votesRevealed: boolean;
    votes: Map<string, string>; // memberId -> raw vote value (hidden from others)
  }

  interface ServerMember {
    id: string;
    name: string;
    isSpectator: boolean;
    peer: Peer; // crossws peer
  }
  ```

### 2.2 Implement all WS message handlers
| Message Type | Direction | Handler Logic |
|--------------|-----------|---------------|
| `join` | C → S | Add member to room, broadcast `member_joined` + full room state to the new member. |
| `vote` | C → S | Store vote in `room.votes`, broadcast `member_voted` (without the value) to all. |
| `reveal` | C → S | Set `votesRevealed = true`, broadcast `reveal_result` with all votes + calculated stats. |
| `reset` | C → S | Clear votes, set `votesRevealed = false`, broadcast `round_reset`. |
| `issue_change` | C → S | Update `room.currentIssue`, broadcast `issue_updated`. |
| `member_left` | S → C | Remove from local member list. |
| `member_joined` | S → C | Append to local member list. |
| `member_voted` | S → C | Mark that member as voted (but don't show value). |
| `reveal_result` | S → C | Store all votes and stats in local state, show results UI. |
| `round_reset` | S → C | Clear all votes, return to selection UI. |
| `issue_updated` | S → C | Update issue title in UI. |

### 2.3 Calculate statistics on reveal
- **File:** `src/server/websocket.ts` (or a utility)
- **Stats to compute:**
  - Average (numeric votes only; skip `?` and `☕`).
  - Median (same rule).
  - Mode (most common vote).
  - Agreement % (highest vote frequency / total voters).
- **Payload:**
  ```ts
  {
    votes: { memberId: string; name: string; value: string }[];
    stats: { average: number | null; median: number | null; mode: string | null; agreement: number };
  }
  ```

---

## Phase 3: Room UI (Poker Table)

### 3.1 Create `MemberList` component
- **File:** `src/components/MemberList.tsx`
- **Behavior:**
  - Display members in a grid or horizontal row.
  - Each member shows: initials avatar (e.g. "JD"), name, and a status dot.
  - Dot is gray if not voted, green if voted (but value is hidden until reveal).
  - Spectators get a small "spectator" badge.

### 3.2 Create `PokerCard` component
- **File:** `src/components/PokerCard.tsx`
- **Behavior:**
  - Renders a single Fibonacci value (e.g. `5`, `13`, `?`).
  - Vanilla Extract styles: default state, hover lift, selected state (border + shadow).
  - Disabled when votes are revealed or user is spectator.

### 3.3 Create `PokerHand` component
- **File:** `src/components/PokerHand.tsx`
- **Behavior:**
  - Horizontal scrollable row of `PokerCard`s.
  - Imports `FIBONACCI_SYSTEM` from `~/lib/constants`.
  - Tracks which card is selected locally.
  - On click: send `vote` WS message, update local `myVote`.

### 3.4 Create `VoteResults` component
- **File:** `src/components/VoteResults.tsx`
- **Behavior:**
  - Shown only when `votesRevealed` is true.
  - Grid of revealed cards (member name + their vote).
  - Stats bar: average, median, mode, agreement %.

### 3.5 Create `RoomControls` component
- **File:** `src/components/RoomControls.tsx`
- **Elements:**
  - Issue title input (editable, broadcasts `issue_change` on blur/enter).
  - "Reveal" button (disabled until at least one vote is cast).
  - "New round" / "Reset" button (shown after reveal).
  - Copy room link button (writes `window.location.href` to clipboard).

### 3.6 Assemble the room page
- **File:** `src/routes/[roomId].tsx`
- **Layout:**
  ```
  [Header: Room code + copy link]
  [Issue title input]
  [MemberList]
  [PokerHand  OR  VoteResults]
  [RoomControls]
  ```
- **State machine:**
  - `voting` → show PokerHand, "Waiting for votes..." text.
  - `revealed` → show VoteResults, "New round" button.

---

## Phase 4: Client State Management

### 4.1 Expand `room-store.ts`
- **Current:** Basic `RoomState` with members array.
- **Add:**
  - Actions: `addMember`, `removeMember`, `setVoted`, `setRevealed`, `setMyVote`, `resetRound`, `setIssue`.
  - Computed: `allVoted` (every non-spectator has voted), `voteCount`.
- **Integration:** Wire the store to the WS hook so incoming messages mutate state directly.

### 4.2 Handle reconnection gracefully
- If the WS drops and reconnects:
  - Re-send `join` message automatically.
  - Server should re-broadcast current room state to the reconnected client.

---

## Phase 5: Polish & Responsive Design

### 5.1 Mobile layout
- **PokerHand:** horizontal scroll with snap points (`scroll-snap-type: x mandatory`).
- **MemberList:** wrap to 2 rows on narrow screens.
- **VoteResults:** single column grid on mobile.
- **Controls:** stack vertically, full-width buttons.

### 5.2 Loading & empty states
- Skeleton loader while WS is connecting.
- "No members yet" placeholder if alone in room.
- Toast or inline message for WS errors.

### 5.3 Accessibility
- Keyboard navigation for poker cards (arrow keys, Enter to select).
- Focus rings on all interactive elements.
- `aria-live` region for status updates ("3 of 5 have voted").

---

## Phase 6: Build & Deploy

### 6.1 Production build verification
- `npm run build` must succeed without errors.
- `node .output/server/index.mjs` must serve both HTTP and WS on the same port.
- Verify WebSocket connections work in the built output (not just dev).

### 6.2 VPS deployment checklist
- [ ] Upload `.output/` directory (or clone repo and build on server).
- [ ] Ensure Node.js ≥20 is installed.
- [ ] Run with `pm2 start .output/server/index.mjs --name johnnies-poker`.
- [ ] Configure reverse proxy (Nginx/Caddy) for your domain, with `proxy_pass` and `proxy_http_version 1.1` for WebSocket `Upgrade` headers.
- [ ] Enable HTTPS (Let's Encrypt via Caddy or certbot).

### 6.3 Environment variables (optional)
- `PORT` — override default 3000.
- `NODE_ENV` — `production` for optimized builds.

---

## Task Breakdown Summary

| Phase | Tasks | Estimated Complexity |
|-------|-------|-------------------|
| 1 | WS config, handler wiring, client hook, name passing | High |
| 2 | Message protocol, server state, stats calculation | Medium |
| 3 | MemberList, PokerCard, PokerHand, VoteResults, RoomControls, page assembly | High |
| 4 | Store actions, reconnection logic | Medium |
| 5 | Mobile CSS, skeletons, a11y | Medium |
| 6 | Build test, pm2, reverse proxy, HTTPS | Low |

---

## Recommended Order of Attack

1. **Phase 1.1 → 1.3** (get any WS message flowing)
2. **Phase 1.4 → 1.5** (client can connect and send a `join`)
3. **Phase 2.1 → 2.2** (server handles the full protocol)
4. **Phase 3.1 → 3.3** (build the voting UI)
5. **Phase 3.5 → 3.6** (controls and page assembly)
6. **Phase 2.3** (stats math — can be done anytime after 2.2)
7. **Phase 4** (smooth out state and reconnection)
8. **Phase 5** (polish)
9. **Phase 6** (ship it)

---

*Last updated: 2026-05-12*
