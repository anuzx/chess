import { WebSocketServer, WebSocket } from 'ws';
import { webSocketMessage } from 'common/schema';
import { extractToken, verifyJwt } from './auth';
import { handleEvent } from './handlers/eventHandler';

const wss = new WebSocketServer({ port: 8080 });

export const connections = new Map<string, WebSocket>();

wss.on('connection', (ws, req) => {

  ws.on('error', console.error)
  //ws://localhost:8080/?token=....

  if (!req.url) return ws.close(1008, "Missing token");

  const token = extractToken(req.url);
  const decoded = token ? verifyJwt(token) : null;

  if (!decoded || typeof decoded === "string") return ws.close(1008, "Invalid token");

  const payload = decoded as Record<string, unknown>;
  const userId = payload.id as string;
  if (!userId) return ws.close(1008, "Invalid token payload");

  // Use userId as id since the user store lives in the API process
  const user = { id: userId };

  // Register this connection
  connections.set(user.id, ws);

  console.log("Connected:", user);

  console.log("connected...", user)

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
      ws.send(
        JSON.stringify({
          type: "error",
          payload: { message: "Internal server error" },
        }),
      );
    }
  });

  //after discoonect clean the inmemory storage
  ws.on("close", () => {
    connections.delete(user.id);
    console.log(" Disconnected:", user.id);
  });
});

console.log("ws server running at port 8080")
