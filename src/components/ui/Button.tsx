import { JSX } from "solid-js";
import { buttonRecipe } from "~/styles/recipes/button.css";

interface ButtonProps {
  children: JSX.Element;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
}

export function Button(props: ButtonProps) {
  return (
    <button
      type={props.type ?? "button"}
      disabled={props.disabled}
      onClick={props.onClick}
      class={buttonRecipe({
        variant: props.variant,
        size: props.size,
        fullWidth: props.fullWidth,
      })}
    >
      {props.children}
    </button>
  );
}
