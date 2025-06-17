import type { ObjectId } from "mongodb"

export interface DyslexiaConfig {
  level: "leve" | "moderado" | "severo"
  type: "fonologica" | "superficial" | "mixta" | "kinestesica"
  assignedModules: number[]
  description: string
}

export interface ModuleInfo {
  id: number
  title: string
  description: string
  icon: string
  color: string
  targetDyslexia: string[]
  difficulty: "basico" | "intermedio" | "avanzado"
}

export interface User {
  _id?: ObjectId
  name: string
  lastName?: string
  username?: string
  email?: string
  age?: number
  password: string
  role: "student" | "teacher"
  teacherId?: ObjectId
  course?: string
  dyslexiaLevel?: "leve" | "moderado" | "severo"
  dyslexiaType?: "fonologica" | "superficial" | "mixta" | "kinestesica"
  hasKinestheticDyslexia?: boolean
  assignedModules?: number[]
  progress?: number
  createdAt: Date
  lastLogin: Date
  resetToken?: string
  resetTokenExpiry?: Date
}
