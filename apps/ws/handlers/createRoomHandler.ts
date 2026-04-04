import { WebSocket } from "ws";
import { gameStore } from "redis/gamestore";
import { events } from "common/events";
import { send } from "../utils/send";

/**
 * Called when the creator's WS client connects and confirms their gameId.
 * The game already exists in Redis (created by the HTTP API).
 * We subscribe them to the room and tell them their color.
 */
export async function handleCreateRoom(ws: WebSocket, user: any, payload: any) {
  const gameId = payload?.gameId;
  if (!gameId) throw new Error("Missing gameId");

  const game = await gameStore.findById(gameId);
  if (!game) throw new Error("Game not found");

  // Confirm creator is actually in this game
  const player = game.players.find((p) => p.id === user.id);
  if (!player) throw new Error("You are not the creator of this game");

  // Tell the creator their color so the frontend can orient the board
  send(ws, events.create, {
    fen: game.fen,
    currentTurn: game.fen.includes(" w ") ? "white" : "black",
    gameId: game.id,
    color: player.color, // "white"
    status: game.status,
  });
}
