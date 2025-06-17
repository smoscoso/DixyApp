"use server"

import { saveProgress as dbSaveProgress, getUserById, updateUserLastLogin } from "./db-utils"
import { revalidatePath } from "next/cache"

export async function createUser(name: string, age: number): Promise<string> {
  // Esta función es para compatibilidad con código legacy
  // En el nuevo sistema, los estudiantes se crean desde el dashboard del docente
  throw new Error("Esta función ya no se usa. Los estudiantes se crean desde el dashboard del docente.")
}

export async function saveProgress(userId: string, module: number, level: number, success: boolean): Promise<void> {
  await dbSaveProgress(userId, module, level, success)
  revalidatePath("/dashboard")
}

export async function loginUser(userId: string): Promise<boolean> {
  const user = await getUserById(userId)
  if (!user) return false

  await updateUserLastLogin(userId)
  return true
}
