import crypto from "crypto"

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
  const hashedInput = hashPassword(password)
  return hashedInput === hashedPassword
}

export function generateStudentPassword(firstName: string, age: number): string {
  return `${firstName}${age}`
}
