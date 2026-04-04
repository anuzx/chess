export const events = {
  create: "create",
  join: "join",
  move: "move",
  resign: "resign",
  talk: "talk",
  takebackRequest: "takeback_request",
  takebackResponse: "takeback_response",
  takebackApplied: "takeback_applied",
  error: "error",
} as const

export type EventName = (typeof events)[keyof typeof events]
