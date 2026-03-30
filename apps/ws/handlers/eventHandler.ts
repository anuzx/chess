import { WebSocket } from "ws";
import { events } from "common/events";
import { handleJoinRoom } from "./joinRoomHandler";
import { handleCreateRoom } from "./createRoomHandler";
import { handleMove } from "./moveHandler";
import { handleResign } from "./resignHandler";
import { handleTalk } from "./talkHandler"
import { handleTakebackRequest, handleTakebackResponse } from "./takeBack";


interface AuthenticatedUser {
  id: string;
}

export const handleEvent = async (
  ws: WebSocket,
  user: AuthenticatedUser,
  type: string,
  payload: Record<string, unknown> | undefined) => {

  switch (type) {
    case events.create:
      await handleCreateRoom(ws, user, payload)
      break;

    case events.join:
      await handleJoinRoom(ws, user, payload)
      break;

    case events.move:
      await handleMove(ws, user, payload)
      break;

    case events.resign:
      await handleResign(ws, user, payload)
      break;

    case events.takebackRequest:
      await handleTakebackRequest(ws, user, payload);
      break;

    case events.takebackResponse:
      await handleTakebackResponse(ws, user, payload);
      break;

    case events.talk:
      await handleTalk(ws, user, payload)
      break;
    default:
      console.warn("unknown event type received", type)

  }
}
