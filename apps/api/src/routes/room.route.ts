import { Elysia } from "elysia"
import { OptionalAuth } from "../middleware/optionalAuth"
import { gameStore } from "redis/gamestore"
import { FRONTEND_URL } from "common/constants"
import crypto from "crypto"

export const roomRouter = new Elysia({ prefix: "/api/room" })
  .use(OptionalAuth)
  .post("/create", async ({ user, isGuest }) => {
    // user is the decoded JWT payload if logged in, null if guest
    const creatorId = user?.id ?? `guest-${crypto.randomUUID()}`

    const game = await gameStore.createGame(creatorId, isGuest)

    return {
      link: `${FRONTEND_URL}/game/${game.id}`,
      gameId: game.id,
      creatorId, // guest must store this in localStorage
    }
  })
