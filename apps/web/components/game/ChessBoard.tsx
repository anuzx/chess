"use client"

import { useMemo } from "react"
import { Chess } from "chess.js"
import { ChessiroCanvas, type Dests, type Square } from "chessiro-canvas"
import Button from "../Button"
import type { Color, ChatMessage } from "@/hooks/useChessGame"
import { ChatBox } from "../ChatBox"

interface ChessBoardProps {
  fen: string
  currentTurn: Color
  myColor: Color
  moveHistory: string[]
  messages: ChatMessage[]
  takebackRequest: boolean
  lastMove: { from: string; to: string } | null
  onMove: (from: string, to: string, promotion?: string) => void
  onResign: () => void
  onRequestTakeback: () => void
  onRespondTakeback: (accepted: boolean) => void
  onSendMessage: (message: string) => void
}

export function ChessBoard({
  fen,
  currentTurn,
  myColor,
  moveHistory,
  messages,
  takebackRequest,
  lastMove,
  onMove,
  onResign,
  onRequestTakeback,
  onRespondTakeback,
  onSendMessage,
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
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-6">

        {/* CHAT - LEFT */}
        <div className="w-full lg:w-[320px] xl:w-[380px] h-[75vh]">
          <ChatBox
            myColor={myColor}
            messages={messages}
            onSend={onSendMessage}
          />
        </div>

        {/* BOARD - CENTER */}
        <div className="flex-1 flex flex-col items-center">
          <div className="w-full max-w-[520px] xl:max-w-[600px]">
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
          </div>

          {/* PLAYER INFO */}
          <div className="flex items-center justify-between w-full max-w-[600px] mt-4 px-2">
            <span className="text-zinc-300 text-sm">
              You are: <span className="capitalize text-white">{myColor}</span>
            </span>
            <span className={`text-sm ${isMyTurn ? "text-green-400" : "text-zinc-500"}`}>
              {isMyTurn ? "Your turn" : "Waiting..."}
            </span>
          </div>
        </div>

        {/* SIDE PANEL */}
        <div className="w-full lg:w-[260px] flex flex-col gap-3">
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
            <div className="max-h-60 overflow-y-auto text-xs text-white leading-relaxed">
              {moveHistory.length === 0 ? "No moves yet" : moveHistory.join(" ")}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onRequestTakeback}
              disabled={moveHistory.length === 0}
              className="flex-1 border border-zinc-600 text-zinc-300 rounded-md py-2 hover:bg-zinc-800 transition"
            >
              Takeback
            </button>
            <button
              onClick={onResign}
              className="flex-1 border border-red-800 text-red-400 rounded-md py-2 hover:bg-red-900/20 transition"
            >
              Resign
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
