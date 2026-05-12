import { useParams, useNavigate } from "@solidjs/router";
import { createEffect, createSignal, onMount, Show } from "solid-js";
import { createWebSocket } from "~/lib/websocket";
import { createRoomStore } from "~/lib/room-store";
import { vars } from "~/styles/theme.css";
import { Button } from "~/components/ui/Button";
import { MemberList } from "~/components/MemberList";
import { PokerHand } from "~/components/PokerHand";
import { VoteResults } from "~/components/VoteResults";
import { RoomControls } from "~/components/RoomControls";

function CopyLinkButton() {
  const [copied, setCopied] = createSignal(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <Button variant="secondary" size="sm" onClick={handleCopy}>
      {copied() ? "Copied!" : "Copy link"}
    </Button>
  );
}

function ConnectionBadge(props: { status: string }) {
  const label = () =>
    props.status === "open"
      ? "Connected"
      : props.status === "connecting"
      ? "Connecting..."
      : props.status === "error"
      ? "Error"
      : "Disconnected";

  const bg = () =>
    props.status === "open"
      ? "#dcfce7"
      : props.status === "connecting"
      ? "#fef9c3"
      : "#fee2e2";

  const color = () =>
    props.status === "open"
      ? "#166534"
      : props.status === "connecting"
      ? "#854d0e"
      : "#991b1b";

  return (
    <span
      style={{
        "font-size": vars.fontSize.sm,
        padding: `${vars.space.xs} ${vars.space.sm}`,
        "border-radius": vars.radius.full,
        "background-color": bg(),
        color: color(),
      }}
    >
      {label()}
    </span>
  );
}

export default function Room() {
  const params = useParams();
  const navigate = useNavigate();
  const roomId = params.roomId;

  const [name, setName] = createSignal("");
  const [hasName, setHasName] = createSignal(false);

  const store = createRoomStore(roomId);

  onMount(() => {
    const savedName = sessionStorage.getItem("johnnies-poker-name");
    if (!savedName?.trim()) {
      navigate(`/?redirect=/${roomId}`);
      return;
    }
    setName(savedName);
    setHasName(true);
  });

  const ws = createWebSocket(roomId);

  createEffect(() => {
    store.setConnected(ws.status() === "open");
  });

  createEffect(() => {
    const msg = ws.lastMessage();
    if (!msg) return;

    switch (msg.type) {
      case "room_state": {
        const p = msg.payload as any;
        store.setMembers(p.members || []);
        store.setIssue(p.currentIssue || "");
        if (p.votesRevealed && p.votes) {
          store.setRevealed(p.votes, p.stats);
        } else {
          store.setState({
            votesRevealed: false,
            votes: [],
            stats: null,
          });
        }
        break;
      }
      case "member_joined": {
        const p = msg.payload as any;
        if (p.member) store.addMember(p.member);
        break;
      }
      case "member_left": {
        const p = msg.payload as any;
        if (p.memberId) store.removeMember(p.memberId);
        break;
      }
      case "member_voted": {
        const p = msg.payload as any;
        if (p.memberId) store.setVoted(p.memberId);
        break;
      }
      case "reveal_result": {
        const p = msg.payload as any;
        if (p.votes && p.stats) store.setRevealed(p.votes, p.stats);
        break;
      }
      case "round_reset": {
        store.resetRound();
        break;
      }
      case "issue_updated": {
        const p = msg.payload as any;
        if (p.issue !== undefined) store.setIssue(p.issue);
        break;
      }
    }
  });

  createEffect(() => {
    if (ws.status() === "open" && name()) {
      ws.send({
        type: "join",
        payload: { name: name(), isSpectator: false },
      });
    }
  });

  const handleVote = (value: string) => {
    if (store.state.votesRevealed) return;
    store.setMyVote(value);
    ws.send({ type: "vote", payload: { value } });
  };

  const handleReveal = () => {
    ws.send({ type: "reveal" });
  };

  const handleReset = () => {
    ws.send({ type: "reset" });
  };

  const handleIssueChange = (issue: string) => {
    store.setIssue(issue);
    ws.send({ type: "issue_change", payload: { issue } });
  };

  const voteCount = () => store.state.members.filter((m) => m.voted).length;

  return (
    <main
      style={{
        flex: 1,
        display: "flex",
        "flex-direction": "column",
        "align-items": "center",
        gap: vars.space.lg,
        padding: vars.space.lg,
        "background-color": vars.color.surface,
        "min-height": "100vh",
      }}
    >
      <header
        style={{
          display: "flex",
          "flex-direction": "column",
          "align-items": "center",
          gap: vars.space.sm,
          "margin-bottom": vars.space.md,
        }}
      >
        <div
          style={{
            display: "flex",
            "align-items": "center",
            gap: vars.space.md,
          }}
        >
          <h1
            style={{
              "font-size": vars.fontSize["2xl"],
              "font-weight": vars.fontWeight.semibold,
              color: vars.color.text,
            }}
          >
            Room {roomId}
          </h1>
          <CopyLinkButton />
        </div>
        <ConnectionBadge status={ws.status()} />
      </header>

      <Show when={hasName()}>
        <MemberList members={store.state.members} />

        <Show
          when={store.state.votesRevealed}
          fallback={
            <div style={{ width: "100%", "max-width": "640px" }}>
              <p
                style={{
                  "text-align": "center",
                  color: vars.color.textMuted,
                  "margin-bottom": vars.space.md,
                }}
              >
                {voteCount() === 0
                  ? "Waiting for votes..."
                  : `${voteCount()} of ${store.state.members.length} voted`}
              </p>
              <PokerHand
                selected={store.state.myVote}
                disabled={!store.connected()}
                onVote={handleVote}
              />
            </div>
          }
        >
          <VoteResults votes={store.state.votes} stats={store.state.stats} />
        </Show>

        <RoomControls
          issue={store.state.currentIssue}
          votesRevealed={store.state.votesRevealed}
          voteCount={voteCount()}
          onIssueChange={handleIssueChange}
          onReveal={handleReveal}
          onReset={handleReset}
        />
      </Show>
    </main>
  );
}
