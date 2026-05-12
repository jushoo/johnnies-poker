import { JSX } from "solid-js";
import { cardRecipe } from "~/styles/recipes/card.css";

interface CardProps {
  children: JSX.Element;
  padding?: "none" | "sm" | "md" | "lg";
  shadow?: "none" | "sm" | "md";
  class?: string;
  style?: JSX.CSSProperties;
}

export function Card(props: CardProps) {
  return (
    <div
      class={`${cardRecipe({
        padding: props.padding,
        shadow: props.shadow,
      })} ${props.class ?? ""}`}
      style={props.style}
    >
      {props.children}
    </div>
  );
}
