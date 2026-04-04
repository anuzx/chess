import Button from "../Button"
import type { Color } from "@/hooks/useChessGame"

interface GameOverProps {
  winner: Color | null
  endReason: string | null
  myColor: Color | null
}

export function GameOver({ winner, endReason, myColor }: GameOverProps) {
  const iWon = winner !== null && winner === myColor

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-6 p-8">
      <h2 className="text-white text-3xl font-bold capitalize">
        {winner ? `${winner} wins!` : "Draw"}
      </h2>
      <p className="text-zinc-400 capitalize">{endReason}</p>
      <p className="text-zinc-300 text-lg font-semibold">
        {iWon ? "🏆 You won!" : winner ? "You lost." : "It's a draw."}
      </p>
      <Button onClick={() => { window.location.href = "/" }}>
        Back to Home
      </Button>
    </main>
  )
}
