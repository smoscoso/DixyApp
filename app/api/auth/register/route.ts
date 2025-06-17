import { type NextRequest, NextResponse } from "next/server"
import { createTeacher } from "@/lib/db-utils"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 })
    }

    const user = await createTeacher(name, email, password)

    return NextResponse.json({
      message: "Usuario registrado exitosamente",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Error en registro:", error)

    if (error instanceof Error && error.message === "El email ya está registrado") {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 409 })
    }

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
