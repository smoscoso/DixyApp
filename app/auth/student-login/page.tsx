"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, User, Lock, BookOpen, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"

export default function StudentLoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{ username?: string; password?: string }>({})
  const router = useRouter()

  const validateForm = () => {
    const errors: { username?: string; password?: string } = {}

    if (!username.trim()) {
      errors.username = "El nombre de usuario es requerido"
    } else if (username.length < 2) {
      errors.username = "El nombre de usuario debe tener al menos 2 caracteres"
    }

    if (!password) {
      errors.password = "La contraseña es requerida"
    } else if (password.length < 3) {
      errors.password = "La contraseña debe tener al menos 3 caracteres"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setError("")

    try {
      console.log("🔐 Intentando login de estudiante...")

      const response = await fetch("/api/auth/student-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: username.trim(), password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        console.log("✅ Login exitoso:", data.user)

        // Guardar información completa del estudiante
        localStorage.setItem("userId", data.user.id)
        localStorage.setItem("userName", data.user.name)
        localStorage.setItem("userUsername", data.user.username)
        localStorage.setItem("userRole", data.user.role)
        localStorage.setItem("assignedModules", JSON.stringify(data.user.assignedModules))
        localStorage.setItem("dyslexiaLevel", data.user.dyslexiaLevel || "")
        localStorage.setItem("dyslexiaType", data.user.dyslexiaType || "")
        localStorage.setItem("hasKinestheticDyslexia", data.user.hasKinestheticDyslexia ? "true" : "false")

        console.log("📚 Módulos asignados guardados:", data.user.assignedModules)

        // Redirigir a la página de módulos
        router.push("/modules")
      } else {
        console.error("❌ Error en login:", data.error)
        setError(data.error || "Error al iniciar sesión")
      }
    } catch (error) {
      console.error("❌ Error de conexión:", error)
      setError("Error de conexión. Por favor, intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const getFieldStatus = (field: string, value: string) => {
    if (!value) return "default"
    if (validationErrors[field as keyof typeof validationErrors]) return "error"
    return "success"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-green-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-blue-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-40 w-28 h-28 bg-cyan-200 rounded-full opacity-20 animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-20 w-36 h-36 bg-teal-200 rounded-full opacity-20 animate-pulse delay-500"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Botón de regreso */}
        <div className="mb-6">
          <Link href="/">
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-green-200 hover:bg-green-50 hover:border-green-300 transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio
            </Button>
          </Link>
        </div>

        {/* Tarjeta principal */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-500 via-teal-500 to-cyan-500 text-white text-center py-8">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <BookOpen className="h-10 w-10 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold mb-2">¡Hola, Estudiante! 👋</CardTitle>
            <p className="text-green-100 text-lg">Ingresa tus credenciales para comenzar tu aventura de aprendizaje</p>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo de nombre de usuario */}
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="h-4 w-4 text-green-600" />
                  Nombre de Usuario
                </label>
                <div className="relative">
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value)
                      if (validationErrors.username) {
                        setValidationErrors((prev) => ({ ...prev, username: undefined }))
                      }
                    }}
                    placeholder="Ej: juan.perez"
                    className={`pl-10 pr-10 h-12 text-lg transition-all duration-300 ${
                      getFieldStatus("username", username) === "error"
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                        : getFieldStatus("username", username) === "success"
                          ? "border-green-300 focus:border-green-500 focus:ring-green-200"
                          : "border-gray-300 focus:border-green-500 focus:ring-green-200"
                    }`}
                    disabled={isLoading}
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  {getFieldStatus("username", username) === "success" && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                  )}
                  {getFieldStatus("username", username) === "error" && (
                    <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-500" />
                  )}
                </div>
                {validationErrors.username && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.username}
                  </p>
                )}
              </div>

              {/* Campo de contraseña */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-green-600" />
                  Contraseña
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (validationErrors.password) {
                        setValidationErrors((prev) => ({ ...prev, password: undefined }))
                      }
                    }}
                    placeholder="Tu contraseña secreta"
                    className={`pl-10 pr-10 h-12 text-lg transition-all duration-300 ${
                      getFieldStatus("password", password) === "error"
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                        : getFieldStatus("password", password) === "success"
                          ? "border-green-300 focus:border-green-500 focus:ring-green-200"
                          : "border-gray-300 focus:border-green-500 focus:ring-green-200"
                    }`}
                    disabled={isLoading}
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.password}
                  </p>
                )}
              </div>

              {/* Mensaje de error */}
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              {/* Botón de envío */}
              <Button
                type="submit"
                disabled={isLoading || !username.trim() || !password}
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-green-500 via-teal-500 to-cyan-500 hover:from-green-600 hover:via-teal-600 hover:to-cyan-600 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Ingresando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    ¡Comenzar Aventura!
                  </div>
                )}
              </Button>
            </form>

            {/* Información adicional */}
            <div className="mt-8 text-center">
              <div className="bg-gradient-to-r from-green-50 to-cyan-50 rounded-lg p-4 border border-green-100">
                <h3 className="text-sm font-semibold text-green-800 mb-2">💡 ¿Necesitas ayuda?</h3>
                <p className="text-xs text-green-700">
                  Si no recuerdas tus credenciales, pregunta a tu docente. Tu nombre de usuario es tu nombre y apellido
                  separados por un punto.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Elementos decorativos inferiores */}
        <div className="mt-8 text-center">
          <div className="flex justify-center gap-4 text-4xl animate-bounce">
            <span className="animate-bounce delay-0">🎓</span>
            <span className="animate-bounce delay-100">📚</span>
            <span className="animate-bounce delay-200">🌟</span>
            <span className="animate-bounce delay-300">🚀</span>
          </div>
        </div>
      </div>
    </div>
  )
}
