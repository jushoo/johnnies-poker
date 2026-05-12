import { For } from "solid-js";
import type { VoteEntry, VoteStats } from "~/lib/room-store";
import { vars } from "~/styles/theme.css";

interface VoteResultsProps {
  votes: VoteEntry[];
  stats: VoteStats | null;
}

export function VoteResults(props: VoteResultsProps) {
  return (
    <div
      style={{
        display: "flex",
        "flex-direction": "column",
        gap: vars.space.lg,
        width: "100%",
        "max-width": "640px",
      }}
    >
      <div
        style={{
          display: "grid",
          "grid-template-columns": "repeat(auto-fill, minmax(120px, 1fr))",
          gap: vars.space.md,
        }}
      >
        <For each={props.votes}>
          {(vote) => (
            <div
              style={{
                display: "flex",
                "flex-direction": "column",
                "align-items": "center",
                gap: vars.space.sm,
                padding: vars.space.md,
                "border-radius": vars.radius.md,
                border: `1px solid ${vars.color.border}`,
                "background-color": vars.color.surface,
              }}
            >
              <span
                style={{
                  "font-size": vars.fontSize.xl,
                  "font-weight": vars.fontWeight.bold,
                  color: vars.color.primary,
                }}
              >
                {vote.value}
              </span>
              <span
                style={{
                  "font-size": vars.fontSize.sm,
                  color: vars.color.textMuted,
                }}
              >
                {vote.name}
              </span>
            </div>
          )}
        </For>
      </div>

      {props.stats && (
        <div
          style={{
            display: "grid",
            "grid-template-columns": "repeat(4, 1fr)",
            gap: vars.space.md,
            padding: vars.space.md,
            "border-radius": vars.radius.md,
            border: `1px solid ${vars.color.border}`,
            "background-color": vars.color.surfaceHover,
          }}
        >
          <Stat label="Average" value={props.stats.average?.toString() ?? "-"} />
          <Stat label="Median" value={props.stats.median?.toString() ?? "-"} />
          <Stat label="Mode" value={props.stats.mode ?? "-"} />
          <Stat label="Agreement" value={`${props.stats.agreement}%`} />
        </div>
      )}
    </div>
  );
}

function Stat(props: { label: string; value: string }) {
  return (
    <div style={{ "text-align": "center" }}>
      <div
        style={{
          "font-size": vars.fontSize.xs,
          "text-transform": "uppercase",
          "letter-spacing": "0.05em",
          color: vars.color.textMuted,
          "margin-bottom": vars.space.xs,
        }}
      >
        {props.label}
      </div>
      <div
        style={{
          "font-size": vars.fontSize.xl,
          "font-weight": vars.fontWeight.bold,
          color: vars.color.text,
        }}
      >
        {props.value}
      </div>
    </div>
  );
}
