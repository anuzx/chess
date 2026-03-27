import Elysia from "elysia";
import { handleSignup, handleLogin } from "../controllers/auth.controller";


export const authRouter = new Elysia({ prefix: "/api/auth" })
  .post("/signup", handleSignup)
  .post("/login", handleLogin)
