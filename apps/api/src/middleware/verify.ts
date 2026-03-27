import { Elysia } from "elysia"
import jwt from "jsonwebtoken"

export const VerifyUser = new Elysia()
  .derive(({ headers, set }) => {
    const authHeader = headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      set.status = 401
      throw new Error("Unauthorized: No token provided")
    }

    const token = authHeader.split(" ")[1]

    try {
      const decoded = jwt.verify(token, "your_secret_key")

      return {
        user: decoded
      }
    } catch (err) {
      set.status = 401
      throw new Error("Unauthorized: Invalid token")
    }
  })
