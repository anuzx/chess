import { WebSocket } from "ws";

function send(ws: WebSocket, type: string, payload: Record<string, unknown>) {
  ws.send(JSON.stringify({ type, payload }));
}

export { send }
