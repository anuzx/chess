import { WebSocketServer } from 'ws';
import { webSocketMessage } from 'common/schema';
import { events } from 'common/events';
const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws, req) => {
  ws.on('error', console.error);



  ws.on('message', (raw) => {
    //ws://localhost:8080?token=....

    const { data, success } = webSocketMessage.safeParse(JSON.stringify(raw.toString()))

    if (!success) {
      console.error("invalid message", raw.toString())
      return
    }

    switch (data.type) {
      case events.create:
        console.log("Create room event received with payload", data.payload)
        break;

      case events.join:
        console.log("join room event received with payload", data.payload)
        break;

      case events.move:
        console.log("move event received with payload", data.payload)
        break;

      case events.resign:
        console.log("resign event received with payload", data.payload)
        break;

      case events.talk:
        console.log("messaging event received with payload", data.payload)
        break;
      default:
        console.warn("unknown event type received", data.type)
    }
  });

  ws.send('something');
});

console.log("ws server running at port 8080")
