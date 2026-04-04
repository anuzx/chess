import { WebSocket } from "ws";
import { gameStore } from "redis/gamestore";
import { connections } from "../index";
import { events } from "common/events";

export async function handleJoinRoom(ws: WebSocket, user: any, payload: any) {
  const gameId = payload?.gameId;
  if (!gameId) throw new Error("Missing gameId");

  const game = await gameStore.joinGame(gameId, user.id, user.isGuest);

  const joiner = game.players.find(p => p.id === user.id)!;
  const creator = game.players.find(p => p.id !== user.id)!;

  // LOGS 
  //console.log("=== JOIN ROOM DEBUG ===")
  //console.log("joiner  id:", joiner.id, "| color:", joiner.color)
  //console.log("creator id:", creator.id, "| color:", creator.color)
  //console.log("connections keys:", [...connections.keys()])
  //console.log("creator WS found?", connections.has(creator.id))
  const currentTurn = game.fen.includes(" w ") ? "white" : "black";

  // Notify creator — opponent joined, game starting
  const creatorWs = connections.get(creator.id)
  if (creatorWs && creatorWs.readyState === WebSocket.OPEN) {
    creatorWs.send(JSON.stringify({
      type: events.join,
      payload: {
        opponentJoined: true,
        gameId,
        fen: game.fen,
        color: creator.color,
        currentTurn
      }
    }))
    console.log("Sent join event to creator")
  } else {
    console.error("Creator WS not found or not open. creator.id:", creator.id)
    console.error("connections map:", [...connections.entries()].map(([k]) => k))
  }

  // Notify joiner — here's your color and board state
  ws.send(JSON.stringify({
    type: events.join,
    payload: {
      opponentJoined: false,
      gameId,
      fen: game.fen,
      color: joiner.color,
      currentTurn
    }
  }))
  console.log("Sent join event to joiner")
}
