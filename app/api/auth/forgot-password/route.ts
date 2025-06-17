import { type NextRequest, NextResponse } from "next/server"
import { generateResetToken } from "@/lib/db-utils"
import { sendEmail, createPasswordResetEmailTemplate } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    console.log("🔄 Procesando solicitud de reset de contraseña para:", email)

    if (!email) {
      return NextResponse.json({ error: "Email es requerido" }, { status: 400 })
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Formato de email inválido" }, { status: 400 })
    }

    console.log("✅ Email válido, generando token...")

    const resetToken = await generateResetToken(email)

    if (!resetToken) {
      console.log("⚠️  Email no encontrado en la base de datos:", email)
      // Por seguridad, no revelamos si el email existe o no
      return NextResponse.json({
        success: true,
        message: "Si el email está registrado, recibirás un enlace de recuperación en tu bandeja de entrada.",
      })
    }

    console.log("✅ Token generado exitosamente para:", email)

    // Construir URL de reset
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const resetUrl = `${baseUrl}/auth/reset-password?token=${resetToken}`

    console.log("🔗 URL de reset generada:", resetUrl)

    // Crear el contenido del email
    const emailHtml = createPasswordResetEmailTemplate(resetUrl, email)

    console.log("📧 Intentando enviar email...")

    // Intentar enviar el email
    const emailSent = await sendEmail({
      to: email,
      subject: "🔑 Recuperar contraseña - DixyApp",
      html: emailHtml,
    })

    if (emailSent) {
      console.log("✅ Email enviado exitosamente a:", email)
      return NextResponse.json({
        success: true,
        message: "Email enviado exitosamente. Revisa tu bandeja de entrada.",
      })
    } else {
      console.log("❌ No se pudo enviar el email a:", email)

      // En desarrollo, devolvemos el link para testing
      if (process.env.NODE_ENV === "development") {
        console.log("🔧 Modo desarrollo - devolviendo enlace directamente")
        return NextResponse.json({
          success: true,
          message: "Error enviando email. Usa el enlace de abajo (solo en desarrollo):",
          resetUrl,
          devNote: "En producción, este enlace se enviaría por email",
        })
      } else {
        return NextResponse.json(
          {
            success: false,
            error: "Error enviando el email. Por favor, intenta de nuevo más tarde.",
          },
          { status: 500 },
        )
      }
    }
  } catch (error) {
    console.error("❌ Error en forgot-password:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor. Por favor, intenta de nuevo más tarde.",
      },
      { status: 500 },
    )
  }
}
