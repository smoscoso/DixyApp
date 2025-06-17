"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Mail, CheckCircle, AlertCircle, Send, Loader2, Shield } from "lucide-react"
import Link from "next/link"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [resetUrl, setResetUrl] = useState("") // Para desarrollo
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setMessage("")
    setResetUrl("")
    setSuccess(false)

    if (!email.trim()) {
      setError("Por favor, ingresa tu email")
      return
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Por favor, ingresa un email válido")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        setMessage(data.message)
        // En desarrollo, mostrar el enlace directo
        if (data.resetUrl) {
          setResetUrl(data.resetUrl)
        }
      } else {
        setError(data.error || "Hubo un problema al procesar tu solicitud")
      }
    } catch (err) {
      console.error("Error:", err)
      setError("Error de conexión. Por favor, intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Botón de regreso */}
        <div className="mb-6">
          <Link href="/auth/login">
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-white/50 rounded-xl transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="font-medium">Volver al Login</span>
            </Button>
          </Link>
        </div>

        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full w-20 h-20 flex items-center justify-center">
              {success ? (
                <CheckCircle className="h-10 w-10 text-green-600" />
              ) : (
                <Shield className="h-10 w-10 text-blue-600" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
              {success ? "¡Correo Enviado! 📧" : "Recuperar Contraseña 🔐"}
            </CardTitle>
            <p className="text-gray-600 text-sm">
              {success
                ? "Revisa tu bandeja de entrada para continuar"
                : "Ingresa tu email para recibir un enlace de recuperación"}
            </p>
          </CardHeader>

          <CardContent className="pt-6">
            {!success ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-600" />
                    Correo Electrónico
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="pl-10 h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl transition-all duration-200"
                      required
                      disabled={isLoading}
                    />
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive" className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-red-800 text-sm">{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Enviar Enlace de Recuperación
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-6">
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 text-sm">{message}</AlertDescription>
                </Alert>

                {/* Enlace para desarrollo */}
                {resetUrl && (
                  <Alert className="border-blue-200 bg-blue-50">
                    <AlertDescription className="text-blue-800 text-sm">
                      <strong>Modo Desarrollo:</strong>
                      <br />
                      <Link href={resetUrl} className="text-blue-600 hover:underline break-all font-medium">
                        Usar enlace directo de recuperación
                      </Link>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Instrucciones */}
                <div className="space-y-4 text-sm text-gray-600">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="text-xl">📧</div>
                    <p>Revisa tu bandeja de entrada</p>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <div className="text-xl">📁</div>
                    <p>También revisa la carpeta de spam</p>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                    <div className="text-xl">⏰</div>
                    <p>El enlace expira en 1 hora</p>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    variant="outline"
                    className="w-full h-11 border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 rounded-xl font-semibold transition-all duration-200"
                    onClick={() => {
                      setSuccess(false)
                      setEmail("")
                      setMessage("")
                    }}
                  >
                    Enviar otro enlace
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                ¿Recordaste tu contraseña?{" "}
                <Link href="/auth/login" className="text-blue-600 hover:underline font-semibold transition-colors">
                  Iniciar Sesión
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Información de seguridad */}
        <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🔒</div>
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-1">Seguridad Garantizada</p>
              <p className="text-xs text-gray-600">
                Tu información está protegida. Solo tú podrás acceder al enlace de recuperación
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
