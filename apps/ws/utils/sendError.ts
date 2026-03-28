import { WebSocket } from "ws";

function sendError(ws: WebSocket, message: string) {
  ws.send(JSON.stringify({ type: "error", payload: { message } }));
}

export { sendError }
