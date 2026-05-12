export interface Peer {
  id: string;
  request: Request;
  url?: URL;
  send(data: string): void;
}

export interface ServerRoom {
  id: string;
  createdAt: number;
  members: Map<string, ServerMember>;
  currentIssue: string;
  votesRevealed: boolean;
  votes: Map<string, string>; // memberId -> raw vote value
}

export interface ServerMember {
  id: string;
  name: string;
  isSpectator: boolean;
  peer: Peer;
}

interface PeerContext {
  roomId: string | null;
  memberId: string | null;
}

const rooms = new Map<string, ServerRoom>();

export function getOrCreateRoom(roomId: string): ServerRoom {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      id: roomId,
      createdAt: Date.now(),
      members: new Map(),
      currentIssue: "",
      votesRevealed: false,
      votes: new Map(),
    });
  }
  return rooms.get(roomId)!;
}

export function removeRoom(roomId: string) {
  rooms.delete(roomId);
}

export function broadcast(
  room: ServerRoom,
  message: Record<string, unknown>,
  excludePeerId?: string
) {
  const data = JSON.stringify(message);
  for (const member of room.members.values()) {
    if (excludePeerId && member.peer.id === excludePeerId) continue;
    try {
      member.peer.send(data);
    } catch {
      // ignore send errors
    }
  }
}

function getCtx(peer: Peer): PeerContext {
  if (!(peer as any).__ctx) {
    (peer as any).__ctx = { roomId: null, memberId: null };
  }
  return (peer as any).__ctx;
}

function calculateStats(room: ServerRoom) {
  const numericVotes: number[] = [];
  const voteCounts = new Map<string, number>();
  let totalVoters = 0;

  for (const [memberId, value] of room.votes.entries()) {
    const member = room.members.get(memberId);
    if (!member || member.isSpectator) continue;
    totalVoters++;

    voteCounts.set(value, (voteCounts.get(value) || 0) + 1);

    if (value !== "?" && value !== "☕") {
      const num = Number(value);
      if (!Number.isNaN(num)) {
        numericVotes.push(num);
      }
    }
  }

  numericVotes.sort((a, b) => a - b);

  const average =
    numericVotes.length > 0
      ? Number(
          (numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length).toFixed(2)
        )
      : null;

  const median =
    numericVotes.length > 0
      ? numericVotes.length % 2 === 1
        ? numericVotes[Math.floor(numericVotes.length / 2)]
        : Number(
            (
              (numericVotes[numericVotes.length / 2 - 1] +
                numericVotes[numericVotes.length / 2]) /
              2
            ).toFixed(2)
          )
      : null;

  let mode: string | null = null;
  let modeCount = 0;
  for (const [value, count] of voteCounts.entries()) {
    if (count > modeCount) {
      modeCount = count;
      mode = value;
    }
  }

  const agreement = totalVoters > 0 ? Math.round((modeCount / totalVoters) * 100) : 0;

  return { average, median, mode, agreement };
}

export function handleOpen(peer: Peer) {
  try {
    const url = new URL(peer.request.url, "http://localhost");
    const roomId = url.searchParams.get("room") || "";
    getCtx(peer).roomId = roomId;
  } catch {
    getCtx(peer).roomId = "";
  }
}

export function handleMessage(peer: Peer, rawMessage: string) {
  try {
    const data = JSON.parse(rawMessage);
    const ctx = getCtx(peer);
    const roomId = ctx.roomId;

    if (!roomId) return;

    const room = getOrCreateRoom(roomId);

    switch (data.type) {
      case "join": {
        const memberId = crypto.randomUUID();
        const member: ServerMember = {
          id: memberId,
          name: data.payload?.name || "Anonymous",
          isSpectator: data.payload?.isSpectator || false,
          peer,
        };
        room.members.set(memberId, member);
        ctx.memberId = memberId;

        // Send full room state to the new member
        peer.send(
          JSON.stringify({
            type: "room_state",
            payload: {
              roomId: room.id,
              members: Array.from(room.members.values()).map((m) => ({
                id: m.id,
                name: m.name,
                isSpectator: m.isSpectator,
                voted: room.votes.has(m.id),
              })),
              currentIssue: room.currentIssue,
              votesRevealed: room.votesRevealed,
              votes: room.votesRevealed
                ? Array.from(room.votes.entries()).map(([mid, value]) => {
                    const m = room.members.get(mid);
                    return { memberId: mid, name: m?.name || "", value };
                  })
                : [],
              stats: room.votesRevealed ? calculateStats(room) : null,
            },
          })
        );

        // Broadcast member_joined to others
        broadcast(
          room,
          {
            type: "member_joined",
            payload: {
              member: {
                id: memberId,
                name: member.name,
                isSpectator: member.isSpectator,
                voted: false,
              },
            },
          },
          peer.id
        );
        break;
      }

      case "vote": {
        const memberId = ctx.memberId;
        if (!memberId || !room.members.has(memberId)) break;
        if (room.members.get(memberId)!.isSpectator) break;
        if (room.votesRevealed) break;

        const value = String(data.payload?.value || "");
        room.votes.set(memberId, value);

        broadcast(room, {
          type: "member_voted",
          payload: { memberId },
        });
        break;
      }

      case "reveal": {
        const memberId = ctx.memberId;
        if (!memberId || !room.members.has(memberId)) break;

        room.votesRevealed = true;
        const stats = calculateStats(room);
        const votes = Array.from(room.votes.entries()).map(([mid, value]) => {
          const m = room.members.get(mid);
          return { memberId: mid, name: m?.name || "", value };
        });

        broadcast(room, {
          type: "reveal_result",
          payload: { votes, stats },
        });
        break;
      }

      case "reset": {
        const memberId = ctx.memberId;
        if (!memberId || !room.members.has(memberId)) break;

        room.votes.clear();
        room.votesRevealed = false;

        broadcast(room, {
          type: "round_reset",
          payload: {},
        });
        break;
      }

      case "issue_change": {
        const memberId = ctx.memberId;
        if (!memberId || !room.members.has(memberId)) break;

        const issue = String(data.payload?.issue || "");
        room.currentIssue = issue;

        broadcast(room, {
          type: "issue_updated",
          payload: { issue },
        });
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error("WS message error:", err);
  }
}

export function handleClose(peer: Peer) {
  const ctx = getCtx(peer);
  const roomId = ctx.roomId;
  const memberId = ctx.memberId;

  if (roomId && memberId) {
    const room = rooms.get(roomId);
    if (room) {
      room.members.delete(memberId);
      room.votes.delete(memberId);

      if (room.members.size === 0) {
        removeRoom(roomId);
      } else {
        broadcast(room, {
          type: "member_left",
          payload: { memberId },
        });
      }
    }
  }
}
