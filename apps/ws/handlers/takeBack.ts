import { gameStore } from "redis/gamestore";
import { getChess } from "../utils/chessManager";
import { broadcast } from "../utils/broadcaster";
import { events } from "common/events";

export async function handleTakebackResponse(user: any, payload: any) {
  const { gameId, accepted } = payload;

  const game = await gameStore.findById(gameId);
  if (!game) throw new Error("Game not found");

  if (!accepted) return;

  const chess = await getChess(gameId);
  chess.undo();

  const updatedGame = await gameStore.undoMove(gameId);
  updatedGame.fen = chess.fen();

  await gameStore.saveGamePublic(updatedGame);

  await broadcast(gameId, events.takebackApplied, {
    gameId,
    fen: chess.fen(),
    currentTurn: chess.turn() === "w" ? "white" : "black",
  });
}
