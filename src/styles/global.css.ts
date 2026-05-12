import { globalStyle } from "@vanilla-extract/css";
import { vars } from "./theme.css";

globalStyle("#app", {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
});

globalStyle("h1, h2, h3, h4, h5, h6", {
  fontWeight: vars.fontWeight.semibold,
  lineHeight: vars.lineHeight.tight,
  letterSpacing: "-0.025em",
});

globalStyle("p", {
  color: vars.color.textMuted,
});
