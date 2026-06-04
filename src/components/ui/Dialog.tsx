import { JSX, Show, createEffect, onCleanup } from "solid-js";
import * as styles from "~/styles/recipes/dialog.css";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: JSX.Element;
}

export function Dialog(props: DialogProps) {
  let dialogRef: HTMLDivElement | undefined;

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") props.onClose();
  };

  createEffect(() => {
    if (props.open) {
      document.addEventListener("keydown", onKeyDown);
      document.body.style.overflow = "hidden";
      onCleanup(() => {
        document.removeEventListener("keydown", onKeyDown);
        document.body.style.overflow = "";
      });
    }
  });

  const handleOverlayClick = (e: MouseEvent) => {
    if (e.target === dialogRef) props.onClose();
  };

  return (
    <Show when={props.open}>
      <div
        ref={dialogRef}
        class={styles.overlay}
        onClick={handleOverlayClick}
        role="dialog"
        aria-modal="true"
      >
        <div class={styles.content}>{props.children}</div>
      </div>
    </Show>
  );
}

export function DialogTitle(props: { children: JSX.Element }) {
  return <h2 class={styles.title}>{props.children}</h2>;
}

export function DialogDescription(props: { children: JSX.Element }) {
  return <p class={styles.description}>{props.children}</p>;
}
