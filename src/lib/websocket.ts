import { createSignal, onCleanup } from "solid-js";

export type WSStatus = "connecting" | "open" | "closed" | "error";

export interface WSMessage {
  type: string;
  payload?: Record<string, unknown>;
}

export function createWebSocket(roomId: string) {
  const [status, setStatus] = createSignal<WSStatus>("connecting");
  const [lastMessage, setLastMessage] = createSignal<WSMessage | null>(null);

  let ws: WebSocket | null = null;
  let reconnectAttempt = 0;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  const MAX_RETRIES = 5;

  const protocol =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "wss:"
      : "ws:";
  const host =
    typeof window !== "undefined" ? window.location.host : "localhost:3000";
  const isDev =
    typeof window !== "undefined" && host.includes("localhost");
  const wsUrl = isDev
    ? `ws://localhost:3000/ws?room=${encodeURIComponent(roomId)}`
    : `${protocol}//${host}/ws?room=${encodeURIComponent(roomId)}`;

  function connect() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    if (ws) {
      ws.onopen = null;
      ws.onclose = null;
      ws.onerror = null;
      ws.onmessage = null;
      try {
        ws.close();
      } catch {
        // ignore
      }
    }

    setStatus("connecting");
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      reconnectAttempt = 0;
      setStatus("open");
      startHeartbeat();
    };

    ws.onclose = () => {
      setStatus("closed");
      stopHeartbeat();
      scheduleReconnect();
    };

    ws.onerror = () => {
      setStatus("error");
      stopHeartbeat();
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WSMessage;
        setLastMessage(data);
      } catch {
        // ignore non-JSON messages
      }
    };
  }

  function scheduleReconnect() {
    if (reconnectAttempt >= MAX_RETRIES) return;
    reconnectAttempt++;
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempt - 1), 10000);
    reconnectTimer = setTimeout(() => {
      connect();
    }, delay);
  }

  function startHeartbeat() {
    stopHeartbeat();
    heartbeatInterval = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "ping" }));
      }
    }, 30000);
  }

  function stopHeartbeat() {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  }

  function send(message: WSMessage) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  function close() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    stopHeartbeat();
    if (ws) {
      ws.onopen = null;
      ws.onclose = null;
      ws.onerror = null;
      ws.onmessage = null;
      try {
        ws.close();
      } catch {
        // ignore
      }
      ws = null;
    }
  }

  connect();

  onCleanup(() => {
    close();
  });

  return { status, lastMessage, send, close };
}
