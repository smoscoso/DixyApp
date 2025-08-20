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

// Nuevas interfaces para el análisis IA
export interface StudentAnalysisInput {
  module1Progress: number
  module2Progress: number
  module3Progress: number
  module4Progress: number
  module5Progress: number
  module6Progress: number
  module1Accuracy: number
  module2Accuracy: number
  module3Accuracy: number
  module4Accuracy: number
  module5Accuracy: number
  module6Accuracy: number
  age: number
  dyslexiaLevel: number
  dyslexiaType: number
  hasKinestheticDyslexia: number
  averageSessionTime: number
  consistencyScore: number
  improvementRate: number
}

export interface StudentObservation {
  overallPerformance: "excelente" | "bueno" | "regular" | "necesita_apoyo"
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  riskLevel: "bajo" | "medio" | "alto"
  motivationLevel: "alta" | "media" | "baja"
  detailedAnalysis: string
}

export interface StudentAnalysisResult {
  studentId: string
  studentName: string
  username: string
  observation: StudentObservation
  metrics: {
    totalProgress: number
    totalAccuracy: number
    modulesCompleted: number
    totalAttempts: number
    lastActivity: number
  }
}

// Interfaces para predicciones de rendimiento futuro
export interface PredictionInput {
  progressTrend: number[]
  accuracyTrend: number[]
  sessionFrequency: number[]
  currentProgress: number
  currentAccuracy: number
  learningVelocity: number
  consistencyScore: number
  age: number
  dyslexiaLevel: number
  dyslexiaType: number
  hasKinestheticDyslexia: number
  weeksActive: number
  averageSessionDuration: number
  motivationTrend: number
}

export interface PredictionResult {
  shortTermPredictions: {
    expectedProgress: number
    expectedAccuracy: number
    riskOfDropout: number
    motivationForecast: "creciente" | "estable" | "decreciente"
  }
  mediumTermPredictions: {
    expectedProgress: number
    expectedAccuracy: number
    modulesLikelyToComplete: number[]
    estimatedCompletionTime: number
  }
  longTermPredictions: {
    expectedProgress: number
    expectedAccuracy: number
    overallSuccessProbability: number
    recommendedInterventions: string[]
  }
  trendAnalysis: {
    progressTrend: "mejorando" | "estable" | "empeorando"
    accuracyTrend: "mejorando" | "estable" | "empeorando"
    engagementTrend: "aumentando" | "estable" | "disminuyendo"
    overallTrajectory: "positiva" | "neutral" | "preocupante"
  }
  recommendations: {
    immediate: string[]
    shortTerm: string[]
    longTerm: string[]
  }
  confidence: number
}
