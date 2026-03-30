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

  // resolve winner user ID → color so frontend can display "White wins!"
  const winnerColor = game.winner
    ? game.players.find((p) => p.id === game.winner)?.color ?? null
    : null;

  await broadcast(gameId, events.resign, {
    gameId,
    winner: winnerColor,  // "white" | "black" | null
    endReason: "resign",
  });

  // cleanup AFTER broadcast
  deleteChess(gameId);
  await redis.del(`game:${gameId}`);
}
