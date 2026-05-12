import { recipe } from "@vanilla-extract/recipes";
import { vars } from "../theme.css";

export const inputRecipe = recipe({
  base: {
    width: "100%",
    padding: `${vars.space.sm} ${vars.space.md}`,
    fontSize: vars.fontSize.sm,
    lineHeight: vars.lineHeight.normal,
    color: vars.color.text,
    backgroundColor: vars.color.background,
    border: `1px solid ${vars.color.border}`,
    borderRadius: vars.radius.md,
    outline: "none",
    transition: "border-color 150ms ease, box-shadow 150ms ease",
    selectors: {
      "&:hover": {
        borderColor: vars.color.borderStrong,
      },
      "&:focus": {
        borderColor: vars.color.primary,
        boxShadow: `0 0 0 1px ${vars.color.primary}`,
      },
      "&::placeholder": {
        color: vars.color.textMuted,
      },
    },
  },
  variants: {
    size: {
      sm: {
        padding: `${vars.space.xs} ${vars.space.sm}`,
        fontSize: vars.fontSize.xs,
        borderRadius: vars.radius.sm,
      },
      md: {},
      lg: {
        padding: `${vars.space.md} ${vars.space.lg}`,
        fontSize: vars.fontSize.base,
        borderRadius: vars.radius.lg,
      },
    },
  },
  defaultVariants: {
    size: "md",
  },
});
