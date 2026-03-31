import "dotenv/config"
import { Elysia } from "elysia";
import { cors } from '@elysiajs/cors'

const app = new Elysia().use(cors()).get("/", () => "Hello Elysia")

import { authRouter } from "./routes/auth.route";
import { roomRouter } from "./routes/room.route";

app.use(authRouter)
app.use(roomRouter)
app.listen(3002, () => console.log("server running at 3002..."));

