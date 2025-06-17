// Sistema de envío de emails usando Nodemailer (configurado para Gmail)

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
  try {
    console.log("🔄 Intentando enviar email a:", to)

    // Verificar configuración de email
    const emailUser = process.env.EMAIL_USER
    const emailPass = process.env.EMAIL_PASS
    const emailHost = process.env.EMAIL_HOST || "smtp.gmail.com"
    const emailPort = Number.parseInt(process.env.EMAIL_PORT || "587")

    console.log("📧 Configuración de email:")
    console.log("- Host:", emailHost)
    console.log("- Port:", emailPort)
    console.log("- User:", emailUser)
    console.log("- Pass configurado:", emailPass ? "Sí" : "No")

    if (!emailUser || !emailPass) {
      console.log("⚠️  Credenciales de email no configuradas")
      console.log("Variables de entorno necesarias:")
      console.log("- EMAIL_USER:", emailUser ? "✓" : "✗")
      console.log("- EMAIL_PASS:", emailPass ? "✓" : "✗")

      // En desarrollo, mostramos el contenido
      console.log("📧 Contenido del email que se enviaría:")
      console.log(`Para: ${to}`)
      console.log(`Asunto: ${subject}`)
      console.log("Contenido HTML:", html.substring(0, 200) + "...")

      return false
    }

    // Usar Nodemailer
    const nodemailer = await import("nodemailer")

    console.log("🔧 Creando transporter de Nodemailer...")

    const transporter = nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: emailPort === 465, // true para 465, false para otros puertos
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      // Configuraciones adicionales para Gmail
      tls: {
        rejectUnauthorized: false,
      },
    })

    console.log("✅ Transporter creado, verificando conexión...")

    // Verificar la conexión
    try {
      await transporter.verify()
      console.log("✅ Conexión SMTP verificada exitosamente")
    } catch (verifyError) {
      console.error("❌ Error verificando conexión SMTP:", verifyError)
      return false
    }

    const mailOptions = {
      from: `"DixyApp" <${emailUser}>`,
      to,
      subject,
      html,
    }

    console.log("📤 Enviando email...")
    const info = await transporter.sendMail(mailOptions)

    console.log("✅ Email enviado exitosamente!")
    console.log("- Message ID:", info.messageId)
    console.log("- Response:", info.response)

    return true
  } catch (error) {
    console.error("❌ Error enviando email:", error)

    // Información adicional para debugging
    if (error instanceof Error) {
      console.error("- Error message:", error.message)
      console.error("- Error stack:", error.stack)
    }

    return false
  }
}

// Template para email de recuperación de contraseña
export function createPasswordResetEmailTemplate(resetUrl: string, userEmail: string): string {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recuperar Contraseña - DixyApp</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          background-color: #f4f4f4; 
          margin: 0; 
          padding: 20px; 
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: white; 
          border-radius: 10px; 
          box-shadow: 0 0 20px rgba(0,0,0,0.1); 
          overflow: hidden;
        }
        .header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; 
          padding: 30px; 
          text-align: center; 
        }
        .header h1 { 
          margin: 0; 
          font-size: 28px; 
        }
        .content { 
          padding: 40px 30px; 
        }
        .button { 
          display: inline-block; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; 
          padding: 15px 30px; 
          text-decoration: none; 
          border-radius: 25px; 
          font-weight: bold; 
          margin: 20px 0;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        .warning { 
          background-color: #fff3cd; 
          border: 1px solid #ffeaa7; 
          border-radius: 5px; 
          padding: 15px; 
          margin: 20px 0; 
          color: #856404; 
        }
        .footer { 
          background-color: #f8f9fa; 
          padding: 20px; 
          text-align: center; 
          font-size: 12px; 
          color: #6c757d; 
        }
        .logo { 
          font-size: 24px; 
          font-weight: bold; 
          margin-bottom: 10px; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🧠 DixyApp</div>
          <h1>Recuperar Contraseña</h1>
        </div>
        
        <div class="content">
          <h2>¡Hola!</h2>
          <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta <strong>${userEmail}</strong>.</p>
          
          <p>Si fuiste tú quien solicitó este cambio, haz clic en el siguiente botón para crear una nueva contraseña:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
          </div>
          
          <div class="warning">
            <strong>⚠️ Importante:</strong>
            <ul>
              <li>Este enlace expirará en <strong>1 hora</strong></li>
              <li>Solo puedes usar este enlace una vez</li>
              <li>Si no solicitaste este cambio, puedes ignorar este mensaje</li>
            </ul>
          </div>
          
          <p>Si el botón no funciona, también puedes copiar y pegar este enlace en tu navegador:</p>
          <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace;">
            ${resetUrl}
          </p>
          
          <p>Si tienes alguna pregunta o problema, no dudes en contactarnos.</p>
          
          <p>¡Gracias por usar DixyApp!</p>
        </div>
        
        <div class="footer">
          <p>Este es un email automático, por favor no respondas a este mensaje.</p>
          <p>&copy; 2024 DixyApp. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `
}
