import { type NextRequest, NextResponse } from "next/server"
import { getUserById, getUserProgress } from "@/lib/db-utils"
import { MODULE_INFO } from "@/lib/module-constants"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")

    if (!studentId) {
      return NextResponse.json({ error: "ID de estudiante requerido" }, { status: 400 })
    }

    const student = await getUserById(studentId)

    if (!student || student.role !== "student") {
      return NextResponse.json({ error: "Estudiante no encontrado" }, { status: 404 })
    }

    const progress = await getUserProgress(studentId)
    const assignedModules = student.assignedModules || []

    // Calcular progreso por módulo
    const moduleProgress: { [key: number]: any } = {}
    let totalCompletedLevels = 0
    let totalPossibleLevels = 0

    for (const moduleNum of assignedModules) {
      const moduleProgressData = progress.filter((p) => p.module === moduleNum)
      const moduleInfo = MODULE_INFO.find((m) => m.id === moduleNum)
      const completedLevels = moduleProgressData.filter((p) => p.successes > 0).length
      const maxLevel = 10

      moduleProgress[moduleNum] = {
        id: moduleNum,
        name: moduleInfo?.title || `Módulo ${moduleNum}`,
        icon: moduleInfo?.icon || "📚",
        completedLevels,
        maxLevels: maxLevel,
        progressPercentage: Math.round((completedLevels / maxLevel) * 100),
        totalAttempts: moduleProgressData.reduce((sum, p) => sum + p.attempts, 0),
        totalSuccesses: moduleProgressData.reduce((sum, p) => sum + p.successes, 0),
      }

      totalCompletedLevels += completedLevels
      totalPossibleLevels += maxLevel
    }

    const generalProgress = totalPossibleLevels > 0 ? Math.round((totalCompletedLevels / totalPossibleLevels) * 100) : 0

    return NextResponse.json({
      success: true,
      student: {
        name: student.name,
        lastName: student.lastName,
        username: student.username,
        age: student.age,
        course: student.course,
        dyslexiaLevel: student.dyslexiaLevel,
        dyslexiaType: student.dyslexiaType,
        hasKinestheticDyslexia: student.hasKinestheticDyslexia,
      },
      generalProgress,
      moduleProgress: Object.values(moduleProgress),
      assignedModules,
    })
  } catch (error) {
    console.error("Error al obtener progreso del estudiante:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
