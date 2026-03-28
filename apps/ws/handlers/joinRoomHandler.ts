import { WebSocket } from "ws";
import { gameStore } from "redis/gamestore";
import { broadcast } from "../utils/broadcaster";
import { events } from "common/events";

export async function handleJoinRoom(ws: WebSocket, user: any, payload: any) {
  const gameId = payload?.gameId;
  if (!gameId) throw new Error("Missing gameId");

  const game = await gameStore.joinGame(gameId, user.id);

  await broadcast(gameId, events.join, {
    gameId: game.id,
    status: game.status,
    fen: game.fen,
  });
}
