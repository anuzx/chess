export const randomLink = () => {

  const char: string = "qwertyuiopasdfghjklzxcvbnm1234567890QWERTYUIOPASDFGHJKLZXCVBNM"
  const length: number = 9

  let link = ""

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * char.length)
    link += char[randomIndex]
  }

  return link
}
