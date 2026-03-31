import { redis } from "./index.ts";
import type { GameRecord, Move, PieceColor, GameStatus, Player } from "./types.ts";

export type ColorPreference = "white" | "black" | "random";

const GAME_KEY = (id: string) => `game:${id}`;

class GameStore {
  private async getGame(gameId: string): Promise<GameRecord | null> {
    const data = await redis.get(GAME_KEY(gameId));
    return data ? JSON.parse(data) : null;
  }

  private async saveGame(game: GameRecord): Promise<void> {
    await redis.set(GAME_KEY(game.id), JSON.stringify(game), "EX", 3600);
  }

  async createGame(
    playerId: string,
    isGuest: boolean,
    colorPreference: ColorPreference = "random"
  ): Promise<GameRecord> {
    // resolve the actual color from preference
    let creatorColor: PieceColor;
    if (colorPreference === "random") {
      creatorColor = Math.random() < 0.5 ? "white" : "black";
    } else {
      creatorColor = colorPreference;
    }

    const game: GameRecord = {
      id: crypto.randomUUID(),
      players: [{ id: playerId, color: creatorColor, isGuest }],
      moves: [],
      status: "waiting",
      currentTurn: "white",
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      winner: null,
      endReason: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.saveGame(game);
    return game;
  }

  async joinGame(gameId: string, playerId: string, isGuest: boolean): Promise<GameRecord> {
    const game = await this.getGame(gameId);
    if (!game) throw new Error("Game not found");
    if (game.status !== "waiting") throw new Error("Game is not accepting players");
    if (game.players.length >= 2) throw new Error("Game is full");
    if (game.players.some((p) => p.id === playerId)) throw new Error("Already in this game");

    // joiner always gets the opposite of whatever the creator picked
    const creatorColor = game.players[0].color;
    const joinerColor: PieceColor = creatorColor === "white" ? "black" : "white";

    game.players.push({ id: playerId, color: joinerColor, isGuest });
    game.status = "active";
    game.updatedAt = new Date().toISOString();
    await this.saveGame(game);
    return game;
  }

  async getPlayerColor(gameId: string, playerId: string): Promise<PieceColor | null> {
    const game = await this.getGame(gameId);
    if (!game) return null;
    const player = game.players.find((p) => p.id === playerId);
    return player?.color ?? null;
  }

  async addMove(
    gameId: string,
    playerId: string,
    move: { from: string; to: string; promotion?: string },
    san: string,
    fen: string,
  ): Promise<GameRecord> {
    const game = await this.getGame(gameId);
    if (!game) throw new Error("Game not found");
    if (game.status !== "active") throw new Error("Game is not active");

    game.moves.push({
      from: move.from,
      to: move.to,
      san,
      fen,
      playerId,
      timestamp: new Date().toISOString(),
    });
    game.fen = fen;
    game.currentTurn = game.currentTurn === "white" ? "black" : "white";
    game.updatedAt = new Date().toISOString();
    await this.saveGame(game);
    return game;
  }

  async endGame(gameId: string, winner: string | null, reason: string): Promise<GameRecord> {
    const game = await this.getGame(gameId);
    if (!game) throw new Error("Game not found");
    if (game.status === "completed") return game;

    game.status = "completed";
    game.winner = winner;
    game.endReason = reason;
    game.updatedAt = new Date().toISOString();
    await this.saveGame(game);
    return game;
  }

  async resign(gameId: string, playerId: string): Promise<GameRecord> {
    const game = await this.getGame(gameId);
    if (!game) throw new Error("Game not found");
    if (game.status !== "active") throw new Error("Game is not active");

    const opponent = game.players.find((p) => p.id !== playerId);
    if (!opponent) throw new Error("No opponent found");

    return this.endGame(gameId, opponent.id, "resign");
  }

  async undoMove(gameId: string): Promise<GameRecord> {
    const game = await this.getGame(gameId);
    if (!game) throw new Error("Game not found");
    if (game.status !== "active") throw new Error("Game is not active");
    if (game.moves.length === 0) throw new Error("No moves to undo");

    game.moves.pop();
    game.currentTurn = game.currentTurn === "white" ? "black" : "white";
    game.updatedAt = new Date().toISOString();
    await this.saveGame(game);
    return game;
  }

  async saveGamePublic(game: GameRecord): Promise<void> {
    await this.saveGame(game);
  }

  async findById(id: string): Promise<GameRecord | null> {
    return this.getGame(id);
  }
}

export const gameStore = new GameStore();
export type { GameRecord, Player, Move, PieceColor, GameStatus };
