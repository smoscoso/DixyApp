import { type NextRequest, NextResponse } from "next/server"
import { getStudentsByTeacher, getUserProgress, getUserStats } from "@/lib/db-utils"
import { MODULE_INFO } from "@/lib/module-constants"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get("teacherId")

    if (!teacherId) {
      return NextResponse.json({ error: "ID de docente requerido" }, { status: 400 })
    }

    console.log("📊 Exportando datos para docente:", teacherId)

    // Obtener estudiantes del docente
    const students = await getStudentsByTeacher(teacherId)

    if (students.length === 0) {
      return NextResponse.json({ error: "No tienes estudiantes registrados" }, { status: 404 })
    }

    // Obtener datos detallados de cada estudiante
    const studentsData = []

    for (const student of students) {
      if (!student._id) continue

      const progress = await getUserProgress(student._id.toString())
      const stats = await getUserStats(student._id.toString())

      // Calcular progreso por módulo
      const moduleProgress: { [key: number]: any } = {}
      const assignedModules = student.assignedModules || []

      for (const moduleNum of assignedModules) {
        const moduleProgressData = progress.filter((p) => p.module === moduleNum)
        const moduleInfo = MODULE_INFO.find((m) => m.id === moduleNum)

        const totalAttempts = moduleProgressData.reduce((sum, p) => sum + p.attempts, 0)
        const totalSuccesses = moduleProgressData.reduce((sum, p) => sum + p.successes, 0)
        const completedLevels = moduleProgressData.filter((p) => p.successes > 0).length
        const accuracy = totalAttempts > 0 ? (totalSuccesses / totalAttempts) * 100 : 0

        moduleProgress[moduleNum] = {
          name: moduleInfo?.title || `Módulo ${moduleNum}`,
          totalAttempts,
          totalSuccesses,
          completedLevels,
          maxLevels: 10,
          accuracy: Math.round(accuracy),
          progressPercentage: Math.round((completedLevels / 10) * 100),
        }
      }

      // Calcular progreso general
      const totalLevels = assignedModules.length * 10
      const totalCompletedLevels = Object.values(moduleProgress).reduce(
        (sum: number, mod: any) => sum + mod.completedLevels,
        0,
      )
      const generalProgress = totalLevels > 0 ? Math.round((totalCompletedLevels / totalLevels) * 100) : 0

      studentsData.push({
        id: student._id.toString(),
        name: student.name,
        lastName: student.lastName,
        username: student.username,
        age: student.age,
        course: student.course,
        dyslexiaLevel: student.dyslexiaLevel,
        dyslexiaType: student.dyslexiaType,
        hasKinestheticDyslexia: student.hasKinestheticDyslexia,
        assignedModules,
        createdAt: student.createdAt,
        lastLogin: student.lastLogin,
        generalProgress,
        moduleProgress,
        totalAttempts: Object.values(moduleProgress).reduce((sum: number, mod: any) => sum + mod.totalAttempts, 0),
        totalSuccesses: Object.values(moduleProgress).reduce((sum: number, mod: any) => sum + mod.totalSuccesses, 0),
        generalAccuracy:
          Object.values(moduleProgress).reduce((sum: number, mod: any) => sum + mod.totalAttempts, 0) > 0
            ? Math.round(
                (Object.values(moduleProgress).reduce((sum: number, mod: any) => sum + mod.totalSuccesses, 0) /
                  Object.values(moduleProgress).reduce((sum: number, mod: any) => sum + mod.totalAttempts, 0)) *
                  100,
              )
            : 0,
      })
    }

    // Crear CSV
    const csvHeaders = [
      "Nombre Completo",
      "Usuario",
      "Edad",
      "Curso",
      "Nivel Dislexia",
      "Tipo Dislexia",
      "Dislexia Kinestésica",
      "Fecha Registro",
      "Último Acceso",
      "Progreso General (%)",
      "Precisión General (%)",
      "Total Intentos",
      "Total Aciertos",
      "Módulos Asignados",
    ]

    // Agregar headers para cada módulo posible
    for (let i = 1; i <= 6; i++) {
      const moduleInfo = MODULE_INFO.find((m) => m.id === i)
      const moduleName = moduleInfo?.title || `Módulo ${i}`
      csvHeaders.push(
        `${moduleName} - Progreso (%)`,
        `${moduleName} - Intentos`,
        `${moduleName} - Aciertos`,
        `${moduleName} - Precisión (%)`,
      )
    }

    const csvRows = studentsData.map((student) => {
      const row = [
        `${student.name} ${student.lastName}`,
        student.username,
        student.age,
        student.course,
        student.dyslexiaLevel,
        student.dyslexiaType,
        student.hasKinestheticDyslexia ? "Sí" : "No",
        new Date(student.createdAt).toLocaleDateString("es-ES"),
        new Date(student.lastLogin).toLocaleDateString("es-ES"),
        student.generalProgress,
        student.generalAccuracy,
        student.totalAttempts,
        student.totalSuccesses,
        student.assignedModules.join(", "),
      ]

      // Agregar datos de cada módulo
      for (let i = 1; i <= 6; i++) {
        const moduleData = student.moduleProgress[i]
        if (moduleData) {
          row.push(
            moduleData.progressPercentage,
            moduleData.totalAttempts,
            moduleData.totalSuccesses,
            moduleData.accuracy,
          )
        } else {
          row.push("N/A", "0", "0", "0")
        }
      }

      return row
    })

    const csvContent = [csvHeaders, ...csvRows].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")

    const fileName = `estudiantes_${new Date().toISOString().split("T")[0]}.csv`

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    console.error("Error al exportar datos de estudiantes:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
