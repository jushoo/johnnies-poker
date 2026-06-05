import { createSignal, For, Show } from "solid-js";
import type { RoundHistoryEntry } from "~/lib/room-store";
import { vars } from "~/styles/theme.css";

interface VotingHistoryProps {
  history: RoundHistoryEntry[];
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export function VotingHistory(props: VotingHistoryProps) {
  const [expanded, setExpanded] = createSignal(false);

  return (
    <Show when={props.history.length > 0}>
      <div
        style={{
          width: "100%",
          "max-width": "640px",
          "margin-top": vars.space.md,
        }}
      >
        <button
          onClick={() => setExpanded((prev) => !prev)}
          style={{
            display: "flex",
            "align-items": "center",
            "justify-content": "space-between",
            width: "100%",
            padding: `${vars.space.sm} ${vars.space.md}`,
            "border-radius": vars.radius.md,
            border: `1px solid ${vars.color.border}`,
            "background-color": vars.color.surface,
            color: vars.color.text,
            "font-size": vars.fontSize.sm,
            "font-weight": vars.fontWeight.medium,
          }}
        >
          <span>Voting History ({props.history.length})</span>
          <span>{expanded() ? "▼" : "▶"}</span>
        </button>

        <Show when={expanded()}>
          <div
            style={{
              display: "flex",
              "flex-direction": "column",
              gap: vars.space.sm,
              "max-height": "400px",
              overflow: "auto",
              "margin-top": vars.space.sm,
            }}
          >
            <For each={[...props.history].reverse()}>
              {(entry, reverseIdx) => {
                const roundNum = () => props.history.length - reverseIdx();
                return (
                  <div
                    style={{
                      padding: vars.space.md,
                      "border-radius": vars.radius.md,
                      border: `1px solid ${vars.color.border}`,
                      "background-color": vars.color.surface,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        "justify-content": "space-between",
                        "align-items": "baseline",
                        "margin-bottom": vars.space.sm,
                      }}
                    >
                      <span
                        style={{
                          "font-weight": vars.fontWeight.semibold,
                          "font-size": vars.fontSize.sm,
                          color: vars.color.text,
                        }}
                      >
                        Round {roundNum()}
                        {entry.issue ? ` — ${entry.issue}` : ""}
                      </span>
                      <span
                        style={{
                          "font-size": vars.fontSize.xs,
                          color: vars.color.textMuted,
                        }}
                      >
                        {timeAgo(entry.completedAt)}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        "flex-wrap": "wrap",
                        gap: vars.space.xs,
                        "margin-bottom": vars.space.sm,
                      }}
                    >
                      <For each={entry.votes}>
                        {(vote) => (
                          <span
                            style={{
                              "font-size": vars.fontSize.xs,
                              padding: `${vars.space.xs} ${vars.space.sm}`,
                              "border-radius": vars.radius.full,
                              border: `1px solid ${vars.color.borderStrong}`,
                              "background-color": vars.color.surfaceHover,
                              color: vars.color.text,
                            }}
                          >
                            {vote.name}:{" "}
                            <span style={{ "font-weight": vars.fontWeight.semibold }}>
                              {vote.value}
                            </span>
                          </span>
                        )}
                      </For>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: vars.space.md,
                        "font-size": vars.fontSize.xs,
                        color: vars.color.textMuted,
                      }}
                    >
                      <span>
                        Avg: <strong>{entry.stats?.average ?? "-"}</strong>
                      </span>
                      <span>
                        Median: <strong>{entry.stats?.median ?? "-"}</strong>
                      </span>
                      <span>
                        Mode: <strong>{entry.stats?.mode ?? "-"}</strong>
                      </span>
                      <span>
                        Agreement: <strong>{entry.stats?.agreement ?? 0}%</strong>
                      </span>
                    </div>
                  </div>
                );
              }}
            </For>
          </div>
        </Show>
      </div>
    </Show>
  );
}
