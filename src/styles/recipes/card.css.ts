import { recipe } from "@vanilla-extract/recipes";
import { vars } from "../theme.css";

export const cardRecipe = recipe({
  base: {
    backgroundColor: vars.color.background,
    border: `1px solid ${vars.color.border}`,
    borderRadius: vars.radius.lg,
    padding: vars.space.lg,
  },
  variants: {
    padding: {
      none: { padding: vars.space.none },
      sm: { padding: vars.space.md },
      md: { padding: vars.space.lg },
      lg: { padding: vars.space.xl },
    },
    shadow: {
      none: {},
      sm: { boxShadow: vars.shadow.sm },
      md: { boxShadow: vars.shadow.md },
    },
  },
  defaultVariants: {
    padding: "md",
    shadow: "none",
  },
});
