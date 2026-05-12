import { createSignal, createEffect, onCleanup } from "solid-js";

interface WSMessage {
  type: string;
  payload?: Record<string, unknown>;
}

export function createWebSocket(url: string) {
  const [readyState, setReadyState] = createSignal<number>(WebSocket.CONNECTING);
  const [lastMessage, setLastMessage] = createSignal<WSMessage | null>(null);

  const ws = new WebSocket(url);

  ws.onopen = () => setReadyState(WebSocket.OPEN);
  ws.onclose = () => setReadyState(WebSocket.CLOSED);
  ws.onerror = () => setReadyState(WebSocket.CLOSED);
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data) as WSMessage;
      setLastMessage(data);
    } catch {
      // ignore non-JSON messages
    }
  };

  onCleanup(() => {
    ws.close();
  });

  const send = (message: WSMessage) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  };

  return { readyState, lastMessage, send };
}
