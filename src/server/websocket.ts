// Server-side WebSocket handler scaffold
// Wire-up: this will be connected to Nitro's websocket layer in app.config.ts
// or via a custom server entry when we implement real-time features.

export interface ServerRoom {
  id: string;
  createdAt: number;
  members: Map<string, ServerMember>;
  currentIssue?: string;
  votesRevealed: boolean;
  votes: Map<string, string>; // memberId -> vote value
}

export interface ServerMember {
  id: string;
  name: string;
  isSpectator: boolean;
  socket: unknown; // WebSocket instance — typed as unknown until crossws types are available
}

const rooms = new Map<string, ServerRoom>();

export function getOrCreateRoom(roomId: string): ServerRoom {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      id: roomId,
      createdAt: Date.now(),
      members: new Map(),
      votesRevealed: false,
      votes: new Map(),
    });
  }
  return rooms.get(roomId)!;
}

export function removeRoom(roomId: string) {
  rooms.delete(roomId);
}

export function broadcast(room: ServerRoom, message: Record<string, unknown>) {
  const data = JSON.stringify(message);
  for (const member of room.members.values()) {
    const ws = member.socket as { readyState: number; send: (d: string) => void };
    if (ws.readyState === 1) {
      ws.send(data);
    }
  }
}

// TODO: integrate with Nitro websocket hook:
// nitroApp.hooks.hook('crossws:message', ...)
