import Button from "../Button"

interface JoinRoomProps {
  onJoin: () => void
}

export function JoinRoom({ onJoin }: JoinRoomProps) {
  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-6 p-8">
      <h2 className="text-white text-2xl font-bold">You've been challenged!</h2>
      <p className="text-zinc-400 text-sm">Click below to join the game</p>
      <Button onClick={onJoin} className="px-10 py-4 text-lg">
        Join Game
      </Button>
    </main>
  )
}
