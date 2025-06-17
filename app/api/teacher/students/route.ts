import { type NextRequest, NextResponse } from "next/server"
import { getStudentsByTeacher } from "@/lib/db-utils"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get("teacherId")

    if (!teacherId) {
      return NextResponse.json({ error: "ID del docente es requerido" }, { status: 400 })
    }

    console.log("Buscando estudiantes para el docente:", teacherId)

    const students = await getStudentsByTeacher(teacherId)

    console.log("Estudiantes encontrados:", students.length)

    return NextResponse.json({
      success: true,
      students,
      count: students.length,
    })
  } catch (error) {
    console.error("Error al obtener estudiantes:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
