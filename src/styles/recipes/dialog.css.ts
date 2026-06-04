import { recipe } from "@vanilla-extract/recipes";
import { keyframes, style } from "@vanilla-extract/css";
import { vars } from "../theme.css";

const overlayIn = keyframes({
  from: { opacity: "0" },
  to: { opacity: "1" },
});

const contentIn = keyframes({
  from: {
    opacity: "0",
    transform: "translateY(12px) scale(0.97)",
  },
  to: {
    opacity: "1",
    transform: "translateY(0) scale(1)",
  },
});

export const overlay = style({
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0, 0, 0, 0.4)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: vars.space.lg,
  zIndex: 100,
  animation: `${overlayIn} 200ms ease-out`,
});

export const content = style({
  backgroundColor: vars.color.background,
  borderRadius: vars.radius.xl,
  border: `1px solid ${vars.color.border}`,
  boxShadow:
    "0 20px 60px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.03)",
  padding: vars.space.xl,
  width: "100%",
  maxWidth: "380px",
  animation: `${contentIn} 250ms ease-out`,
});

export const title = style({
  fontSize: vars.fontSize.lg,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.text,
  marginBottom: vars.space.xs,
});

export const description = style({
  fontSize: vars.fontSize.sm,
  color: vars.color.textMuted,
  marginBottom: vars.space.lg,
});
