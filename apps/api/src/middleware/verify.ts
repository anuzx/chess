import { JWT_SECRET } from "common/constants"
import { Elysia } from "elysia"
import jwt from "jsonwebtoken"

export const VerifyUser = new Elysia({ name: "verify-user" }) // name is required
  .derive({ as: "scoped" }, ({ headers, set }) => {
    const authHeader = headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      set.status = 401
      throw new Error("Unauthorized: No token provided")
    }
    const token = authHeader.split(" ")[1]
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload
      return { user: decoded }
    } catch {
      set.status = 401
      throw new Error("Unauthorized: Invalid token")
    }
  })
