import { type NextRequest, NextResponse } from "next/server"
import { verifyDashboardPassword } from "@/lib/admin-utils"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    if (!password) {
      return NextResponse.json({ error: "Contraseña requerida" }, { status: 400 })
    }

    const isValid = await verifyDashboardPassword(password)

    if (isValid) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 })
    }
  } catch (error) {
    console.error("Error en autenticación del dashboard:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
