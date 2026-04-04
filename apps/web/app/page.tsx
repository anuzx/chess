"use client"

import { useState } from "react"
import Button from "../components/Button"
import ChallengeModal from "../components/ChallengeModal"

export default function Home() {
  const [showChallengeModal, setShowChallengeModal] = useState(false)

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 p-8">

      <h1 className="text-white text-4xl font-bold tracking-tight mb-8">
        Chess
      </h1>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button fullWidth onClick={() => setShowChallengeModal(true)}>
          Challenge a Friend
        </Button>

        <Button fullWidth onClick={() => alert("Tournaments coming soon")}>
          Create a Tournament
        </Button>

        <Button fullWidth onClick={() => alert("Computer play coming soon")}>
          Play with Computer
        </Button>
      </div>

      {showChallengeModal && (
        <ChallengeModal onClose={() => setShowChallengeModal(false)} />
      )}
    </main>
  )
}
