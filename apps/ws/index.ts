import { WebSocketServer, WebSocket } from 'ws';
import { webSocketMessage } from 'common/schema';
import { verifyJwt } from './auth';
import { handleEvent } from './handlers/eventHandler';
import crypto from "crypto";
import { URL } from "url";

const wss = new WebSocketServer({ port: 8080 });

export const connections = new Map<string, WebSocket>();

wss.on('connection', (ws, req) => {
  ws.on('error', console.error);

  let userId: string;
  let isGuest = false;

  // Parse query params from the WS URL
  const reqUrl = req.url ?? "/";
  const params = new URL(reqUrl, "ws://localhost:8080").searchParams;
  const token = params.get("token");    // logged-in users send ?token=
  const guestId = params.get("guestId"); // guests send ?guestId=

  console.log("[WS] token:", token ? "present" : "null");
  console.log("[WS] guestId from params:", guestId);

  if (token) {
    // Authenticated user
    try {
      const decoded = verifyJwt(token);
      if (decoded && typeof decoded !== "string") {
        const payload = decoded as Record<string, unknown>;
        userId = payload.id as string;
        if (!userId) {
          ws.close(1008, "Invalid token payload");
          return;
        }
      } else {
        // Invalid token — fall through to guest
        userId = guestId ?? `guest-${crypto.randomUUID()}`;
        isGuest = true;
      }
    } catch {
      userId = guestId ?? `guest-${crypto.randomUUID()}`;
      isGuest = true;
    }
  } else if (guestId) {
    // Guest with a known ID from the HTTP API room creation
    // CRITICAL: must use this exact ID since it matches what's stored in Redis
    userId = guestId;
    isGuest = true;
  } else {
    // Completely new guest (joiner who never called the HTTP API)
    userId = `guest-${crypto.randomUUID()}`;
    isGuest = true;
  }

  const user = { id: userId, isGuest };
  connections.set(user.id, ws);
  console.log("[WS] Connected:", user.id, "| isGuest:", isGuest);

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
    console.log("[WS] Disconnected:", user.id);
  });
});

console.log("[WS] Server running on port 8080....");
