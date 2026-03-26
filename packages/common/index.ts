import { z } from "zod"


export const SignupSchema = z.object({
  username: z.string().max(10),
  email: z.email(),
  password: z.string().min(6).max(30)
})

export const SigninSchema = z.object({
  email: z.email(),
  password: z.string()
})
