import { WebSocket } from "ws";
import { gameStore } from "redis/gamestore";
import { events } from "common/events";
import { getChess, deleteChess } from "../utils/chessManager";
import { broadcast } from "../utils/broadcaster";
import { gameService } from "redis/gameService";
import { redis } from "redis/index"

export async function handleMove(ws: WebSocket, user: any, payload: any) {
  const { gameId, from, to, promotion } = payload;

  if (!gameId || !from || !to) {
    throw new Error("Missing move fields");
  }

  const game = await gameStore.findById(gameId);
  if (!game) throw new Error("Game not found");

  const playerColor = await gameStore.getPlayerColor(gameId, user.id);
  if (!playerColor) throw new Error("Not in game");

  const chess = await getChess(gameId);
  const expectedColor = chess.turn() === "w" ? "white" : "black";

  if (playerColor !== expectedColor) throw new Error("Not your turn");

  const result = chess.move({ from, to, promotion });
  if (!result) throw new Error("Illegal move");

  await gameStore.addMove(gameId, user.id, { from, to, promotion }, result.san, chess.fen());

  const movePayload: any = {
    gameId,
    from,
    to,
    san: result.san,
    fen: chess.fen(),
    currentTurn: chess.turn() === "w" ? "white" : "black",
  };

  if (chess.isGameOver()) {
    let winner: string | null = null;
    let reason: string;

    if (chess.isCheckmate()) {
      winner = user.id;
      reason = "checkmate";
    } else if (chess.isStalemate()) {
      reason = "stalemate";
    } else {
      reason = "draw";
    }

    await gameService.endGame(gameId, winner, reason);

    movePayload.gameOver = true;
    movePayload.winner = winner;
    movePayload.endReason = reason;
  }

  await broadcast(gameId, events.move, movePayload);

  // cleanup AFTER broadcast
  deleteChess(gameId);
  await redis.del(`game:${gameId}`);

  return;
}
