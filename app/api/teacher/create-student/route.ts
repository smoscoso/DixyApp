import { type NextRequest, NextResponse } from "next/server"
import { createStudent } from "@/lib/db-utils"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { teacherId, name, lastName, age, course, dyslexiaLevel, dyslexiaType, hasKinestheticDyslexia } = body

    // Validaciones
    if (!teacherId || !name || !lastName || !age || !course || !dyslexiaLevel || !dyslexiaType) {
      return NextResponse.json({ error: "Todos los campos son obligatorios" }, { status: 400 })
    }

    if (age < 5 || age > 18) {
      return NextResponse.json({ error: "La edad debe estar entre 5 y 18 años" }, { status: 400 })
    }

    const validLevels = ["leve", "moderado", "severo"]
    const validTypes = ["fonologica", "superficial", "mixta", "kinestesica"]

    if (!validLevels.includes(dyslexiaLevel)) {
      return NextResponse.json({ error: "Nivel de dislexia no válido" }, { status: 400 })
    }

    if (!validTypes.includes(dyslexiaType)) {
      return NextResponse.json({ error: "Tipo de dislexia no válido" }, { status: 400 })
    }

    const student = await createStudent(
      teacherId,
      name.trim(),
      lastName.trim(),
      age,
      course.trim(),
      dyslexiaLevel,
      dyslexiaType,
      hasKinestheticDyslexia || false,
    )

    return NextResponse.json({
      message: "Estudiante creado exitosamente",
      username: student.username,
      password: student.plainPassword,
      student: {
        _id: student._id,
        name: student.name,
        lastName: student.lastName,
        username: student.username,
        age: student.age,
        course: student.course,
        dyslexiaLevel: student.dyslexiaLevel,
        dyslexiaType: student.dyslexiaType,
        hasKinestheticDyslexia: student.hasKinestheticDyslexia,
        assignedModules: student.assignedModules,
      },
    })
  } catch (error) {
    console.error("Error al crear estudiante:", error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
