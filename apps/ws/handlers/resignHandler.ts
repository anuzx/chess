import { WebSocket } from "ws";
import { broadcast } from "../utils/broadcaster";
import { events } from "common/events";
import { gameService } from "redis/gameService";
import { deleteChess } from "../utils/chessManager";
import { redis } from "redis/index";

export async function handleResign(ws: WebSocket, user: any, payload: any) {
  const gameId = payload?.gameId;
  if (!gameId) throw new Error("Missing gameId");

  const game = await gameService.resign(gameId, user.id);

  await broadcast(gameId, events.resign, {
    gameId,
    winner: game.winner,
    endReason: "resign",
  });

  // cleanup AFTER broadcast
  deleteChess(gameId);
  await redis.del(`game:${gameId}`);
}
