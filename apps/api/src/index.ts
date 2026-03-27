import "dotenv/config"
import { Elysia } from "elysia";

const app = new Elysia().get("/", () => "Hello Elysia")

import { authRouter } from "./routes/auth.route";
import { roomRouter } from "./routes/room.route";

app.use(authRouter)
app.use(roomRouter)
app.listen(3000, () => console.log("server running at 3000..."));

