import { type NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email es requerido" }, { status: 400 })
    }

    console.log("🧪 Probando envío de email a:", email)

    const testHtml = `
      <h1>Prueba de Email - Dislexia App</h1>
      <p>Este es un email de prueba para verificar la configuración.</p>
      <p>Si recibes este mensaje, la configuración de email está funcionando correctamente.</p>
      <p>Fecha: ${new Date().toLocaleString()}</p>
    `

    const emailSent = await sendEmail({
      to: email,
      subject: "🧪 Prueba de Email - Dislexia App",
      html: testHtml,
    })

    if (emailSent) {
      return NextResponse.json({
        success: true,
        message: "Email de prueba enviado exitosamente",
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "No se pudo enviar el email de prueba",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error en test-email:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 },
    )
  }
}
