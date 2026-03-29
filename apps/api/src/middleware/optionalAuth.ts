import { JWT_SECRET } from "common/constants"
import { Elysia } from "elysia"
import jwt from "jsonwebtoken"

export const OptionalAuth = new Elysia()
  .derive(({ headers }) => {
    const authHeader = headers.authorization

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1]
      try {
        const decoded = jwt.verify(token, JWT_SECRET)
        return {
          user: decoded as jwt.JwtPayload,
          isGuest: false,
        }
      } catch {
        // invalid token — treat as guest, don't throw
      }
    }

    // No token or invalid token → guest
    return {
      user: null,
      isGuest: true,
    }
  })
