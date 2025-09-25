import { type NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import { StudentAnalysisNetwork, type StudentData } from "@/lib/student-analysis-network"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get("teacherId")

    if (!teacherId) {
      return NextResponse.json({ error: "ID del docente requerido" }, { status: 400 })
    }

    const client = await connectToDatabase
    const db = client.db()

    // Obtener estudiantes del docente
    const students = await db
      .collection("users")
      .find({
        teacherId: teacherId,
        role: "student",
      })
      .toArray()

    if (students.length === 0) {
      return NextResponse.json({ analyses: [] })
    }

    const analyses = []
    const network = new StudentAnalysisNetwork()

    for (const student of students) {
      // Obtener progreso del estudiante
      const progressData = await db
        .collection("progress")
        .find({
          userId: student._id.toString(),
        })
        .toArray()

      // Preparar datos para la red neuronal
      const studentData: StudentData = {
        studentId: student._id.toString(),
        name: `${student.name} ${student.lastName}`,
        age: student.age,
        dyslexiaLevel: student.dyslexiaLevel || "leve",
        dyslexiaType: student.dyslexiaType || "fonologica",
        hasKinestheticDyslexia: student.hasKinestheticDyslexia || false,
        progressData: progressData.map((p) => ({
          moduleId: p.moduleId,
          progress: p.progress || 0,
          accuracy: p.accuracy || 0,
          attempts: p.attempts || 0,
          lastActivity: new Date(p.lastActivity || p.createdAt),
        })),
      }

      // Analizar con la red neuronal
      const analysis = network.analyzeStudent(studentData)

      // Calcular métricas adicionales
      const totalProgress =
        studentData.progressData.length > 0
          ? Math.round(
              studentData.progressData.reduce((sum, p) => sum + p.progress, 0) / studentData.progressData.length,
            )
          : 0

      const totalAccuracy =
        studentData.progressData.length > 0
          ? Math.round(
              studentData.progressData.reduce((sum, p) => sum + p.accuracy, 0) / studentData.progressData.length,
            )
          : 0

      const modulesCompleted = studentData.progressData.filter((p) => p.progress >= 100).length
      const totalAttempts = studentData.progressData.reduce((sum, p) => sum + p.attempts, 0)
      const lastActivity =
        studentData.progressData.length > 0
          ? Math.max(...studentData.progressData.map((p) => p.lastActivity.getTime()))
          : Date.now()

      analyses.push({
        studentId: student._id.toString(),
        studentName: `${student.name} ${student.lastName}`,
        username: student.username,
        observation: analysis,
        metrics: {
          totalProgress,
          totalAccuracy,
          modulesCompleted,
          totalAttempts,
          lastActivity,
        },
      })
    }

    return NextResponse.json({ analyses })
  } catch (error) {
    console.error("Error en análisis de estudiantes:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
