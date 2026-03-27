import { JWT_SECRET } from "common/constants"
import jwt from "jsonwebtoken"

const PORT = 8080


export const verifyJwt = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    console.error(error)
    return null
  }
}

export const extractToken = (url: string): string | null => {
  return new URL(url, `http://localhost:${PORT}`).searchParams.get("token")
}
