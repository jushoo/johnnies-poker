import { eventHandler } from "vinxi/http";
import { handleOpen, handleMessage, handleClose } from "./server/websocket";

export default eventHandler({
  handler() {},
  websocket: {
    open(peer) {
      handleOpen(peer);
    },
    message(peer, msg) {
      handleMessage(peer, msg.text());
    },
    close(peer) {
      handleClose(peer);
    },
    error(_peer, err) {
      console.error("WebSocket error:", err);
    },
  },
});
