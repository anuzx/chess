"use client"

import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { Chessboard } from "react-chessboard"
import Button from "../../../components/Button"

type GamePhase = "waiting" | "joining" | "playing" | "finished"
type Color = "white" | "black"

interface GameState {
  fen: string
  currentTurn: Color
  phase: GamePhase
  color: Color | null
  winner: Color | null
  endReason: string | null
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8080"

export default function GamePage() {
  const { gameId } = useParams<{ gameId: string }>()
  const wsRef = useRef<WebSocket | null>(null)
  const isCreator = useRef(false)
  const initializedRef = useRef(false) // prevents double-init in StrictMode

  const [pageUrl, setPageUrl] = useState("")
  const [copied, setCopied] = useState(false)
  const [game, setGame] = useState<GameState>({
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    currentTurn: "white",
    phase: "joining",
    color: null,
    winner: null,
    endReason: null,
  })

  useEffect(() => {
    // StrictMode fix: only run once per mount
    if (initializedRef.current) return
    initializedRef.current = true

    setPageUrl(window.location.href)

    const pendingGameId = localStorage.getItem("pendingGameId")
    const token = localStorage.getItem("token")
    const guestId = localStorage.getItem("guestId")

    console.log("[Game page] pendingGameId:", pendingGameId)
    console.log("[Game page] gameId from URL:", gameId)
    console.log("[Game page] guestId:", guestId)
    console.log("[Game page] token:", token ? "present" : "null")

    // Check if this browser tab created this game
    if (pendingGameId === gameId) {
      isCreator.current = true
      // Remove AFTER we've read it — don't remove before WS connects
      localStorage.removeItem("pendingGameId")
    }

    let wsUrl = WS_URL
    if (token) {
      wsUrl += `?token=${token}`
    } else if (guestId) {
      wsUrl += `?guestId=${guestId}`
    }

    console.log("[Game page] connecting WS:", wsUrl)
    console.log("[Game page] isCreator:", isCreator.current)

    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      console.log("[WS] open | isCreator:", isCreator.current)
      if (isCreator.current) {
        ws.send(JSON.stringify({ type: "create", payload: { gameId } }))
        setGame(g => ({ ...g, phase: "waiting" }))
      }
    }

    ws.onmessage = (event) => {
      console.log("[WS received]", event.data)
      const { type, payload } = JSON.parse(event.data)

      switch (type) {
        case "create":
          setGame(g => ({ ...g, color: payload.color, phase: "waiting" }))
          break

        case "join":
          if (payload.opponentJoined) {
            // creator receives this — move to playing
            setGame(g => ({
              ...g,
              phase: "playing",
              fen: payload.fen,
              color: payload.color,
            }))
          } else {
            // joiner receives this
            setGame(g => ({
              ...g,
              color: payload.color,
              fen: payload.fen,
              phase: "playing",
            }))
          }
          break

        case "move":
          setGame(g => ({
            ...g,
            fen: payload.fen,
            currentTurn: payload.currentTurn,
            ...(payload.gameOver ? {
              phase: "finished",
              winner: payload.winner,
              endReason: payload.endReason,
            } : {}),
          }))
          break

        case "resign":
          setGame(g => ({
            ...g,
            phase: "finished",
            winner: payload.winner,
            endReason: "resign",
          }))
          break

        case "error":
          console.error("[WS error]", payload.message)
          break
      }
    }

    ws.onerror = (e) => console.error("[WS error]", e)

    return () => {
      ws.close()
      initializedRef.current = false // reset on unmount so navigation works
    }
  }, [gameId])

  const send = (type: string, payload: object) => {
    wsRef.current?.send(JSON.stringify({ type, payload }))
  }

  const handleJoin = () => send("join", { gameId })
  const handleResign = () => send("resign", { gameId })

  const handleMove = (sourceSquare: string, targetSquare: string) => {
    if (game.phase !== "playing") return false
    if (game.color !== game.currentTurn) return false
    send("move", { gameId, from: sourceSquare, to: targetSquare })
    return true
  }

  const copyLink = () => {
    navigator.clipboard.writeText(pageUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // WAITING 
  if (game.phase === "waiting") {
    return (
      <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-6 p-8">
        <h2 className="text-white text-2xl font-bold">Waiting for opponent...</h2>
        <p className="text-zinc-400 text-sm">Share this link with your friend</p>

        <div className="flex items-center gap-2 bg-zinc-800 rounded-lg px-4 py-3 w-full max-w-md">
          <span className="text-zinc-300 text-sm truncate flex-1">{pageUrl}</span>
          <Button onClick={copyLink} className="text-sm px-3 py-1.5 shrink-0">
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>

        <p className="text-zinc-500 text-sm">
          You are playing as{" "}
          <span className="text-white font-semibold capitalize">{game.color}</span>
        </p>
      </main>
    )
  }

  //  JOINING
  if (game.phase === "joining") {
    return (
      <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-6 p-8">
        <h2 className="text-white text-2xl font-bold">You've been challenged!</h2>
        <p className="text-zinc-400 text-sm">Click below to join the game</p>
        <Button onClick={handleJoin} className="px-10 py-4 text-lg">
          Join Game
        </Button>
      </main>
    )
  }

  // FINISHED 
  if (game.phase === "finished") {
    const iWon = game.winner === game.color
    return (
      <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-6 p-8">
        <h2 className="text-white text-3xl font-bold capitalize">
          {game.winner ? `${game.winner} wins!` : "Draw"}
        </h2>
        <p className="text-zinc-400 capitalize">{game.endReason}</p>
        <p className="text-zinc-300 text-lg font-semibold">
          {iWon ? "🏆 You won!" : game.winner ? "You lost." : "It's a draw."}
        </p>
        <Button onClick={() => { window.location.href = "/" }}>
          Back to Home
        </Button>
      </main>
    )
  }

  // PLAYING 
  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 p-4">
      <div className="flex items-center justify-between w-full max-w-[480px]">
        <p className="text-zinc-400 text-sm">
          You are{" "}
          <span className="text-white font-semibold capitalize">{game.color}</span>
        </p>
        <p className="text-zinc-400 text-sm">
          Turn:{" "}
          <span className="text-white font-semibold capitalize">{game.currentTurn}</span>
        </p>
      </div>

      <div className="w-full max-w-120">
        <Chessboard
          position={game.fen}
          onPieceDrop={(src, tgt) => handleMove(src, tgt)}
          boardOrientation={game.color ?? "white"}
          arePiecesDraggable={game.color === game.currentTurn}
        />
      </div>

      <Button onClick={handleResign} className="mt-2 text-sm px-6 py-2">
        Resign
      </Button>
    </main>
  )
}
