import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";

export interface Member {
  id: string;
  name: string;
  isSpectator: boolean;
  voted: boolean;
}

export interface RoomState {
  roomId: string;
  members: Member[];
  currentIssue: string;
  votesRevealed: boolean;
  myVote: string | null;
}

export function createRoomStore(initialRoomId: string) {
  const [state, setState] = createStore<RoomState>({
    roomId: initialRoomId,
    members: [],
    currentIssue: "",
    votesRevealed: false,
    myVote: null,
  });

  const [connected, setConnected] = createSignal(false);

  return {
    state,
    setState,
    connected,
    setConnected,
  };
}
