"use client"

import { useEffect, useRef, useState } from "react"

export type GamePhase = "waiting" | "joining" | "playing" | "finished"
export type Color = "white" | "black"

export interface ChatMessage {
  senderId: Color
  message: string
  timestamp: string
}

export interface GameState {
  fen: string
  currentTurn: Color
  phase: GamePhase
  color: Color | null
  winner: Color | null
  endReason: string | null
  moveHistory: string[]
  lastMove: { from: string; to: string } | null
  takebackRequest: boolean
  messages: ChatMessage[]   // added
}

const INITIAL_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8080"

export function useChessGame(gameId: string) {
  const wsRef = useRef<WebSocket | null>(null)
  const isCreator = useRef(false)
  const initializedRef = useRef(false)
  const myColorRef = useRef<Color | null>(null)

  const [pageUrl, setPageUrl] = useState("")
  const [game, setGame] = useState<GameState>({
    fen: INITIAL_FEN,
    currentTurn: "white",
    phase: "joining",
    color: null,
    winner: null,
    endReason: null,
    moveHistory: [],
    lastMove: null,
    takebackRequest: false,
    messages: [],             // added
  })

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    setPageUrl(window.location.href)

    const pendingGameId = localStorage.getItem("pendingGameId")
    const token = localStorage.getItem("token")
    const guestId = localStorage.getItem("guestId")

    if (pendingGameId === gameId) {
      isCreator.current = true
      localStorage.removeItem("pendingGameId")
    }

    let wsUrl = WS_URL
    if (token) wsUrl += `?token=${token}`
    else if (guestId) wsUrl += `?guestId=${guestId}`

    console.log("[WS] connecting:", wsUrl, "| isCreator:", isCreator.current)

    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      if (isCreator.current) {
        ws.send(JSON.stringify({ type: "create", payload: { gameId } }))
        setGame(g => ({ ...g, phase: "waiting" }))
      }
    }

    ws.onmessage = (event) => {
      console.log("[WS received]", event.data)
      const msg = JSON.parse(event.data)
      const type = msg.type
      const payload = msg.payload ?? msg

      switch (type) {
        case "create":
          console.log("[WS] create event, color:", payload.color)
          myColorRef.current = payload.color as Color
          setGame(g => ({
            ...g,
            fen: payload.fen ?? INITIAL_FEN,
            color: payload.color as Color,
            phase: "waiting",
          }))
          break

        case "join":
          console.log("[WS] join event, opponentJoined:", payload.opponentJoined, "color:", payload.color)
          if (payload.opponentJoined) {
            myColorRef.current = payload.color ?? myColorRef.current
            setGame(g => ({
              ...g,
              color: payload.color ?? g.color,
              phase: "playing",
              fen: payload.fen ?? g.fen,
              currentTurn: payload.currentTurn ?? g.currentTurn,
            }))
          } else {
            myColorRef.current = payload.color as Color
            setGame(g => ({
              ...g,
              color: payload.color as Color,
              fen: payload.fen ?? g.fen,
              currentTurn: payload.currentTurn ?? g.currentTurn,
              phase: "playing",
            }))
          }
          break

        case "move":
          setGame(g => ({
            ...g,
            fen: payload.fen,
            currentTurn: payload.currentTurn as Color,
            moveHistory: [...g.moveHistory, payload.san as string],
            lastMove: { from: payload.from as string, to: payload.to as string },
            ...(payload.gameOver ? {
              phase: "finished" as GamePhase,
              winner: payload.winner as Color | null,
              endReason: payload.endReason as string,
            } : {}),
          }))
          break

        case "resign":
          setGame(g => ({
            ...g,
            phase: "finished",
            winner: payload.winner as Color | null,
            endReason: "resign",
          }))
          break

        case "takeback_request":
          setGame(g => ({ ...g, takebackRequest: true }))
          break

        case "takeback_applied":
          setGame(g => ({
            ...g,
            fen: payload.fen,
            currentTurn: payload.currentTurn as Color,
            moveHistory: g.moveHistory.slice(0, -1),
            takebackRequest: false,
          }))
          break

        // Chat
        case "talk":
          setGame(g => ({
            ...g,
            messages: [
              ...g.messages,
              {
                senderId: payload.senderId as Color,
                message: payload.message as string,
                timestamp: payload.timestamp as string,
              },
            ],
          }))
          break

        case "error":
          console.error("[WS error]", payload.message)
          break

        default:
          console.warn("[WS] unhandled type:", type)
      }
    }

    ws.onerror = (e) => console.error("[WS error]", e)
    return () => {
      ws.close()
      initializedRef.current = false
    }
  }, [gameId])

  const send = (type: string, payload: object) => {
    wsRef.current?.send(JSON.stringify({ type, payload }))
  }

  return {
    game,
    pageUrl,
    joinGame: () => send("join", { gameId }),
    makeMove: (from: string, to: string, promotion?: string) =>
      send("move", { gameId, from, to, ...(promotion ? { promotion } : {}) }),
    resign: () => send("resign", { gameId }),
    requestTakeback: () => send("takeback_request", { gameId }),
    respondTakeback: (accepted: boolean) =>
      send("takeback_response", { gameId, accepted }),
    sendMessage: (message: string) =>
      send("talk", { gameId, message }),   // added
  }
}
