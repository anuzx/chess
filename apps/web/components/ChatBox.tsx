"use client"

import { useState, useRef, useEffect } from "react"
import type { Color } from "@/hooks/useChessGame"

interface ChatMessage {
  senderId: Color
  message: string
  timestamp: string
}

interface ChatBoxProps {
  myColor: Color
  messages: ChatMessage[]
  onSend: (message: string) => void
}

export function ChatBox({ myColor, messages, onSend }: ChatBoxProps) {
  const [input, setInput] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length])

  const handleSend = () => {
    if (!input.trim()) return
    onSend(input.trim())
    setInput("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 border-b border-zinc-700 flex items-center gap-2">
        <span className="text-zinc-400 text-xs font-medium uppercase tracking-wider">
          Chat
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 min-h-0">
        {messages.length === 0 ? (
          <p className="text-zinc-600 text-xs text-center mt-4">
            No messages yet
          </p>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.senderId === myColor
            return (
              <div
                key={i}
                className={`flex flex-col gap-0.5 ${isMe ? "items-end" : "items-start"}`}
              >
                {/* Sender name */}
                <span
                  className={`text-xs font-mono font-semibold ${msg.senderId === "white"
                    ? "text-zinc-100"
                    : "text-zinc-500"
                    }`}
                >
                  [{msg.senderId}]
                </span>

                {/* Bubble */}
                <div
                  className={`max-w-[85%] px-3 py-1.5 rounded-lg text-sm wrap-break-words ${isMe
                    ? "bg-white text-black rounded-tr-sm"
                    : "bg-zinc-700 text-zinc-100 rounded-tl-sm"
                    }`}
                >
                  {msg.message}
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-zinc-700 p-2 flex gap-2 items-center">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          maxLength={200}
          className="flex-1 bg-zinc-800 border border-zinc-600 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:ring-2 focus:ring-white/20 focus:border-zinc-400 transition-all"
        />

        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="px-4 py-2 bg-white text-black text-sm font-semibold rounded-md hover:bg-zinc-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>
  )
}
