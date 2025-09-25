import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { EnhancedPredictionNetwork, type EnhancedPredictionInput } from "@/lib/enhanced-prediction-network"

const DB_NAME = "dislexia_app"
const USERS_COLLECTION = "users"
const PROGRESS_COLLECTION = "progress"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get("teacherId")

    if (!teacherId) {
      return NextResponse.json({ error: "ID del docente requerido" }, { status: 400 })
    }

    console.log("=== STUDENT PREDICTIONS API ===")
    console.log("Teacher ID:", teacherId)

    const client = await clientPromise
    const db = client.db(DB_NAME)

    // Obtener estudiantes del docente
    const students = await db
      .collection(USERS_COLLECTION)
      .find({
        teacherId: new ObjectId(teacherId),
        role: "student",
      })
      .toArray()

    console.log("Students found:", students.length)

    if (students.length === 0) {
      return NextResponse.json({ predictions: [] })
    }

    const predictions = []
    const network = new EnhancedPredictionNetwork()

    for (const student of students) {
      try {
        console.log(`Processing student: ${student.name} ${student.lastName} (${student._id})`)

        // Obtener datos de progreso histórico del estudiante
        const progressData = await db
          .collection(PROGRESS_COLLECTION)
          .find({
            userId: new ObjectId(student._id),
          })
          .sort({ date: -1 })
          .toArray()

        console.log(`Progress data for ${student.name}:`, progressData.length, "records")

        // Preparar datos para predicción usando información real de la base de datos
        const predictionInput: EnhancedPredictionInput = {
          studentId: student._id.toString(),
          currentProgress: await calculateCurrentProgressFromDB(db, student._id.toString()),
          accuracyTrends: await calculateAccuracyTrendsFromDB(db, student._id.toString()),
          sessionFrequency: await calculateSessionFrequencyFromDB(db, student._id.toString()),
          motivationIndicators: await calculateMotivationIndicatorsFromDB(db, student._id.toString(), progressData),
          learningVelocity: await calculateLearningVelocityFromDB(db, student._id.toString(), progressData),
          consistencyScores: await calculateConsistencyScoresFromDB(db, student._id.toString(), progressData),
          difficultyAdaptation: await calculateDifficultyAdaptationFromDB(db, student._id.toString(), progressData),
          timeSpentPerModule: await calculateTimeSpentPerModuleFromDB(db, student._id.toString()),
          errorPatterns: await calculateErrorPatternsFromDB(db, student._id.toString(), progressData),
          dyslexiaProfile: {
            level: student.dyslexiaLevel || "leve",
            type: student.dyslexiaType || "fonologica",
            hasKinesthetic: student.hasKinestheticDyslexia || false,
            severity: calculateDyslexiaSeverity(student.dyslexiaLevel, student.dyslexiaType),
          },
          demographicFactors: {
            age: student.age || 10,
            courseLevel: extractCourseLevel(student.course || "3ro"),
            previousExperience: calculatePreviousExperience(student.createdAt),
          },
          environmentalFactors: {
            sessionLength: await calculateSessionLengthsFromDB(db, student._id.toString()),
            timeOfDay: await calculateTimeOfDayFromDB(db, student._id.toString()),
            deviceUsed: ["web"], // Por ahora solo web, se puede expandir
          },
        }

        console.log(`Prediction input for ${student.name}:`, {
          currentProgress: predictionInput.currentProgress,
          accuracyTrends: predictionInput.accuracyTrends,
          sessionFrequency: predictionInput.sessionFrequency,
        })

        // Generar predicción
        const prediction = network.predict(predictionInput)

        console.log(`Prediction generated for ${student.name}:`, {
          riskOfDropout: prediction.shortTerm.riskOfDropout,
          successProbability: prediction.longTerm.overallSuccessProbability,
        })

        predictions.push({
          studentId: student._id.toString(),
          studentName: `${student.name} ${student.lastName}`,
          username: student.username,
          prediction,
          lastUpdated: new Date().toISOString(),
        })
      } catch (error) {
        console.error(`Error procesando estudiante ${student._id}:`, error)
        // Crear predicción por defecto para estudiantes sin datos
        const defaultPrediction = createDefaultPrediction(student)
        predictions.push({
          studentId: student._id.toString(),
          studentName: `${student.name} ${student.lastName}`,
          username: student.username,
          prediction: defaultPrediction,
          lastUpdated: new Date().toISOString(),
        })
      }
    }

    console.log("Total predictions generated:", predictions.length)
    return NextResponse.json({ predictions })
  } catch (error) {
    console.error("Error en predicciones:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// Función para crear predicción por defecto
function createDefaultPrediction(student: any) {
  return {
    shortTerm: {
      expectedProgress: 65,
      expectedAccuracy: 70,
      riskOfDropout: 25,
      motivationForecast: "estable" as const,
      optimalSessionLength: 45,
      recommendedFrequency: 3,
      timeframe: "1-2 semanas" as const,
    },
    mediumTerm: {
      modulesToComplete: student.assignedModules || [1, 2, 3],
      estimatedCompletionTime: 8,
      interventionNeeded: false,
      difficultyAdjustments: [],
      learningPathOptimization: ["Mantener ritmo actual", "Monitorear progreso semanalmente"],
      timeframe: "1 mes" as const,
    },
    longTerm: {
      overallSuccessProbability: 75,
      recommendedInterventions: ["Seguimiento regular del progreso", "Apoyo motivacional continuo"],
      projectedOutcome: "Bueno - Progreso satisfactorio con apoyo regular",
      skillMastery: {
        reading: 70,
        writing: 65,
        comprehension: 75,
        phonological: 70,
      },
      adaptiveStrategies: ["Ajustar velocidad según progreso", "Implementar retroalimentación positiva"],
      timeframe: "3 meses" as const,
    },
    trends: {
      progressTrend: "estable" as const,
      accuracyTrend: "estable" as const,
      engagementTrend: "media" as const,
      learningEfficiencyTrend: "estable" as const,
      overallTrajectory: "neutral" as const,
    },
    personalizedRecommendations: {
      immediate: ["Establecer rutina de estudio", "Monitorear progreso inicial"],
      shortTerm: ["Implementar metas semanales", "Celebrar pequeños logros"],
      longTerm: ["Desarrollar independencia", "Mantener motivación a largo plazo"],
      parentGuidance: ["Apoyar rutina de estudio", "Mantener comunicación con docente"],
      teacherActions: ["Documentar progreso", "Ajustar metodología según necesidades"],
    },
    riskFactors: [],
    confidence: 60,
    dataQuality: 0.4,
    lastAnalysisDate: new Date().toISOString(),
  }
}

// Funciones auxiliares para calcular métricas desde la base de datos

async function calculateCurrentProgressFromDB(db: any, userId: string): Promise<number[]> {
  const progress = new Array(6).fill(0)

  try {
    for (let moduleId = 1; moduleId <= 6; moduleId++) {
      const moduleProgress = await db
        .collection(PROGRESS_COLLECTION)
        .find({
          userId: new ObjectId(userId),
          module: moduleId,
        })
        .toArray()

      if (moduleProgress.length > 0) {
        const completedLevels = moduleProgress.filter((p: any) => p.successes > 0).length
        const totalLevels = Math.max(10, moduleProgress.length) // Mínimo 10 niveles por módulo
        progress[moduleId - 1] = Math.min((completedLevels / totalLevels) * 100, 100)
      }
    }
  } catch (error) {
    console.error("Error calculating current progress:", error)
  }

  return progress
}

async function calculateAccuracyTrendsFromDB(db: any, userId: string): Promise<number[]> {
  const trends = new Array(6).fill(0)
  const now = new Date()

  try {
    for (let week = 0; week < 6; week++) {
      const weekStart = new Date(now.getTime() - (week + 1) * 7 * 24 * 60 * 60 * 1000)
      const weekEnd = new Date(now.getTime() - week * 7 * 24 * 60 * 60 * 1000)

      const weekProgress = await db
        .collection(PROGRESS_COLLECTION)
        .find({
          userId: new ObjectId(userId),
          date: {
            $gte: weekStart,
            $lt: weekEnd,
          },
        })
        .toArray()

      if (weekProgress.length > 0) {
        const totalAttempts = weekProgress.reduce((sum: number, p: any) => sum + (p.attempts || 1), 0)
        const totalSuccesses = weekProgress.reduce((sum: number, p: any) => sum + (p.successes || 0), 0)
        trends[5 - week] = totalAttempts > 0 ? (totalSuccesses / totalAttempts) * 100 : 0
      }
    }
  } catch (error) {
    console.error("Error calculating accuracy trends:", error)
  }

  return trends
}

async function calculateSessionFrequencyFromDB(db: any, userId: string): Promise<number[]> {
  const frequency = new Array(4).fill(0)
  const now = new Date()

  try {
    for (let week = 0; week < 4; week++) {
      const weekStart = new Date(now.getTime() - (week + 1) * 7 * 24 * 60 * 60 * 1000)
      const weekEnd = new Date(now.getTime() - week * 7 * 24 * 60 * 60 * 1000)

      const weekSessions = await db
        .collection(PROGRESS_COLLECTION)
        .find({
          userId: new ObjectId(userId),
          date: {
            $gte: weekStart,
            $lt: weekEnd,
          },
        })
        .toArray()

      // Contar días únicos con actividad
      const uniqueDays = new Set(weekSessions.map((session: any) => new Date(session.date).toDateString()))
      frequency[3 - week] = uniqueDays.size
    }
  } catch (error) {
    console.error("Error calculating session frequency:", error)
  }

  return frequency
}

async function calculateMotivationIndicatorsFromDB(db: any, userId: string, progressData: any[]): Promise<number[]> {
  const indicators = [0, 0, 0, 0] // [consistencia, mejora, participación, persistencia]

  try {
    if (progressData.length === 0) return indicators

    // Consistencia: regularidad en la actividad
    const recentSessions = progressData.slice(0, 20)
    if (recentSessions.length > 1) {
      const dates = recentSessions.map((p) => new Date(p.date).getTime())
      const timeSpan = Math.max(...dates) - Math.min(...dates)
      const expectedTimeSpan = recentSessions.length * 24 * 60 * 60 * 1000
      indicators[0] = Math.min((expectedTimeSpan / Math.max(timeSpan, 1)) * 100, 100)
    }

    // Mejora: tendencia de éxito en intentos recientes
    const recentAttempts = progressData.slice(0, 10)
    if (recentAttempts.length >= 5) {
      const firstHalf = recentAttempts.slice(5, 10)
      const secondHalf = recentAttempts.slice(0, 5)

      const firstHalfSuccess =
        firstHalf.reduce((sum, p) => sum + (p.successes || 0), 0) /
        Math.max(
          firstHalf.reduce((sum, p) => sum + (p.attempts || 1), 0),
          1,
        )
      const secondHalfSuccess =
        secondHalf.reduce((sum, p) => sum + (p.successes || 0), 0) /
        Math.max(
          secondHalf.reduce((sum, p) => sum + (p.attempts || 1), 0),
          1,
        )

      indicators[1] = Math.max(0, (secondHalfSuccess - firstHalfSuccess + 1) * 50)
    }

    // Participación: frecuencia de actividad
    const totalSessions = progressData.length
    const daysSinceFirst =
      progressData.length > 0
        ? Math.max(
            1,
            (Date.now() - new Date(progressData[progressData.length - 1].date).getTime()) / (24 * 60 * 60 * 1000),
          )
        : 1

    indicators[2] = Math.min((totalSessions / daysSinceFirst) * 100, 100)

    // Persistencia: continuidad después de fallos
    let persistenceScore = 0
    for (let i = 0; i < Math.min(progressData.length - 1, 10); i++) {
      if (progressData[i].successes === 0 && progressData[i + 1]) {
        persistenceScore += 10 // Puntos por continuar después de un fallo
      }
    }
    indicators[3] = Math.min(persistenceScore, 100)
  } catch (error) {
    console.error("Error calculating motivation indicators:", error)
  }

  return indicators
}

async function calculateLearningVelocityFromDB(db: any, userId: string, progressData: any[]): Promise<number[]> {
  const velocity = [0, 0, 0] // [velocidad inicial, velocidad media, velocidad reciente]

  try {
    if (progressData.length < 3) return velocity

    // Dividir en tercios
    const third = Math.floor(progressData.length / 3)
    const initial = progressData.slice(-third) // Los más antiguos
    const middle = progressData.slice(third, -third)
    const recent = progressData.slice(0, third) // Los más recientes

    // Calcular velocidad como éxitos por día
    const calculateVelocity = (data: any[]) => {
      if (data.length === 0) return 0
      const successes = data.reduce((sum, p) => sum + (p.successes || 0), 0)
      const timeSpan =
        data.length > 1
          ? (new Date(data[0].date).getTime() - new Date(data[data.length - 1].date).getTime()) / (24 * 60 * 60 * 1000)
          : 1
      return (successes / Math.max(timeSpan, 1)) * 100
    }

    velocity[0] = calculateVelocity(initial)
    velocity[1] = calculateVelocity(middle)
    velocity[2] = calculateVelocity(recent)
  } catch (error) {
    console.error("Error calculating learning velocity:", error)
  }

  return velocity
}

async function calculateConsistencyScoresFromDB(db: any, userId: string, progressData: any[]): Promise<number[]> {
  const scores = [0, 0, 0] // [consistencia semanal, mensual, general]

  try {
    if (progressData.length === 0) return scores

    const now = new Date()

    // Consistencia semanal (última semana)
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const weekData = progressData.filter((p) => new Date(p.date) >= weekAgo)
    const weekDays = new Set(weekData.map((p) => new Date(p.date).toDateString())).size
    scores[0] = (weekDays / 7) * 100

    // Consistencia mensual (último mes)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const monthData = progressData.filter((p) => new Date(p.date) >= monthAgo)
    const monthDays = new Set(monthData.map((p) => new Date(p.date).toDateString())).size
    scores[1] = (monthDays / 30) * 100

    // Consistencia general
    const totalDays = new Set(progressData.map((p) => new Date(p.date).toDateString())).size
    const totalPeriod =
      progressData.length > 0
        ? (now.getTime() - new Date(progressData[progressData.length - 1].date).getTime()) / (24 * 60 * 60 * 1000)
        : 1
    scores[2] = (totalDays / Math.max(totalPeriod, 1)) * 100
  } catch (error) {
    console.error("Error calculating consistency scores:", error)
  }

  return scores
}

async function calculateDifficultyAdaptationFromDB(db: any, userId: string, progressData: any[]): Promise<number[]> {
  const adaptation = [0, 0] // [adaptación a incrementos, recuperación de fallos]

  try {
    if (progressData.length < 5) return adaptation

    // Adaptación a incrementos de dificultad (niveles más altos)
    let adaptationCount = 0
    let totalTransitions = 0

    for (let i = 0; i < progressData.length - 1; i++) {
      const current = progressData[i]
      const next = progressData[i + 1]

      if (current.level < next.level) {
        // Incremento de nivel
        totalTransitions++
        if (next.successes > 0) {
          adaptationCount++
        }
      }
    }

    adaptation[0] = totalTransitions > 0 ? (adaptationCount / totalTransitions) * 100 : 50

    // Recuperación después de fallos
    let recoveryCount = 0
    let failureCount = 0

    for (let i = 0; i < progressData.length - 1; i++) {
      if (progressData[i].successes === 0) {
        // Fallo
        failureCount++
        if (progressData[i + 1] && progressData[i + 1].successes > 0) {
          // Recuperación
          recoveryCount++
        }
      }
    }

    adaptation[1] = failureCount > 0 ? (recoveryCount / failureCount) * 100 : 75
  } catch (error) {
    console.error("Error calculating difficulty adaptation:", error)
  }

  return adaptation
}

async function calculateTimeSpentPerModuleFromDB(db: any, userId: string): Promise<number[]> {
  const timeSpent = new Array(6).fill(0)

  try {
    // Por ahora, estimamos basado en número de intentos
    // En el futuro se puede añadir tracking de tiempo real
    for (let moduleId = 1; moduleId <= 6; moduleId++) {
      const moduleProgress = await db
        .collection(PROGRESS_COLLECTION)
        .find({
          userId: new ObjectId(userId),
          module: moduleId,
        })
        .toArray()

      const totalAttempts = moduleProgress.reduce((sum: any, p: any) => sum + (p.attempts || 0), 0)
      // Estimamos 2 minutos por intento en promedio
      timeSpent[moduleId - 1] = totalAttempts * 120 // segundos
    }
  } catch (error) {
    console.error("Error calculating time spent per module:", error)
  }

  return timeSpent
}

async function calculateErrorPatternsFromDB(db: any, userId: string, progressData: any[]): Promise<number[]> {
  const patterns = new Array(6).fill(0)

  try {
    // Calcular patrones de error por módulo
    for (let moduleId = 1; moduleId <= 6; moduleId++) {
      const moduleData = progressData.filter((p) => p.module === moduleId)
      const totalAttempts = moduleData.reduce((sum, p) => sum + (p.attempts || 0), 0)
      const totalSuccesses = moduleData.reduce((sum, p) => sum + (p.successes || 0), 0)
      const errors = totalAttempts - totalSuccesses
      patterns[moduleId - 1] = errors
    }
  } catch (error) {
    console.error("Error calculating error patterns:", error)
  }

  return patterns
}

async function calculateSessionLengthsFromDB(db: any, userId: string): Promise<number[]> {
  const lengths = new Array(10).fill(30) // Default 30 minutos

  try {
    // Por ahora estimamos basado en actividad por día
    // En el futuro se puede añadir tracking de tiempo real
    const sessions = await db
      .collection(PROGRESS_COLLECTION)
      .aggregate([
        { $match: { userId: new ObjectId(userId) } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            attempts: { $sum: "$attempts" },
          },
        },
        { $sort: { _id: -1 } },
        { $limit: 10 },
      ])
      .toArray()

    sessions.forEach((session: any, index: any) => {
      if (index < lengths.length) {
        lengths[index] = session.attempts * 2 // Estimamos 2 minutos por intento
      }
    })
  } catch (error) {
    console.error("Error calculating session lengths:", error)
  }

  return lengths
}

async function calculateTimeOfDayFromDB(db: any, userId: string): Promise<number[]> {
  const times = new Array(10).fill(14) // Default 2 PM

  try {
    const sessions = await db
      .collection(PROGRESS_COLLECTION)
      .find({ userId: new ObjectId(userId) })
      .sort({ date: -1 })
      .limit(20)
      .toArray()

    sessions.forEach((session: any, index: any) => {
      if (index < times.length) {
        times[index] = new Date(session.date).getHours()
      }
    })
  } catch (error) {
    console.error("Error calculating time of day:", error)
  }

  return times
}

function calculateDyslexiaSeverity(level: string, type: string): number {
  let severity = 5 // Base

  switch (level) {
    case "leve":
      severity += 2
      break
    case "moderado":
      severity += 5
      break
    case "severo":
      severity += 8
      break
  }

  switch (type) {
    case "mixta":
      severity += 2
      break
    case "kinestesica":
      severity += 1
      break
  }

  return Math.min(severity, 10)
}

function extractCourseLevel(course: string): number {
  const match = course.match(/(\d+)/)
  return match ? Number.parseInt(match[1]) : 3
}

function calculatePreviousExperience(createdAt: Date): number {
  const monthsActive = (Date.now() - new Date(createdAt).getTime()) / (30 * 24 * 60 * 60 * 1000)
  return Math.min(monthsActive / 6, 5) // Máximo 5 puntos por 6 meses de experiencia
}
