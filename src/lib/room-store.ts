import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";

export interface Member {
  id: string;
  name: string;
  isSpectator: boolean;
  voted: boolean;
}

export interface VoteEntry {
  memberId: string;
  name: string;
  value: string;
}

export interface VoteStats {
  average: number | null;
  median: number | null;
  mode: string | null;
  agreement: number;
}

export interface RoomState {
  roomId: string;
  members: Member[];
  currentIssue: string;
  votesRevealed: boolean;
  myVote: string | null;
  votes: VoteEntry[];
  stats: VoteStats | null;
}

export function createRoomStore(initialRoomId: string) {
  const [state, setState] = createStore<RoomState>({
    roomId: initialRoomId,
    members: [],
    currentIssue: "",
    votesRevealed: false,
    myVote: null,
    votes: [],
    stats: null,
  });

  const [connected, setConnected] = createSignal(false);

  function addMember(member: Member) {
    setState("members", (prev) => [...prev, member]);
  }

  function removeMember(memberId: string) {
    setState("members", (prev) => prev.filter((m) => m.id !== memberId));
  }

  function setVoted(memberId: string) {
    setState("members", (m) => m.id === memberId, "voted", true);
  }

  function setRevealed(votes: VoteEntry[], stats: VoteStats) {
    setState({
      votesRevealed: true,
      votes,
      stats,
    });
  }

  function setMyVote(value: string) {
    setState("myVote", value);
  }

  function resetRound() {
    setState({
      votesRevealed: false,
      myVote: null,
      votes: [],
      stats: null,
    });
    setState("members", (prev) => prev.map((m) => ({ ...m, voted: false })));
  }

  function setIssue(issue: string) {
    setState("currentIssue", issue);
  }

  function setMembers(members: Member[]) {
    setState("members", members);
  }

  return {
    state,
    setState,
    connected,
    setConnected,
    addMember,
    removeMember,
    setVoted,
    setRevealed,
    setMyVote,
    resetRound,
    setIssue,
    setMembers,
  };
}
