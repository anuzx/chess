import { Chess } from "chess.js";
import { gameStore } from "redis/gamestore";

const chessInstances = new Map<string, Chess>();

export async function getChess(gameId: string): Promise<Chess> {
  let chess = chessInstances.get(gameId);

  if (!chess) {
    const game = await gameStore.findById(gameId);
    if (!game) throw new Error("Game not found");

    chess = new Chess(game.fen);
    chessInstances.set(gameId, chess);
  }

  return chess;
}

export function deleteChess(gameId: string) {
  chessInstances.delete(gameId);
}
