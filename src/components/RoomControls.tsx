import { Show } from "solid-js";
import { Button } from "~/components/ui/Button";
import { vars } from "~/styles/theme.css";

interface RoomControlsProps {
  issue: string;
  votesRevealed: boolean;
  voteCount: number;
  onIssueChange: (issue: string) => void;
  onReveal: () => void;
  onReset: () => void;
}

export function RoomControls(props: RoomControlsProps) {
  return (
    <div
      style={{
        display: "flex",
        "flex-direction": "column",
        gap: vars.space.md,
        width: "100%",
        "max-width": "640px",
      }}
    >
      <input
        type="text"
        value={props.issue}
        onBlur={(e) => props.onIssueChange(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            props.onIssueChange(e.currentTarget.value);
          }
        }}
        placeholder="Enter issue title..."
        style={{
          width: "100%",
          padding: `${vars.space.sm} ${vars.space.md}`,
          "border-radius": vars.radius.md,
          border: `1px solid ${vars.color.border}`,
          "background-color": vars.color.surface,
          color: vars.color.text,
          "font-size": vars.fontSize.base,
          outline: "none",
        }}
      />

      <Show
        when={props.votesRevealed}
        fallback={
          <Button
            size="lg"
            fullWidth
            onClick={props.onReveal}
            disabled={props.voteCount === 0}
          >
            Reveal votes
          </Button>
        }
      >
        <Button variant="secondary" size="lg" fullWidth onClick={props.onReset}>
          New round
        </Button>
      </Show>
    </div>
  );
}
