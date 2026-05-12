import { JSX, splitProps } from "solid-js";
import { inputRecipe } from "~/styles/recipes/input.css";

interface InputProps {
  name?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  size?: "sm" | "md" | "lg";
  required?: boolean;
  autofocus?: boolean;
  onInput?: (value: string) => void;
  onKeyDown?: (e: KeyboardEvent) => void;
}

export function Input(props: InputProps) {
  const [local, rest] = splitProps(props, ["onInput"]);

  return (
    <input
      {...rest}
      class={inputRecipe({ size: props.size })}
      onInput={(e) => local.onInput?.(e.currentTarget.value)}
    />
  );
}
