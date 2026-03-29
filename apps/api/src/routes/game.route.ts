
import { Elysia } from "elysia"
import { VerifyUser } from "../middleware/verify"
import { prisma } from "db"

export const gameRouter = new Elysia({ prefix: "/api/game" })
  .use(VerifyUser)
  .get("/history", async ({ user }) => {
    const games = await prisma.game.findMany({
      where: {
        OR: [
          { whiteId: user.id },
          { blackId: user.id },
        ]
      },
      orderBy: { createdAt: "desc" }
    })

    return { games }
  })
