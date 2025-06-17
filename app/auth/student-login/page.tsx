"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, BookOpen, Eye, EyeOff, User, Lock, Loader2, CheckCircle } from "lucide-react"

export default function StudentLoginPage() {
  const [formData, setFormData] = useState({
    username: "",
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

    try {
      const response = await fetch("/api/auth/student-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        // Guardar información del estudiante en localStorage
        localStorage.setItem("userId", data.user._id)
        localStorage.setItem("userRole", data.user.role)
        localStorage.setItem("userName", data.user.name)
        localStorage.setItem("userLastName", data.user.lastName || "")
        localStorage.setItem("username", data.user.username)
        localStorage.setItem("assignedModules", JSON.stringify(data.user.assignedModules || []))

        // Redirigir al dashboard del estudiante
        router.push("/student/dashboard")
      } else {
        setError(data.error || "Error al iniciar sesión")
      }
    } catch (err) {
      console.error("Error:", err)
      setError("Error de conexión. Por favor, intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header con navegación */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="font-medium">Volver al inicio</span>
          </Link>

          {/* Logo y título */}
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="relative">
              <div className="bg-gradient-to-br from-emerald-500 to-cyan-600 p-3 rounded-2xl shadow-lg">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-xs">✨</span>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                DislexiaApp
              </h1>
              <p className="text-sm text-gray-600">Portal Estudiantil</p>
            </div>
          </div>
        </div>

        {/* Card principal */}
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-emerald-100 to-cyan-100 rounded-full w-20 h-20 flex items-center justify-center">
              <User className="h-10 w-10 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">¡Hola, Estudiante! 👋</CardTitle>
            <p className="text-gray-600 text-sm">Ingresa tus credenciales para acceder a tus módulos de aprendizaje</p>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo Usuario */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <User className="h-4 w-4 text-emerald-600" />
                  Nombre de Usuario
                </Label>
                <div className="relative">
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="pl-10 h-12 border-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl transition-all duration-200"
                    placeholder="tu.nombre"
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  💡 Formato: nombre.apellido (ej: juan.perez)
                </p>
              </div>

              {/* Campo Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-emerald-600" />
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
                    className="pl-10 pr-12 h-12 border-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl transition-all duration-200"
                    placeholder="Tu contraseña especial"
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
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  🔑 Tu contraseña es tu nombre + tu edad (ej: Juan10)
                </p>
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
                className="w-full h-12 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    ¡Entrar a Jugar!
                  </>
                )}
              </Button>
            </form>

            {/* Enlaces adicionales */}
            <div className="mt-8 space-y-4">
              <div className="text-center">
                <p className="text-gray-600 text-sm">
                  ¿Eres docente?{" "}
                  <Link
                    href="/auth/login"
                    className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline transition-colors"
                  >
                    Acceso para docentes
                  </Link>
                </p>
              </div>

              {/* Información de ayuda */}
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🎓</div>
                  <div>
                    <p className="text-sm font-semibold text-yellow-800 mb-1">¿No tienes cuenta?</p>
                    <p className="text-xs text-yellow-700">
                      Pídele a tu maestro/a que te cree una cuenta para comenzar tu aventura de aprendizaje
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Elementos decorativos */}
        <div className="mt-8 flex justify-center gap-4 opacity-60">
          <div className="animate-bounce text-2xl">📚</div>
          <div className="animate-bounce delay-100 text-2xl">🌟</div>
          <div className="animate-bounce delay-200 text-2xl">🎯</div>
        </div>
      </div>
    </div>
  )
}
