import { type NextRequest, NextResponse } from "next/server"
import { authenticateUser } from "@/lib/db-utils"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log("=== LOGIN ATTEMPT ===")
    console.log("Email:", email)
    console.log("Password length:", password?.length)

    if (!email || !password) {
      console.log("Missing email or password")
      return NextResponse.json(
        {
          success: false,
          error: "Email y contraseña son requeridos",
        },
        { status: 400 },
      )
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log("Invalid email format")
      return NextResponse.json(
        {
          success: false,
          error: "Formato de email inválido",
        },
        { status: 400 },
      )
    }

    console.log("Attempting authentication...")
    const user = await authenticateUser(email, password)

    if (!user) {
      console.log("Authentication failed - invalid credentials")
      return NextResponse.json(
        {
          success: false,
          error: "Credenciales inválidas. Verifica tu email y contraseña.",
        },
        { status: 401 },
      )
    }

    console.log("Authentication successful!")
    console.log("User ID:", user._id)
    console.log("User role:", user.role)
    console.log("User name:", user.name)

    return NextResponse.json({
      success: true,
      message: "Inicio de sesión exitoso",
      user: {
        _id: user._id?.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        assignedModules: user.assignedModules || [],
      },
    })
  } catch (error) {
    console.error("=== LOGIN ERROR ===")
    console.error("Error details:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor. Por favor, intenta de nuevo.",
      },
      { status: 500 },
    )
  }
}
