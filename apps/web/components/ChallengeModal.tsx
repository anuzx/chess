"use client"

import { useState } from "react"
import Button from "./Button"

interface ChallengeModalProps {
  onClose: () => void
}

type TimeControl = { label: string; minutes: number; increment: number }
type ColorChoice = "white" | "black" | "random"

const TIME_CONTROLS: TimeControl[] = [
  { label: "1 min", minutes: 1, increment: 0 },
  { label: "3 min", minutes: 3, increment: 0 },
  { label: "5 min", minutes: 5, increment: 0 },
  { label: "10 min", minutes: 10, increment: 0 },
  { label: "15+10", minutes: 15, increment: 10 },
  { label: "30 min", minutes: 30, increment: 0 },
]

export default function ChallengeModal({ onClose }: ChallengeModalProps) {
  const [selectedTime, setSelectedTime] = useState<TimeControl>(TIME_CONTROLS[1])
  const [color, setColor] = useState<ColorChoice>("random")
  const [loading, setLoading] = useState(false)

  const handleCreateRoom = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")

      const res = await fetch(`http://localhost:3002/api/room/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ colorPreference: color }),
      })

      const data = await res.json()
      console.log("[Modal] API response:", data)

      // Always write pendingGameId so page.tsx knows this tab is the creator
      localStorage.setItem("pendingGameId", data.gameId)
      localStorage.setItem("timeControl", JSON.stringify(selectedTime))

      if (!token) {
        // Always overwrite — never let a stale guestId from a previous session linger
        localStorage.setItem("guestId", data.creatorId)
        console.log("[Modal] stored guestId:", data.creatorId)
      } else {
        // Logged-in user — remove any stale guestId so WS uses token instead
        localStorage.removeItem("guestId")
      }

      window.location.href = data.link

    } catch (err) {
      console.error("Failed to create room", err)
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-md p-6 flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-white text-xl font-bold tracking-tight">
            Challenge a Friend
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-zinc-400 text-sm font-medium uppercase tracking-wider">
            Time Control
          </p>
          <div className="grid grid-cols-3 gap-2">
            {TIME_CONTROLS.map((tc) => (
              <button
                key={tc.label}
                onClick={() => setSelectedTime(tc)}
                className={`
                  py-2 rounded-md text-sm font-semibold border transition-all
                  ${selectedTime.label === tc.label
                    ? "bg-white text-black border-white"
                    : "bg-transparent text-zinc-300 border-zinc-600 hover:border-zinc-400"
                  }
                `}
              >
                {tc.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-zinc-400 text-sm font-medium uppercase tracking-wider">
            Play As
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setColor("white")}
              className={`flex-1 py-3 rounded-md border font-semibold text-sm transition-all flex items-center justify-center gap-2
                ${color === "white" ? "border-white bg-white/10 text-white" : "border-zinc-600 text-zinc-400 hover:border-zinc-400"}`}
            >
              <span className="w-4 h-4 rounded-full bg-white border border-zinc-400 inline-block" />
              White
            </button>

            <button
              onClick={() => setColor("random")}
              className={`flex-1 py-3 rounded-md border font-semibold text-sm transition-all flex items-center justify-center gap-2
                ${color === "random" ? "border-white bg-white/10 text-white" : "border-zinc-600 text-zinc-400 hover:border-zinc-400"}`}
            >
              <span className="w-4 h-4 rounded-full bg-gradient-to-r from-white to-black border border-zinc-400 inline-block" />
              Random
            </button>

            <button
              onClick={() => setColor("black")}
              className={`flex-1 py-3 rounded-md border font-semibold text-sm transition-all flex items-center justify-center gap-2
                ${color === "black" ? "border-white bg-white/10 text-white" : "border-zinc-600 text-zinc-400 hover:border-zinc-400"}`}
            >
              <span className="w-4 h-4 rounded-full bg-zinc-900 border border-zinc-400 inline-block" />
              Black
            </button>
          </div>
        </div>

        <Button onClick={handleCreateRoom} disabled={loading} fullWidth>
          {loading ? "Creating..." : "Create Room"}
        </Button>
      </div>
    </div>
  )
}
