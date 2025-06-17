import { type NextRequest, NextResponse } from "next/server"
import { getUserById } from "@/lib/db-utils"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")

    if (!studentId) {
      return NextResponse.json({ error: "ID de estudiante requerido" }, { status: 400 })
    }

    console.log("🔍 Obteniendo módulos para estudiante:", studentId)

    const student = await getUserById(studentId)

    if (!student) {
      return NextResponse.json({ error: "Estudiante no encontrado" }, { status: 404 })
    }

    if (student.role !== "student") {
      return NextResponse.json({ error: "El usuario no es un estudiante" }, { status: 400 })
    }

    const assignedModules = student.assignedModules || [1, 2, 3]

    console.log("📚 Módulos asignados encontrados:", assignedModules)

    return NextResponse.json({
      success: true,
      assignedModules,
      studentInfo: {
        name: student.name,
        dyslexiaLevel: student.dyslexiaLevel,
        dyslexiaType: student.dyslexiaType,
        hasKinestheticDyslexia: student.hasKinestheticDyslexia,
      },
    })
  } catch (error) {
    console.error("Error al obtener módulos del estudiante:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
