import { useParams } from "@solidjs/router";
import { vars } from "~/styles/theme.css";

export default function Room() {
  const params = useParams();

  return (
    <main
      style={{
        flex: 1,
        display: "flex",
        "flex-direction": "column",
        "align-items": "center",
        "justify-content": "center",
        padding: vars.space.lg,
        "background-color": vars.color.surface,
      }}
    >
      <h1
        style={{
          "font-size": vars.fontSize["2xl"],
          "font-weight": vars.fontWeight.semibold,
          "margin-bottom": vars.space.md,
        }}
      >
        Room {params.roomId}
      </h1>
      <p style={{ color: vars.color.textMuted }}>
        Room page scaffold — real-time connection coming soon.
      </p>
    </main>
  );
}
