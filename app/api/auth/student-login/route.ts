import { type NextRequest, NextResponse } from "next/server"
import { authenticateStudent } from "@/lib/db-utils"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Usuario y contraseña son requeridos" }, { status: 400 })
    }

    const user = await authenticateStudent(username, password)

    if (!user) {
      return NextResponse.json({ error: "Usuario o contraseña incorrectos" }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      message: "Login exitoso",
      user: {
        _id: user._id,
        name: user.name,
        lastName: user.lastName,
        username: user.username,
        age: user.age,
        role: user.role,
        assignedModules: user.assignedModules,
        dyslexiaLevel: user.dyslexiaLevel,
        dyslexiaType: user.dyslexiaType,
        hasKinestheticDyslexia: user.hasKinestheticDyslexia,
      },
    })
  } catch (error) {
    console.error("Error en student login:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
