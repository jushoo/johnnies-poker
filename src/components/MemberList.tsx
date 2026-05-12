import { For } from "solid-js";
import type { Member } from "~/lib/room-store";
import { vars } from "~/styles/theme.css";

interface MemberListProps {
  members: Member[];
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function MemberList(props: MemberListProps) {
  return (
    <div
      style={{
        display: "flex",
        "flex-wrap": "wrap",
        gap: vars.space.lg,
        "justify-content": "center",
        padding: vars.space.md,
      }}
    >
      <For each={props.members}>
        {(member) => (
          <div
            style={{
              display: "flex",
              "flex-direction": "column",
              "align-items": "center",
              gap: vars.space.sm,
            }}
          >
            <div
              style={{
                position: "relative",
                width: "48px",
                height: "48px",
                "border-radius": "50%",
                "background-color": vars.color.primary,
                color: "#fff",
                display: "flex",
                "align-items": "center",
                "justify-content": "center",
                "font-size": vars.fontSize.sm,
                "font-weight": vars.fontWeight.semibold,
              }}
            >
              {getInitials(member.name)}
              <span
                style={{
                  position: "absolute",
                  bottom: "2px",
                  right: "2px",
                  width: "12px",
                  height: "12px",
                  "border-radius": "50%",
                  "background-color": member.voted
                    ? "#22c55e"
                    : vars.color.textMuted,
                  border: `2px solid ${vars.color.surface}`,
                }}
              />
            </div>
            <div
              style={{
                "font-size": vars.fontSize.sm,
                "font-weight": vars.fontWeight.medium,
                color: vars.color.text,
                "text-align": "center",
                "max-width": "80px",
                overflow: "hidden",
                "text-overflow": "ellipsis",
                "white-space": "nowrap",
              }}
            >
              {member.name}
            </div>
            {member.isSpectator && (
              <span
                style={{
                  "font-size": "10px",
                  "text-transform": "uppercase",
                  "letter-spacing": "0.05em",
                  color: vars.color.textMuted,
                }}
              >
                spectator
              </span>
            )}
          </div>
        )}
      </For>
    </div>
  );
}
