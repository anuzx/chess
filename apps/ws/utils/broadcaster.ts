import { WebSocket } from "ws";
import { gameStore } from "redis/gamestore";
import { connections } from "../index";

export async function broadcast(
  gameId: string,
  type: string,
  payload: Record<string, unknown>,
) {
  const game = await gameStore.findById(gameId);
  if (!game) return;

  const msg = JSON.stringify({ type, payload });

  for (const player of game.players) {
    const ws = connections.get(player.id);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(msg);
    }
  }
}
