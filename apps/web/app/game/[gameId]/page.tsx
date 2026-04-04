"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useChessGame } from "@/hooks/useChessGame"
import { WaitingRoom } from "@/components/game/WaitingRoom"
import { JoinRoom } from "@/components/game/JoinRoom"
import { ChessBoard } from "@/components/game/ChessBoard"
import { GameOver } from "@/components/game/GameOver"

export default function GamePage() {
  const { gameId } = useParams<{ gameId: string }>()

  const {
    game,
    pageUrl,
    joinGame,
    makeMove,
    resign,
    requestTakeback,
    respondTakeback,
    sendMessage,
  } = useChessGame(gameId)

  const [joined, setJoined] = useState(false)

  const handleJoin = () => {
    joinGame()
    setJoined(true)
  }

  //  CREATOR WAITING
  if (game.phase === "waiting") {
    return <WaitingRoom pageUrl={pageUrl} color={game.color} />
  }

  // JOINER UI (UNTIL CLICK)
  if (!joined && game.phase === "joining") {
    return <JoinRoom onJoin={handleJoin} />
  }

  // GAME OVER
  if (game.phase === "finished") {
    return (
      <GameOver
        winner={game.winner}
        endReason={game.endReason}
        myColor={game.color}
      />
    )
  }

  // CRITICAL: WAIT FOR GAME TO BE READY
  if (game.phase !== "playing" || !game.color) {
    return <div className="text-white">Starting game...</div>
  }

  // FINAL BOARD
  return (
    <ChessBoard
      key={game.color + game.fen} // VERY IMPORTANT
      fen={game.fen}
      currentTurn={game.currentTurn}
      myColor={game.color}
      moveHistory={game.moveHistory}
      takebackRequest={game.takebackRequest}
      onMove={makeMove}
      messages={game.messages}
      onResign={resign}
      onRequestTakeback={requestTakeback}
      onRespondTakeback={respondTakeback}
      lastMove={game.lastMove}
      onSendMessage={sendMessage}
    />
  )
}
