import WebSocket from "ws";
import { events } from "common/events";

export const handleEvent = (ws: WebSocket, type: string, payload: unknown) => {
  switch (type) {
    case events.create:
      console.log("Create room...", payload)
      break;

    case events.join:
      console.log("join room...", payload)
      break;

    case events.move:
      console.log("move event received with payload", payload)
      break;

    case events.resign:
      console.log("resign event received with payload", payload)
      break;

    case events.talk:
      console.log("messaging event received with payload", payload)
      break;
    default:
      console.warn("unknown event type received", type)

  }
}
