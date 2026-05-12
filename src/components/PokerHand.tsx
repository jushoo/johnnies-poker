import { For } from "solid-js";
import { FIBONACCI_SYSTEM } from "~/lib/constants";
import { PokerCard } from "./PokerCard";
import { vars } from "~/styles/theme.css";

interface PokerHandProps {
  selected: string | null;
  disabled: boolean;
  onVote: (value: string) => void;
}

export function PokerHand(props: PokerHandProps) {
  return (
    <div
      style={{
        display: "flex",
        "flex-wrap": "wrap",
        "justify-content": "center",
        gap: vars.space.sm,
        padding: `${vars.space.sm} ${vars.space.md}`,
      }}
    >
      <For each={FIBONACCI_SYSTEM}>
        {(value) => (
          <PokerCard
            value={value}
            selected={props.selected === value}
            disabled={props.disabled}
            onClick={() => props.onVote(value)}
          />
        )}
      </For>
    </div>
  );
}
