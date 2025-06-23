"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, User, BookOpen, TrendingUp, Target, Award } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface StudentProgress {
  student: {
    name: string
    lastName: string
    username: string
    age: number
    course: string
    dyslexiaLevel: string
    dyslexiaType: string
    hasKinestheticDyslexia: boolean
  }
  generalProgress: number
  moduleProgress: Array<{
    id: number
    name: string
    icon: string
    completedLevels: number
    maxLevels: number
    progressPercentage: number
    totalAttempts: number
    totalSuccesses: number
  }>
  assignedModules: number[]
  progressHistory: Array<{
    date: string
    progress: number
    module: number
  }>
}

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"]

export default function StudentProgressPage() {
  const [studentProgress, setStudentProgress] = useState<StudentProgress | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const studentId = searchParams.get("id")

  useEffect(() => {
    if (!studentId) {
      router.push("/teacher/dashboard")
      return
    }
    loadStudentProgress()
  }, [studentId, router])

  const loadStudentProgress = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/student/progress?studentId=${studentId}`)
      const data = await response.json()

      if (response.ok) {
        // Generar datos de progreso histórico simulados
        const progressHistory = generateProgressHistory(data.moduleProgress)
        setStudentProgress({ ...data, progressHistory })
      } else {
        setError(data.error || "Error al cargar el progreso")
      }
    } catch (error) {
      console.error("Error:", error)
      setError("Error de conexión")
    } finally {
      setIsLoading(false)
    }
  }

  const generateProgressHistory = (moduleProgress: any[]) => {
    const history = []
    const today = new Date()

    for (let i = 30; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      const progress = Math.min(
        Math.floor(Math.random() * (100 - i * 2)) + i * 2,
        moduleProgress.reduce((sum, mod) => sum + mod.progressPercentage, 0) / moduleProgress.length,
      )

      history.push({
        date: date.toISOString().split("T")[0],
        progress: Math.max(0, progress),
        module: Math.floor(Math.random() * moduleProgress.length) + 1,
      })
    }

    return history
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando progreso del estudiante...</p>
        </div>
      </div>
    )
  }

  if (error || !studentProgress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error || "No se pudo cargar el progreso"}</p>
            <Button onClick={() => router.push("/teacher/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { student, generalProgress, moduleProgress, progressHistory } = studentProgress

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push("/teacher/dashboard")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Progreso de {student.name} {student.lastName}
                </h1>
                <p className="text-sm text-gray-600">@{student.username}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Información del estudiante */}
        <Card className="mb-8 border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información del Estudiante
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Datos Personales</p>
                  <p className="text-lg font-semibold">
                    {student.name} {student.lastName}
                  </p>
                  <p className="text-gray-600">
                    {student.age} años • {student.course}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Configuración de Dislexia</p>
                  <p className="text-lg font-semibold">
                    {student.dyslexiaLevel} - {student.dyslexiaType}
                  </p>
                  {student.hasKinestheticDyslexia && (
                    <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                      + Kinestésica
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Progreso General</p>
                  <div className="flex items-center gap-3">
                    <Progress value={generalProgress} className="flex-1" />
                    <span className="text-2xl font-bold text-indigo-600">{generalProgress}%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráficas de progreso */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Progreso histórico */}
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Progreso en el Tiempo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={progressHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="progress" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Progreso por módulo */}
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Progreso por Módulo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={moduleProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="progressPercentage" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Distribución de intentos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Distribución de Intentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={moduleProgress}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="totalAttempts"
                  >
                    {moduleProgress.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Estadísticas generales */}
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Estadísticas Generales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {moduleProgress.reduce((sum, mod) => sum + mod.totalAttempts, 0)}
                    </p>
                    <p className="text-sm text-blue-600">Total Intentos</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {moduleProgress.reduce((sum, mod) => sum + mod.totalSuccesses, 0)}
                    </p>
                    <p className="text-sm text-green-600">Total Aciertos</p>
                  </div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">
                    {moduleProgress.length > 0
                      ? Math.round(
                          (moduleProgress.reduce((sum, mod) => sum + mod.totalSuccesses, 0) /
                            moduleProgress.reduce((sum, mod) => sum + mod.totalAttempts, 0)) *
                            100,
                        ) || 0
                      : 0}
                    %
                  </p>
                  <p className="text-sm text-purple-600">Precisión General</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detalle por módulo */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Detalle por Módulo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {moduleProgress.map((module) => (
                <div key={module.id} className="p-4 border border-gray-200 rounded-xl bg-white">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{module.icon}</span>
                    <div>
                      <h3 className="font-semibold">{module.name}</h3>
                      <p className="text-sm text-gray-600">Módulo {module.id}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progreso</span>
                        <span>{module.progressPercentage}%</span>
                      </div>
                      <Progress value={module.progressPercentage} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <p className="font-semibold text-blue-600">{module.completedLevels}</p>
                        <p className="text-blue-600">Niveles</p>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <p className="font-semibold text-green-600">
                          {module.totalAttempts > 0
                            ? Math.round((module.totalSuccesses / module.totalAttempts) * 100)
                            : 0}
                          %
                        </p>
                        <p className="text-green-600">Precisión</p>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 text-center">
                      {module.totalAttempts} intentos • {module.totalSuccesses} aciertos
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
