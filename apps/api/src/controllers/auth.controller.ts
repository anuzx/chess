import { SigninSchema, SignupSchema } from "common/schema"
import bcrypt from "bcrypt"
import { prisma } from "db"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "common/constants"

export const handleSignup = async ({ body, set }) => {
  const { success, data } = SignupSchema.safeParse(body)
  if (!success) {
    set.status = 400
    return { error: "Invalid input" }
  }

  const { password, email, name } = data

  const hashedPassword = await bcrypt.hash(password, 10)

  const exists = await prisma.user.findFirst({
    where: {
      email
    }
  })

  if (exists) {
    set.status = 400
    return { error: "user already exists" }
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword
    }, select: {
      id: true,
      name: true,
      email: true
    }
  })

  return { message: "user created", user }
}


export const handleLogin = async ({ body, set }) => {
  const { success, data } = SigninSchema.safeParse(body)

  if (!success) {
    set.status = 400
    return { error: "Invalid Input" }
  }

  const { email, password } = data

  const existUser = await prisma.user.findFirst({
    where: {
      email
    }
  })

  if (!existUser) {
    return { error: "this user does not exist" }
  }

  const verifyPassword = await bcrypt.compare(password, existUser.password)

  if (!verifyPassword) {
    return { error: "email or password is wrong" }
  }

  const token = jwt.sign({ id: existUser.id }, JWT_SECRET)

  return { message: "login done", token }
}
