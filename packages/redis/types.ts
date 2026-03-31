export type PieceColor = "white" | "black" | "random";

export type GameStatus = "waiting" | "active" | "completed" | "abandoned";

export interface Player {
  id: string;
  color: PieceColor;
  isGuest: boolean;
}

export interface Move {
  from: string;
  to: string;
  san: string;
  fen: string;
  playerId: string;
  timestamp: string;
}

export interface GameRecord {
  id: string;
  players: Player[];
  moves: Move[];
  status: GameStatus;
  currentTurn: PieceColor;
  fen: string;
  winner: string | null;
  endReason: string | null;
  createdAt: string;
  updatedAt: string;
}
