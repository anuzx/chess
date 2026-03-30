
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
      include: {
        white: { select: { id: true, name: true } },
        black: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: "desc" }
    })

    return { games }
  })
