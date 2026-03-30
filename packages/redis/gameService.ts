import { gameStore } from "./gamestore.ts"
import { prisma } from "../db/index.ts"
import type { GameRecord } from "./gamestore.ts"

class GameService {
  async endGame(gameId: string, winner: string | null, reason: string) {
    // 1. End game in Redis
    const game = await gameStore.endGame(gameId, winner, reason)

    // 2. Decide if we should save — only if at least one player is not a guest
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

    // resolve winner user ID → color for clean DB storage and frontend display
    const winnerColour = game.winner
      ? game.players.find(p => p.id === game.winner)?.color ?? null
      : null

    await prisma.game.create({
      data: {
        whiteId: white?.isGuest ? null : white?.id,
        blackId: black?.isGuest ? null : black?.id,
        winnerColour,        // "white" | "black" | null  (replaces winnerId)
        endReason: game.endReason,
        moves: game.moves as any,
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
