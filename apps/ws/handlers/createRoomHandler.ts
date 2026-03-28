import { WebSocket } from "ws";
import { gameStore } from "redis/gamestore";
import { events } from "common/events";
import { send } from "../utils/send";

export async function handleCreateRoom(ws: WebSocket, user: any) {
  const game = await gameStore.createGame(user.id);
  send(ws, events.create, { gameId: game.id });
}
