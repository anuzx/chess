"use client"

import { useState } from "react"
import Button from "@/components/Button"
import type { Color } from "@/hooks/useChessGame"

interface WaitingRoomProps {
  pageUrl: string
  color: Color | null
}

export function WaitingRoom({ pageUrl, color }: WaitingRoomProps) {
  const [copied, setCopied] = useState(false)

  const copyLink = () => {
    navigator.clipboard.writeText(pageUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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
        <span className="text-white font-semibold capitalize">{color}</span>
      </p>
    </main>
  )
}
