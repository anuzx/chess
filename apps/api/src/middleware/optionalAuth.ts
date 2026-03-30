import { JWT_SECRET } from "common/constants"
import { Elysia } from "elysia"
import jwt from "jsonwebtoken"

export const OptionalAuth = new Elysia({ name: "optional-auth" }) // name is required for type propagation
  .derive({ as: "scoped" }, ({ headers }) => {
    const authHeader = headers.authorization
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1]
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload
        return { user: decoded, isGuest: false }
      } catch {
        // invalid token — fall through to guest
      }
    }
    return { user: null as jwt.JwtPayload | null, isGuest: true }
  })
