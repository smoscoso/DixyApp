"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Brain,
  ArrowLeft,
  Eye,
  EyeOff,
  Mail,
  User,
  Lock,
  CheckCircle,
  XCircle,
  GraduationCap,
  BookOpen,
  Users,
} from "lucide-react"

interface PasswordStrength {
  score: number
  feedback: string[]
  color: string
}

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    color: "bg-gray-200",
  })
  const [validations, setValidations] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSymbol: false,
    passwordsMatch: false,
    emailValid: false,
    nameValid: false,
  })

  const router = useRouter()

  // Validación de email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Análisis de fuerza de contraseña
  const analyzePasswordStrength = (password: string): PasswordStrength => {
    let score = 0
    const feedback: string[] = []

    if (password.length >= 8) score += 20
    else feedback.push("Mínimo 8 caracteres")

    if (/[A-Z]/.test(password)) score += 20
    else feedback.push("Una mayúscula")

    if (/[a-z]/.test(password)) score += 20
    else feedback.push("Una minúscula")

    if (/\d/.test(password)) score += 20
    else feedback.push("Un número")

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 20
    else feedback.push("Un símbolo especial")

    let color = "bg-red-500"
    if (score >= 80) color = "bg-green-500"
    else if (score >= 60) color = "bg-yellow-500"
    else if (score >= 40) color = "bg-orange-500"

    return { score, feedback, color }
  }

  // Actualizar validaciones en tiempo real
  useEffect(() => {
    const newValidations = {
      minLength: formData.password.length >= 8,
      hasUppercase: /[A-Z]/.test(formData.password),
      hasLowercase: /[a-z]/.test(formData.password),
      hasNumber: /\d/.test(formData.password),
      hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
      passwordsMatch: formData.password === formData.confirmPassword && formData.confirmPassword !== "",
      emailValid: validateEmail(formData.email),
      nameValid: formData.name.trim().length >= 2,
    }
    setValidations(newValidations)

    if (formData.password) {
      setPasswordStrength(analyzePasswordStrength(formData.password))
    }
  }, [formData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validaciones finales
    if (!validations.nameValid) {
      setError("El nombre debe tener al menos 2 caracteres")
      return
    }

    if (!validations.emailValid) {
      setError("Por favor ingresa un email válido")
      return
    }

    if (passwordStrength.score < 80) {
      setError("La contraseña debe cumplir todos los requisitos de seguridad")
      return
    }

    if (!validations.passwordsMatch) {
      setError("Las contraseñas no coinciden")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Guardar información del usuario en localStorage
        localStorage.setItem("userId", data.user._id)
        localStorage.setItem("userRole", data.user.role)
        localStorage.setItem("userName", data.user.name)

        // Redirigir al dashboard del docente
        router.push("/teacher/dashboard")
      } else {
        setError(data.error || "Error al registrar usuario")
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

  const ValidationIcon = ({ isValid }: { isValid: boolean }) =>
    isValid ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-6 transition-colors duration-200 group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            Volver al inicio
          </Link>

          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="relative">
              <Brain className="h-10 w-10 text-indigo-600" />
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full flex items-center justify-center">
                <GraduationCap className="h-2.5 w-2.5 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              DislexiaApp
            </h1>
          </div>

          <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 mb-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-indigo-500" />
              <span>Educación Personalizada</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-indigo-500" />
              <span>Gestión de Estudiantes</span>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <Card className="border-2 border-indigo-100 shadow-xl backdrop-blur-sm bg-white/95">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl text-indigo-900 mb-2">Registro de Docente</CardTitle>
            <p className="text-gray-600">
              Únete a nuestra plataforma educativa y comienza a transformar el aprendizaje
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nombre Completo */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Nombre Completo
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={`pl-10 border-2 transition-all duration-200 ${
                      formData.name
                        ? validations.nameValid
                          ? "border-green-300 focus:border-green-500"
                          : "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-indigo-500"
                    }`}
                    placeholder="Ingresa tu nombre completo"
                  />
                  {formData.name && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <ValidationIcon isValid={validations.nameValid} />
                    </div>
                  )}
                </div>
                {formData.name && !validations.nameValid && (
                  <p className="text-xs text-red-600 flex items-center space-x-1">
                    <XCircle className="h-3 w-3" />
                    <span>El nombre debe tener al menos 2 caracteres</span>
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Correo Electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={`pl-10 border-2 transition-all duration-200 ${
                      formData.email
                        ? validations.emailValid
                          ? "border-green-300 focus:border-green-500"
                          : "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-indigo-500"
                    }`}
                    placeholder="tu@email.com"
                  />
                  {formData.email && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <ValidationIcon isValid={validations.emailValid} />
                    </div>
                  )}
                </div>
                {formData.email && !validations.emailValid && (
                  <p className="text-xs text-red-600 flex items-center space-x-1">
                    <XCircle className="h-3 w-3" />
                    <span>Por favor ingresa un email válido</span>
                  </p>
                )}
              </div>

              {/* Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="pl-10 pr-10 border-2 border-gray-200 focus:border-indigo-500 transition-all duration-200"
                    placeholder="Crea una contraseña segura"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Indicador de fuerza de contraseña */}
                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: `${passwordStrength.score}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600">
                        {passwordStrength.score < 40
                          ? "Débil"
                          : passwordStrength.score < 60
                            ? "Regular"
                            : passwordStrength.score < 80
                              ? "Buena"
                              : "Excelente"}
                      </span>
                    </div>

                    {/* Requisitos de contraseña */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div
                        className={`flex items-center space-x-1 ${validations.minLength ? "text-green-600" : "text-red-600"}`}
                      >
                        <ValidationIcon isValid={validations.minLength} />
                        <span>8+ caracteres</span>
                      </div>
                      <div
                        className={`flex items-center space-x-1 ${validations.hasUppercase ? "text-green-600" : "text-red-600"}`}
                      >
                        <ValidationIcon isValid={validations.hasUppercase} />
                        <span>Mayúscula</span>
                      </div>
                      <div
                        className={`flex items-center space-x-1 ${validations.hasLowercase ? "text-green-600" : "text-red-600"}`}
                      >
                        <ValidationIcon isValid={validations.hasLowercase} />
                        <span>Minúscula</span>
                      </div>
                      <div
                        className={`flex items-center space-x-1 ${validations.hasNumber ? "text-green-600" : "text-red-600"}`}
                      >
                        <ValidationIcon isValid={validations.hasNumber} />
                        <span>Número</span>
                      </div>
                      <div
                        className={`flex items-center space-x-1 ${validations.hasSymbol ? "text-green-600" : "text-red-600"} col-span-2`}
                      >
                        <ValidationIcon isValid={validations.hasSymbol} />
                        <span>Símbolo especial (!@#$%^&*)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirmar Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirmar Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className={`pl-10 pr-10 border-2 transition-all duration-200 ${
                      formData.confirmPassword
                        ? validations.passwordsMatch
                          ? "border-green-300 focus:border-green-500"
                          : "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-indigo-500"
                    }`}
                    placeholder="Repite tu contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  {formData.confirmPassword && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <ValidationIcon isValid={validations.passwordsMatch} />
                    </div>
                  )}
                </div>
                {formData.confirmPassword && !validations.passwordsMatch && (
                  <p className="text-xs text-red-600 flex items-center space-x-1">
                    <XCircle className="h-3 w-3" />
                    <span>Las contraseñas no coinciden</span>
                  </p>
                )}
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={
                  isLoading ||
                  passwordStrength.score < 80 ||
                  !validations.passwordsMatch ||
                  !validations.emailValid ||
                  !validations.nameValid
                }
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>Creando cuenta...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="h-4 w-4" />
                    <span>Crear Cuenta</span>
                  </div>
                )}
              </Button>
            </form>

            {/* Login Link */}
            <div className="text-center pt-4 border-t border-gray-100">
              <p className="text-gray-600">
                ¿Ya tienes una cuenta?{" "}
                <Link
                  href="/auth/login"
                  className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200 hover:underline"
                >
                  Inicia sesión aquí
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Al registrarte, aceptas nuestros términos de servicio y política de privacidad</p>
        </div>
      </div>
    </div>
  )
}
