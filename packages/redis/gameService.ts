import { redis } from "./index.ts"
import { gameStore } from "./gamestore.ts"
import { prisma } from "../db/index.ts"

class GameService {
  async endGame(gameId: string, winner: string | null, reason: string) {
    // 1. End game in Redis
    const game = await gameStore.endGame(gameId, winner, reason)

    // 2. Decide if we should save
    const shouldSave =
      game.players.length === 2 &&
      game.players.some(p => !p.isGuest)

    if (shouldSave) {
      await this.saveGameToDB(game)
    }

    return game
  }

  private async saveGameToDB(game: GameRecord) {
    const white = game.players.find(p => p.color === "white")
    const black = game.players.find(p => p.color === "black")

    await prisma.game.create({
      data: {
        whiteId: white?.isGuest ? null : white?.id,
        blackId: black?.isGuest ? null : black?.id,
        winnerId: game.winner,
        endReason: game.endReason,
        moves: game.moves,
        finalFen: game.fen
      }
    })
  }

  async resign(gameId: string, playerId: string) {
    const game = await gameStore.findById(gameId);
    if (!game) throw new Error("Game not found");

    const opponent = game.players.find(p => p.id !== playerId);
    if (!opponent) throw new Error("No opponent");

    return this.endGame(gameId, opponent.id, "resign");
  }


}


export const gameService = new GameService();
