// {
//   "type": "talk",
//   "payload": {
//     "gameId": "abc-123",
//     "senderId": "white",
//     "message": "good move!",
//     "timestamp": "2026-03-30T10:00:00.000Z"
//   }
// }

import { WebSocket } from "ws";
import { gameStore } from "redis/gamestore";
import { events } from "common/events";
import { broadcast } from "../utils/broadcaster";

export async function handleTalk(ws: WebSocket, user: any, payload: any) {
  const { gameId, message } = payload;

  if (!gameId) throw new Error("Missing gameId");
  if (!message || !message.trim()) throw new Error("Message cannot be empty");

  const game = await gameStore.findById(gameId);
  if (!game) throw new Error("Game not found");

  const player = game.players.find((p) => p.id === user.id);
  if (!player) throw new Error("You are not in this game");

  await broadcast(gameId, events.talk, {
    gameId,
    senderId: player.color, // "white" or "black" — used as display name on frontend
    message: message.trim(),
    timestamp: new Date().toISOString(),
  });
}
