import { type NextRequest, NextResponse } from "next/server"
import { authenticateStudent } from "@/lib/db-utils"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    console.log("=== STUDENT LOGIN ATTEMPT ===")
    console.log("Username:", username)

    if (!username || !password) {
      return NextResponse.json({ error: "Usuario y contraseña son requeridos" }, { status: 400 })
    }

    const user = await authenticateStudent(username, password)

    if (!user) {
      console.log("❌ Credenciales inválidas para:", username)
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    console.log("✅ Login exitoso para estudiante:", user.name)
    console.log("📚 Módulos asignados:", user.assignedModules)

    // Información completa del estudiante para el frontend
    const studentData = {
      id: user._id?.toString(),
      name: user.name,
      username: user.username,
      role: user.role,
      assignedModules: user.assignedModules || [1, 2, 3],
      dyslexiaLevel: user.dyslexiaLevel,
      dyslexiaType: user.dyslexiaType,
      hasKinestheticDyslexia: user.hasKinestheticDyslexia,
      course: user.course,
      age: user.age,
    }

    return NextResponse.json({
      success: true,
      message: "Login exitoso",
      user: studentData,
    })
  } catch (error) {
    console.error("Error en student login:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
