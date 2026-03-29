import { WebSocketServer, WebSocket } from 'ws';
import { webSocketMessage } from 'common/schema';
import { extractToken, verifyJwt } from './auth';
import { handleEvent } from './handlers/eventHandler';
import crypto from "crypto";

const wss = new WebSocketServer({ port: 8080 });

export const connections = new Map<string, WebSocket>();

wss.on('connection', (ws, req) => {

  ws.on('error', console.error);

  let userId: string;
  let isGuest = false;

  // Auth logic
  if (!req.url) {
    userId = "guest-" + crypto.randomUUID();
    isGuest = true;
  } else {
    const token = extractToken(req.url);
    const decoded = token ? verifyJwt(token) : null;

    if (!decoded || typeof decoded === "string") {
      userId = "guest-" + crypto.randomUUID();
      isGuest = true;
    } else {
      const payload = decoded as Record<string, unknown>;
      userId = payload.id as string;

      if (!userId) {
        ws.close(1008, "Invalid token payload");
        return;
      }
    }
  }

  // ALWAYS create user
  const user = {
    id: userId,
    isGuest
  };

  // ALWAYS register connection
  connections.set(user.id, ws);

  console.log("Connected:", user);

  ws.on('message', async (raw) => {
    try {
      const parsed = webSocketMessage.safeParse(JSON.parse(raw.toString()));

      if (!parsed.success) {
        console.error("Invalid message:", raw.toString());
        return;
      }

      const { type, payload } = parsed.data;

      await handleEvent(ws, user, type, payload);

    } catch (err) {
      console.error("Message handling error:", err);
      ws.send(JSON.stringify({
        type: "error",
        payload: { message: "Internal server error" },
      }));
    }
  });

  ws.on("close", () => {
    connections.delete(user.id);
    console.log("Disconnected:", user.id);
  });
});

console.log("ws server running at port 8080");
