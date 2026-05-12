import { vars } from "~/styles/theme.css";

interface PokerCardProps {
  value: string;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}

export function PokerCard(props: PokerCardProps) {
  return (
    <button
      disabled={props.disabled}
      onClick={props.onClick}
      style={{
        display: "flex",
        "align-items": "center",
        "justify-content": "center",
        width: "52px",
        height: "80px",
        "border-radius": vars.radius.md,
        border: props.selected
          ? `2px solid ${vars.color.primary}`
          : `1px solid ${vars.color.border}`,
        "background-color": props.disabled
          ? vars.color.surfaceHover
          : vars.color.surface,
        color: vars.color.text,
        "font-size": vars.fontSize.lg,
        "font-weight": vars.fontWeight.semibold,
        cursor: props.disabled ? "not-allowed" : "pointer",
        "box-shadow": props.selected
          ? `0 4px 12px rgba(0,0,0,0.12)`
          : "0 1px 3px rgba(0,0,0,0.06)",
        transition: "transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease",
        "flex-shrink": 0,
      }}
      onMouseEnter={(e) => {
        if (!props.disabled) {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.1)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = props.selected
          ? "0 4px 12px rgba(0,0,0,0.12)"
          : "0 1px 3px rgba(0,0,0,0.06)";
      }}
    >
      {props.value}
    </button>
  );
}
