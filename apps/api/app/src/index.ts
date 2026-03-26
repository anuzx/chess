import { Elysia } from "elysia";

const app = new Elysia().get("/", () => "Hello Elysia")

import { authRouter } from "./routes/auth.route";
app.use(authRouter)

app.listen(3000, () => console.log("server running at 3000..."));

