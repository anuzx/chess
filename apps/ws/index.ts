import { WebSocketServer } from 'ws';
import { webSocketMessage } from 'common/schema';
import { extractToken, verifyJwt } from './auth';
import { handleEvent } from './handlers/eventHandler';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws, req) => {

  ws.on('error', console.error)
  //ws://localhost:8080/?token=....

  if (!req.url) {
    return ws.close(1008, "Missing token")
  }

  const token = extractToken(req.url)
  const user = token ? verifyJwt(token) : null

  if (!user) {
    return ws.close(1000, "invalid token")
  }

  console.log("connected...", user)

  ws.on('message', (raw) => {

    const { data, success } = webSocketMessage.safeParse(JSON.parse(raw.toString()))

    if (!success) {
      console.error("invalid message", raw.toString())
      return
    }
    handleEvent(ws, data.type, data.payload)
  });

  ws.send('something');
});

console.log("ws server running at port 8080")
