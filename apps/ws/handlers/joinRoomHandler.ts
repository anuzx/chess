import { WebSocket } from "ws";
import { gameStore } from "redis/gamestore";
import { events } from "common/events";
import { send } from "../utils/send";
import { connections } from "..";

export async function handleJoinRoom(ws: WebSocket, user: any, payload: any) {
  const gameId = payload?.gameId;
  if (!gameId) throw new Error("Missing gameId");

  const game = await gameStore.joinGame(gameId, user.id, user.isGuest);

  // Tell the joining player (black) their color + current board state
  send(ws, events.join, {
    gameId: game.id,
    color: "black",
    status: game.status,
    fen: game.fen,
  });

  // Notify the creator (white) that their opponent has joined so the game can start.
  // We need to find the creator's WS connection and send directly to them.
  const creator = game.players.find((p) => p.color === "white");
  if (creator) {
    const creatorWs = connections.get(creator.id);
    if (creatorWs) {
      send(creatorWs, events.join, {
        gameId: game.id,
        opponentJoined: true,
        status: game.status,
        fen: game.fen,
      });
    }
  }
}
