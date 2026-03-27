import Elysia from "elysia";
import { VerifyUser } from "../middleware/verify";
import { createRoom } from "../controllers/room.controller";

export const roomRouter = new Elysia({ prefix: "/api/room" })
  .use(VerifyUser)
  .get("/create", createRoom)
