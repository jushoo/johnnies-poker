import { recipe } from "@vanilla-extract/recipes";
import { vars } from "../theme.css";

export const buttonRecipe = recipe({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: vars.space.sm,
    padding: `${vars.space.sm} ${vars.space.md}`,
    borderRadius: vars.radius.md,
    fontSize: vars.fontSize.sm,
    fontWeight: vars.fontWeight.medium,
    lineHeight: vars.lineHeight.tight,
    transition: "background-color 150ms ease, border-color 150ms ease, color 150ms ease",
    whiteSpace: "nowrap",
    userSelect: "none",
  },
  variants: {
    variant: {
      primary: {
        backgroundColor: vars.color.primary,
        color: vars.color.textInverse,
        border: `1px solid ${vars.color.primary}`,
        selectors: {
          "&:hover": {
            backgroundColor: vars.color.primaryHover,
          },
        },
      },
      secondary: {
        backgroundColor: vars.color.surface,
        color: vars.color.text,
        border: `1px solid ${vars.color.border}`,
        selectors: {
          "&:hover": {
            backgroundColor: vars.color.surfaceHover,
          },
        },
      },
      ghost: {
        backgroundColor: "transparent",
        color: vars.color.textMuted,
        border: "1px solid transparent",
        selectors: {
          "&:hover": {
            backgroundColor: vars.color.surface,
            color: vars.color.text,
          },
        },
      },
    },
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
    fullWidth: {
      true: {
        width: "100%",
      },
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});
