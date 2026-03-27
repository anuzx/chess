import { FRONTEND_URL } from "common/constants"
import { randomLink } from "../utils/link"

export const createRoom = async () => {
  const room_link = randomLink()
  return { message: `${FRONTEND_URL}/${room_link}` }
}
