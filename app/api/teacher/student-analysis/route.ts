import { type NextRequest, NextResponse } from "next/server"
import { getStudentsByTeacher, getUserProgress } from "@/lib/db-utils"
import { StudentAnalysisNetwork, normalizeStudentData } from "@/lib/student-analysis-network"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get("teacherId")

    if (!teacherId) {
      return NextResponse.json({ error: "ID de docente requerido" }, { status: 400 })
    }

    // Obtener estudiantes del docente
    const students = await getStudentsByTeacher(teacherId)

    if (students.length === 0) {
      return NextResponse.json({
        success: true,
        analyses: [],
      })
    }

    // Inicializar la red neuronal de análisis
    const analysisNetwork = new StudentAnalysisNetwork()

    // Generar análisis para cada estudiante
    const analyses = []

    for (const student of students) {
      try {
        // Obtener progreso del estudiante
        const progressData = await getUserProgress(student._id!.toString())

        // Normalizar datos para la red neuronal
        const normalizedInput = normalizeStudentData(progressData, student)

        // Generar análisis con la red neuronal
        const observation = analysisNetwork.analyze(normalizedInput)

        // Calcular métricas adicionales
        const totalProgress =
          progressData.length > 0
            ? (progressData.reduce((sum, p) => sum + (p.successes > 0 ? 1 : 0), 0) /
                (student.assignedModules?.length || 1 * 10)) *
              100
            : 0

        const totalAccuracy =
          progressData.length > 0
            ? (progressData.reduce((sum, p) => sum + p.successes, 0) /
                progressData.reduce((sum, p) => sum + p.attempts, 0)) *
              100
            : 0

        analyses.push({
          studentId: student._id!.toString(),
          studentName: `${student.name} ${student.lastName}`,
          username: student.username,
          observation,
          metrics: {
            totalProgress: Math.round(totalProgress),
            totalAccuracy: Math.round(totalAccuracy || 0),
            modulesCompleted: progressData.filter((p) => p.successes > 0).length,
            totalAttempts: progressData.reduce((sum, p) => sum + p.attempts, 0),
            lastActivity:
              progressData.length > 0
                ? Math.max(...progressData.map((p) => new Date(p.date).getTime()))
                : student.lastLogin.getTime(),
          },
        })
      } catch (error) {
        console.error(`Error analizando estudiante ${student.name}:`, error)
        // Continuar con el siguiente estudiante
        analyses.push({
          studentId: student._id!.toString(),
          studentName: `${student.name} ${student.lastName}`,
          username: student.username,
          observation: {
            overallPerformance: "regular" as const,
            strengths: [],
            weaknesses: ["Datos insuficientes para análisis"],
            recommendations: ["Completar más actividades para generar análisis detallado"],
            riskLevel: "medio" as const,
            motivationLevel: "media" as const,
            detailedAnalysis: "Se requieren más datos de progreso para generar un análisis completo.",
          },
          metrics: {
            totalProgress: 0,
            totalAccuracy: 0,
            modulesCompleted: 0,
            totalAttempts: 0,
            lastActivity: student.lastLogin.getTime(),
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
      analyses,
    })
  } catch (error) {
    console.error("Error en análisis de estudiantes:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
