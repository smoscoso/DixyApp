import type { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
  name: string
  lastName?: string
  username?: string
  age?: number
  email?: string
  password: string
  role: "teacher" | "student"
  createdAt: Date
  lastLogin: Date
  // Campos específicos para estudiantes
  teacherId?: ObjectId
  course?: string
  dyslexiaLevel?: "leve" | "moderado" | "severo"
  dyslexiaType?: "fonologica" | "superficial" | "mixta" | "kinestesica"
  hasKinestheticDyslexia?: boolean // Nueva campo para dislexia kinestésica
  assignedModules?: number[]
  // Campo para reset de contraseña
  resetToken?: string
  resetTokenExpiry?: Date
}

export interface Progress {
  _id?: ObjectId
  userId: ObjectId
  module: number
  level: number
  attempts: number
  successes: number
  date: Date
}

export interface ModuleStats {
  module: number
  totalAttempts: number
  totalSuccesses: number
  completedLevels: number
  accuracy: number
}

export interface UserStats {
  user: User
  totalProgress: number
  moduleStats: ModuleStats[]
}

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
