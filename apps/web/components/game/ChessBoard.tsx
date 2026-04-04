"use client"

import { useMemo } from "react"
import { Chess } from "chess.js"
import { ChessiroCanvas, type Dests, type Square } from "chessiro-canvas"
import Button from "../Button"
import type { Color } from "@/hooks/useChessGame"

interface ChessBoardProps {
  fen: string
  currentTurn: Color
  myColor: Color
  moveHistory: string[]
  takebackRequest: boolean
  lastMove: { from: string; to: string } | null
  onMove: (from: string, to: string, promotion?: string) => void
  onResign: () => void
  onRequestTakeback: () => void
  onRespondTakeback: (accepted: boolean) => void
}

export function ChessBoard({
  fen,
  currentTurn,
  myColor,
  moveHistory,
  takebackRequest,
  lastMove,
  onMove,
  onResign,
  onRequestTakeback,
  onRespondTakeback,
}: ChessBoardProps) {

  if (!myColor) return <div className="text-white">Loading...</div>

  const chess = useMemo(() => new Chess(fen), [fen])
  const isMyTurn = currentTurn === myColor

  // build legal moves map
  const dests = useMemo<Dests>(() => {
    if (!isMyTurn) return new Map()

    const map = new Map<Square, Square[]>()
    const moves = chess.moves({ verbose: true })

    for (const move of moves) {
      const from = move.from as Square
      const to = move.to as Square

      if (!map.has(from)) map.set(from, [])
      map.get(from)!.push(to)
    }

    return map
  }, [chess, isMyTurn])

  const turnChar = chess.turn()

  const chessiroLastMove = useMemo(() => {
    if (!lastMove) return undefined
    return {
      from: lastMove.from as Square,
      to: lastMove.to as Square,
    }
  }, [lastMove])

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col lg:flex-row items-center justify-center gap-6 p-4">

      {/* BOARD */}
      <div className="w-full max-w-120">
        <ChessiroCanvas
          position={fen}
          orientation={myColor === "white" ? "white" : "black"}
          interactive={true}
          turnColor={turnChar}
          movableColor={isMyTurn ? turnChar : undefined}
          dests={dests}
          lastMove={chessiroLastMove}
          onMove={(from, to, promotion) => {
            const localChess = new Chess(fen)

            const result = localChess.move({
              from,
              to,
              promotion: promotion ?? undefined,
            })

            if (!result) return false

            onMove(from, to, result.promotion || undefined)
            return true
          }}
        />

        {/* PLAYER INFO */}
        <div className="flex items-center justify-between mt-3">
          <span className="text-white capitalize">
            You are: {myColor}
          </span>
          <span className={isMyTurn ? "text-green-400" : "text-zinc-500"}>
            {isMyTurn ? "Your turn" : "Waiting..."}
          </span>
        </div>
      </div>

      {/* SIDE PANEL */}
      <div className="w-full max-w-120 lg:max-w-55 flex flex-col gap-3">

        {takebackRequest && (
          <div className="bg-zinc-800 border border-zinc-600 rounded-lg p-3 text-center">
            <p className="text-white text-sm mb-3">
              Opponent wants to take back
            </p>
            <div className="flex gap-2">
              <Button onClick={() => onRespondTakeback(true)} className="flex-1">
                Accept
              </Button>
              <button
                onClick={() => onRespondTakeback(false)}
                className="flex-1 border border-zinc-600 text-zinc-300 rounded-md"
              >
                Decline
              </button>
            </div>
          </div>
        )}

        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3">
          <p className="text-zinc-400 text-sm mb-2">Moves</p>
          <div className="max-h-56 overflow-y-auto text-xs text-white">
            {moveHistory.length === 0 ? "No moves yet" : moveHistory.join(" ")}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onRequestTakeback}
            disabled={moveHistory.length === 0}
            className="flex-1 border border-zinc-600 text-zinc-300 rounded-md py-2"
          >
            Takeback
          </button>
          <button
            onClick={onResign}
            className="flex-1 border border-red-800 text-red-400 rounded-md py-2"
          >
            Resign
          </button>
        </div>
      </div>
    </main>
  )
}
