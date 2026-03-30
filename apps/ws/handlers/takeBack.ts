import { gameStore } from "redis/gamestore";
import { getChess } from "../utils/chessManager";
import { broadcast } from "../utils/broadcaster";
import { events } from "common/events";
import { send } from "../utils/send";
import { sendError } from "../utils/sendError";
import { WebSocket } from "ws";
import { connections } from "..";

export async function handleTakebackRequest(
  ws: WebSocket,
  user: any,
  payload: Record<string, unknown> | undefined,
) {
  try {
    const gameId = payload?.gameId as string;
    if (!gameId) return sendError(ws, "Missing gameId");

    const game = await gameStore.findById(gameId);
    if (!game) return sendError(ws, "Game not found");
    if (game.status !== "active") return sendError(ws, "Game is not active");
    if (game.moves.length === 0) return sendError(ws, "No moves to undo");

    // Send request to opponent
    const opponent = game.players.find((p) => p.id !== user.id);
    if (!opponent) return sendError(ws, "No opponent found");

    const opponentWs = connections.get(opponent.id);
    if (opponentWs && opponentWs.readyState === WebSocket.OPEN) {
      send(opponentWs, events.takebackRequest, { gameId, requestedBy: user.id });
    }
  } catch (err) {
    sendError(ws, (err as Error).message);
  }
}


export async function handleTakebackResponse(
  ws: WebSocket,
  user: any,
  payload: Record<string, unknown> | undefined,
) {
  try {
    const gameId = payload?.gameId as string;
    const accepted = payload?.accepted as boolean;
    if (!gameId) return sendError(ws, "Missing gameId");

    const game = await gameStore.findById(gameId);
    if (!game) return sendError(ws, "Game not found");
    if (game.status !== "active") return sendError(ws, "Game is not active");

    if (!accepted) {
      // Notify requester that takeback was declined
      const requester = game.players.find((p) => p.id !== user.id);
      if (requester) {
        const reqWs = connections.get(requester.id);
        if (reqWs && reqWs.readyState === WebSocket.OPEN) {
          send(reqWs, events.takebackResponse, { gameId, accepted: false });
        }
      }
      return;
    }

    // Undo the move
    if (game.moves.length === 0) return sendError(ws, "No moves to undo");

    const chess = await getChess(gameId);
    chess.undo();

    const updatedGame = await gameStore.undoMove(gameId);
    updatedGame.fen = chess.fen();
    await gameStore.saveGamePublic(updatedGame);

    // Broadcast the undo to both players
    await broadcast(gameId, events.takebackApplied, {
      gameId,
      fen: chess.fen(),
      currentTurn: chess.turn() === "w" ? "white" : "black",
    });
  } catch (err) {
    sendError(ws, (err as Error).message);
  }
}
