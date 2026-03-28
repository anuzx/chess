import { WebSocket } from "ws";
import { broadcast } from "../utils/broadcaster";
import { events } from "common/events";
import { gameService } from "redis/gameService";
import { deleteChess } from "../utils/chessManager";

export async function handleResign(ws: WebSocket, user: any, payload: any) {
  const gameId = payload?.gameId;
  if (!gameId) throw new Error("Missing gameId");

  const game = await gameService.resign(gameId, user.id);

  deleteChess(gameId);

  await broadcast(gameId, events.resign, {
    gameId,
    winner: game.winner,
    endReason: "resign",
  });
}
