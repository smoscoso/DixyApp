"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Brain, ArrowLeft, Loader2, Eye, EyeOff, Mail, Lock, GraduationCap, Users } from "lucide-react"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    console.log("Intentando login con:", formData.email)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      console.log("Respuesta del servidor:", data)

      if (response.ok && data.success) {
        // Guardar información del usuario en localStorage
        localStorage.setItem("userId", data.user._id)
        localStorage.setItem("userName", data.user.name)
        localStorage.setItem("userRole", data.user.role)
        localStorage.setItem("userEmail", data.user.email)

        console.log("Login exitoso, redirigiendo...")

        // Redirigir según el rol
        if (data.user.role === "teacher") {
          router.push("/teacher/dashboard")
        } else {
          router.push("/modules")
        }
      } else {
        setError(data.error || "Error al iniciar sesión")
        console.error("Error de login:", data.error)
      }
    } catch (err) {
      console.error("Error de conexión:", err)
      setError("Error de conexión. Por favor, intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header con navegación */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="font-medium">Volver al inicio</span>
          </Link>

          {/* Logo y título */}
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="relative">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-3 rounded-2xl shadow-lg">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                <GraduationCap className="h-3 w-3 text-yellow-800" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                DislexiaApp
              </h1>
              <p className="text-sm text-gray-600">Portal Docente</p>
            </div>
          </div>
        </div>

        {/* Card principal */}
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full w-20 h-20 flex items-center justify-center">
              <Users className="h-10 w-10 text-indigo-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">Bienvenido, Docente 👨‍🏫</CardTitle>
            <p className="text-gray-600 text-sm">
              Accede a tu panel de control para gestionar a tus estudiantes y monitorear su progreso
            </p>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-indigo-600" />
                  Correo Electrónico
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="pl-10 h-12 border-2 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl transition-all duration-200"
                    placeholder="tu@email.com"
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>

              {/* Campo Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-indigo-600" />
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="pl-10 pr-12 h-12 border-2 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl transition-all duration-200"
                    placeholder="Tu contraseña"
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Mensaje de error */}
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800 text-sm">{error}</AlertDescription>
                </Alert>
              )}

              {/* Botón de envío */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    <GraduationCap className="mr-2 h-5 w-5" />
                    Iniciar Sesión
                  </>
                )}
              </Button>
            </form>

            {/* Enlaces adicionales */}
            <div className="mt-8 space-y-4">
              {/* Enlace de recuperación */}
              <div className="text-center">
                <Link
                  href="/auth/forgot-password"
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold hover:underline transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* Separador */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">O</span>
                </div>
              </div>

              {/* Registro */}
              <div className="text-center">
                <p className="text-gray-600 text-sm mb-3">¿No tienes cuenta?</p>
                <Link href="/auth/register">
                  <Button
                    variant="outline"
                    className="w-full border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 rounded-xl h-11 font-semibold transition-all duration-200"
                  >
                    Registrarse como Docente
                  </Button>
                </Link>
              </div>

              {/* Acceso estudiantes */}
              <div className="text-center pt-4 border-t border-gray-100">
                <p className="text-gray-600 text-sm mb-3">¿Eres estudiante?</p>
                <Link href="/auth/student-login">
                  <Button
                    variant="outline"
                    className="w-full border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 rounded-xl h-11 font-semibold transition-all duration-200"
                  >
                    Acceso para Estudiantes
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mensaje informativo */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🎯</div>
            <div>
              <p className="text-sm font-semibold text-blue-800 mb-1">Panel de Control Docente</p>
              <p className="text-xs text-blue-700">
                Gestiona estudiantes, asigna módulos y monitorea el progreso de aprendizaje en tiempo real
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
