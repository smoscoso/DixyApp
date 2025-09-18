"use client"

import type React from "react"
import PredictionDashboard from "@/components/prediction-dashboard"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Plus,
  Users,
  LogOut,
  Eye,
  Brain,
  TrendingUp,
  UserCheck,
  Loader2,
  CheckCircle,
  AlertCircle,
  Copy,
  Download,
  Bot,
  Target,
  AlertTriangle,
  ThumbsUp,
  RefreshCw,
} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import type { User } from "@/lib/models"
import { MODULE_INFO, DYSLEXIA_CONFIGS } from "@/lib/module-constants"
import DashboardCharts from "@/components/dashboard-charts"

interface StudentAnalysis {
  studentId: string
  studentName: string
  username: string
  observation: {
    overallPerformance: "excelente" | "bueno" | "regular" | "necesita_apoyo"
    strengths: string[]
    weaknesses: string[]
    recommendations: string[]
    riskLevel: "bajo" | "medio" | "alto"
    motivationLevel: "alta" | "media" | "baja"
    detailedAnalysis: string
  }
  metrics: {
    totalProgress: number
    totalAccuracy: number
    modulesCompleted: number
    totalAttempts: number
    lastActivity: number
  }
}

export default function TeacherDashboard() {
  const [students, setStudents] = useState<User[]>([])
  const [studentAnalyses, setStudentAnalyses] = useState<StudentAnalysis[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    age: "",
    course: "",
    dyslexiaLevel: "",
    dyslexiaType: "",
    hasKinestheticDyslexia: false,
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingStudents, setIsLoadingStudents] = useState(true)
  const [isLoadingAnalyses, setIsLoadingAnalyses] = useState(false)
  const [userName, setUserName] = useState("")
  const [createdCredentials, setCreatedCredentials] = useState<{ username: string; password: string } | null>(null)
  const [expandedAnalyses, setExpandedAnalyses] = useState<Set<string>>(new Set())
  const router = useRouter()

  useEffect(() => {
    const userId = localStorage.getItem("userId")
    const userRole = localStorage.getItem("userRole")
    const name = localStorage.getItem("userName")

    if (!userId || userRole !== "teacher") {
      router.push("/auth/login")
      return
    }

    setUserName(name || "")
    loadStudents()
  }, [router])

  const loadStudents = async () => {
    const userId = localStorage.getItem("userId")
    if (!userId) return

    setIsLoadingStudents(true)
    try {
      const response = await fetch(`/api/teacher/students?teacherId=${userId}`)
      const data = await response.json()

      if (response.ok) {
        setStudents(data.students || [])
        console.log("Estudiantes cargados:", data.students)
        // Cargar análisis automáticamente después de cargar estudiantes
        if (data.students && data.students.length > 0) {
          loadStudentAnalyses(userId)
        }
      } else {
        console.error("Error al cargar estudiantes:", data.error)
      }
    } catch (error) {
      console.error("Error al cargar estudiantes:", error)
    } finally {
      setIsLoadingStudents(false)
    }
  }

  const loadStudentAnalyses = async (teacherId?: string) => {
    const userId = teacherId || localStorage.getItem("userId")
    if (!userId) return

    setIsLoadingAnalyses(true)
    try {
      const response = await fetch(`/api/teacher/student-analysis?teacherId=${userId}`)
      const data = await response.json()

      if (response.ok) {
        setStudentAnalyses(data.analyses || [])
        console.log("Análisis cargados:", data.analyses)
      } else {
        console.error("Error al cargar análisis:", data.error)
      }
    } catch (error) {
      console.error("Error al cargar análisis:", error)
    } finally {
      setIsLoadingAnalyses(false)
    }
  }

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setCreatedCredentials(null)

    if (
      !formData.name.trim() ||
      !formData.lastName.trim() ||
      !formData.age ||
      !formData.course.trim() ||
      !formData.dyslexiaLevel ||
      !formData.dyslexiaType
    ) {
      setError("Todos los campos son obligatorios")
      return
    }

    const age = Number.parseInt(formData.age)
    if (age < 5 || age > 18) {
      setError("La edad debe estar entre 5 y 18 años")
      return
    }

    setIsLoading(true)

    try {
      const teacherId = localStorage.getItem("userId")
      const response = await fetch("/api/teacher/create-student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacherId,
          ...formData,
          age,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("¡Estudiante creado exitosamente!")
        setCreatedCredentials({
          username: data.username,
          password: data.password,
        })
        setFormData({
          name: "",
          lastName: "",
          age: "",
          course: "",
          dyslexiaLevel: "",
          dyslexiaType: "",
          hasKinestheticDyslexia: false,
        })
        setShowCreateForm(false)
        // Recargar la lista de estudiantes
        await loadStudents()
      } else {
        setError(data.error || "Error al crear estudiante")
      }
    } catch (err) {
      console.error("Error:", err)
      setError("Error de conexión. Por favor, intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleLogout = () => {
    localStorage.clear()
    router.push("/")
  }

  const viewStudentProgress = (studentId: string) => {
    router.push(`/teacher/student-progress?id=${studentId}`)
  }

  const getAssignedModules = (dyslexiaLevel: string, dyslexiaType: string, hasKinestheticDyslexia: boolean) => {
    const configKey = `${dyslexiaLevel}-${dyslexiaType}`
    const config = DYSLEXIA_CONFIGS[configKey]

    if (!config) return []

    let modules = [...config.assignedModules]

    // Si tiene dislexia kinestésica adicional y no es ya kinestésica, añadir módulos kinestésicos
    if (hasKinestheticDyslexia && dyslexiaType !== "kinestesica") {
      modules = [...new Set([...modules, 4, 5, 6])]
    }

    return modules.map((moduleId) => {
      const moduleInfo = MODULE_INFO.find((m) => m.id === moduleId)
      return moduleInfo ? moduleInfo.title : `Módulo ${moduleId}`
    })
  }

  const getActiveStudentsToday = () => {
    return students.filter((s) => {
      const lastLogin = new Date(s.lastLogin)
      const today = new Date()
      return lastLogin.toDateString() === today.toDateString()
    }).length
  }

  const getKinestheticStudents = () => {
    return students.filter((s) => s.hasKinestheticDyslexia || s.dyslexiaType === "kinestesica").length
  }

  const downloadStudentsData = async () => {
    const teacherId = localStorage.getItem("userId")
    if (!teacherId) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/teacher/export-students?teacherId=${teacherId}`)

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `estudiantes_${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        setSuccess("Datos descargados exitosamente")
      } else {
        const data = await response.json()
        setError(data.error || "Error al descargar datos")
      }
    } catch (error) {
      console.error("Error al descargar datos:", error)
      setError("Error de conexión al descargar datos")
    } finally {
      setIsLoading(false)
    }
  }

  const getPerformanceBadgeColor = (performance: string) => {
    switch (performance) {
      case "excelente":
        return "bg-green-100 text-green-800 border-green-200"
      case "bueno":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "regular":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "necesita_apoyo":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case "bajo":
        return "bg-green-100 text-green-800 border-green-200"
      case "medio":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "alto":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const toggleAnalysisExpansion = (studentId: string) => {
    const newExpanded = new Set(expandedAnalyses)
    if (newExpanded.has(studentId)) {
      newExpanded.delete(studentId)
    } else {
      newExpanded.add(studentId)
    }
    setExpandedAnalyses(newExpanded)
  }

  const getStudentAnalysis = (studentId: string) => {
    return studentAnalyses.find((a) => a.studentId === studentId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Brain className="h-8 w-8 text-indigo-600" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Panel de Control Docente
                  </h1>
                  <p className="text-sm text-gray-600">Bienvenido/a, {userName}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => loadStudentAnalyses()}
                disabled={isLoadingAnalyses}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                {isLoadingAnalyses ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Actualizar Análisis
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 bg-transparent"
              >
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">Total Estudiantes</p>
                  <p className="text-3xl font-bold text-blue-700">{students.length}</p>
                  <p className="text-xs text-blue-500 mt-1">Registrados</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-2xl">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">Activos Hoy</p>
                  <p className="text-3xl font-bold text-green-700">{getActiveStudentsToday()}</p>
                  <p className="text-xs text-green-500 mt-1">Conectados</p>
                </div>
                <div className="bg-green-100 p-3 rounded-2xl">
                  <UserCheck className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-1">Dislexia Kinestésica</p>
                  <p className="text-3xl font-bold text-purple-700">{getKinestheticStudents()}</p>
                  <p className="text-xs text-purple-500 mt-1">Estudiantes</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-2xl">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 mb-1">Análisis IA</p>
                  <p className="text-3xl font-bold text-orange-700">{studentAnalyses.length}</p>
                  <p className="text-xs text-orange-500 mt-1">Generados</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-2xl">
                  <Bot className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sección de Gráficas */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-indigo-600" />
            Análisis y Estadísticas Detalladas
          </h2>
          <DashboardCharts students={students} />
        </div>

        {/* Sección de Predicciones IA */}
        <div className="mb-8">
          <PredictionDashboard teacherId={typeof window !== "undefined" ? localStorage.getItem("userId") || "" : ""} />
        </div>

        {/* Mensajes de estado */}
        {error && (
          <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Credenciales del estudiante creado */}
        {createdCredentials && (
          <Card className="mb-6 border-2 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Credenciales del Estudiante
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Usuario:</p>
                    <p className="text-lg font-bold text-gray-900">{createdCredentials.username}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(createdCredentials.username)}
                    className="ml-2"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Contraseña:</p>
                    <p className="text-lg font-bold text-gray-900">{createdCredentials.password}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(createdCredentials.password)}
                    className="ml-2"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-green-700 mt-3">
                💡 Comparte estas credenciales con el estudiante para que pueda acceder a la plataforma
              </p>
            </CardContent>
          </Card>
        )}

        {/* Botones de acción */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            {showCreateForm ? "Cancelar" : "Crear Nuevo Estudiante"}
          </Button>

          <Button
            onClick={downloadStudentsData}
            disabled={isLoading || students.length === 0}
            variant="outline"
            className="bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-green-200 text-green-700 hover:text-green-800"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Descargando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Descargar Datos de Estudiantes
              </>
            )}
          </Button>
        </div>

        {/* Formulario de creación */}
        {showCreateForm && (
          <Card className="mb-8 border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
              <CardTitle className="text-xl text-indigo-900">Crear Nuevo Estudiante</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleCreateStudent} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                      Nombres
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nombres del estudiante"
                      className="border-gray-200 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                      Apellidos
                    </Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Apellidos del estudiante"
                      className="border-gray-200 focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-sm font-medium text-gray-700">
                      Edad
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      min="5"
                      max="18"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      placeholder="Edad del estudiante"
                      className="border-gray-200 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="course" className="text-sm font-medium text-gray-700">
                      Curso
                    </Label>
                    <Input
                      id="course"
                      value={formData.course}
                      onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                      placeholder="Ej: 3ro Primaria, 1ro ESO"
                      className="border-gray-200 focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="dyslexiaLevel" className="text-sm font-medium text-gray-700">
                      Nivel de Dislexia
                    </Label>
                    <Select
                      value={formData.dyslexiaLevel}
                      onValueChange={(value) => setFormData({ ...formData, dyslexiaLevel: value })}
                    >
                      <SelectTrigger className="border-gray-200 focus:border-indigo-500">
                        <SelectValue placeholder="Selecciona el nivel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="leve">Leve</SelectItem>
                        <SelectItem value="moderado">Moderado</SelectItem>
                        <SelectItem value="severo">Severo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dyslexiaType" className="text-sm font-medium text-gray-700">
                      Tipo de Dislexia
                    </Label>
                    <Select
                      value={formData.dyslexiaType}
                      onValueChange={(value) => setFormData({ ...formData, dyslexiaType: value })}
                    >
                      <SelectTrigger className="border-gray-200 focus:border-indigo-500">
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fonologica">Fonológica</SelectItem>
                        <SelectItem value="superficial">Superficial</SelectItem>
                        <SelectItem value="mixta">Mixta</SelectItem>
                        <SelectItem value="kinestesica">Kinestésica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Checkbox para dislexia kinestésica adicional */}
                {formData.dyslexiaType && formData.dyslexiaType !== "kinestesica" && (
                  <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <Checkbox
                      id="hasKinestheticDyslexia"
                      checked={formData.hasKinestheticDyslexia}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasKinestheticDyslexia: !!checked })}
                    />
                    <Label htmlFor="hasKinestheticDyslexia" className="text-sm text-purple-800">
                      ¿También presenta dislexia kinestésica? (Se añadirán módulos de movimiento y coordinación)
                    </Label>
                  </div>
                )}

                {/* Vista previa de módulos asignados */}
                {formData.dyslexiaLevel && formData.dyslexiaType && (
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-3">Módulos que se asignarán:</h4>
                    <div className="flex flex-wrap gap-2">
                      {getAssignedModules(
                        formData.dyslexiaLevel,
                        formData.dyslexiaType,
                        formData.hasKinestheticDyslexia,
                      ).map((moduleName, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                        >
                          {moduleName}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-4 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      "Crear Estudiante"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Lista de estudiantes con análisis IA */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b">
            <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Mis Estudiantes con Análisis IA ({students.length})
              {isLoadingAnalyses && <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {isLoadingStudents ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                <span className="ml-2 text-gray-600">Cargando estudiantes...</span>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-xl font-medium mb-2">No tienes estudiantes registrados</p>
                <p className="text-gray-400">Crea tu primer estudiante para comenzar</p>
              </div>
            ) : (
              <div className="space-y-6">
                {students.map((student) => {
                  const analysis = getStudentAnalysis(student._id!.toString())
                  const isExpanded = expandedAnalyses.has(student._id!.toString())

                  return (
                    <div
                      key={student._id?.toString()}
                      className="border border-gray-200 rounded-xl bg-white hover:shadow-lg transition-all duration-200"
                    >
                      {/* Información básica del estudiante */}
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {student.name} {student.lastName}
                              </h3>
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                @{student.username}
                              </span>
                              {analysis && (
                                <>
                                  <Badge className={getPerformanceBadgeColor(analysis.observation.overallPerformance)}>
                                    {analysis.observation.overallPerformance.replace("_", " ")}
                                  </Badge>
                                  <Badge className={getRiskBadgeColor(analysis.observation.riskLevel)}>
                                    Riesgo {analysis.observation.riskLevel}
                                  </Badge>
                                </>
                              )}
                            </div>

                            <div className="text-sm text-gray-600 space-y-2">
                              <div className="flex items-center gap-4">
                                <span>Edad: {student.age} años</span>
                                <span>Curso: {student.course}</span>
                                {analysis && (
                                  <>
                                    <span>Progreso: {analysis.metrics.totalProgress}%</span>
                                    <span>Precisión: {analysis.metrics.totalAccuracy}%</span>
                                  </>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                <span>
                                  Dislexia: {student.dyslexiaLevel} - {student.dyslexiaType}
                                </span>
                                {student.hasKinestheticDyslexia && student.dyslexiaType !== "kinestesica" && (
                                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                                    + Kinestésica
                                  </span>
                                )}
                              </div>

                              <p className="text-gray-500">
                                Último acceso: {new Date(student.lastLogin).toLocaleDateString()}
                              </p>
                            </div>

                            {/* Análisis IA resumido */}
                            {analysis && (
                              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                                <div className="flex items-start gap-3">
                                  <Bot className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    <h4 className="font-medium text-indigo-900 mb-2">Análisis IA</h4>
                                    <p className="text-sm text-indigo-800 mb-3">
                                      {analysis.observation.detailedAnalysis.substring(0, 200)}...
                                    </p>

                                    {/* Fortalezas y debilidades resumidas */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {analysis.observation.strengths.length > 0 && (
                                        <div>
                                          <div className="flex items-center gap-1 mb-1">
                                            <ThumbsUp className="h-3 w-3 text-green-600" />
                                            <span className="text-xs font-medium text-green-700">Fortalezas</span>
                                          </div>
                                          <div className="flex flex-wrap gap-1">
                                            {analysis.observation.strengths.slice(0, 2).map((strength, idx) => (
                                              <span
                                                key={idx}
                                                className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs"
                                              >
                                                {strength.length > 30 ? strength.substring(0, 30) + "..." : strength}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {analysis.observation.weaknesses.length > 0 && (
                                        <div>
                                          <div className="flex items-center gap-1 mb-1">
                                            <AlertTriangle className="h-3 w-3 text-orange-600" />
                                            <span className="text-xs font-medium text-orange-700">Áreas de mejora</span>
                                          </div>
                                          <div className="flex flex-wrap gap-1">
                                            {analysis.observation.weaknesses.slice(0, 2).map((weakness, idx) => (
                                              <span
                                                key={idx}
                                                className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs"
                                              >
                                                {weakness.length > 30 ? weakness.substring(0, 30) + "..." : weakness}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-2">
                            <Button
                              onClick={() => viewStudentProgress(student._id!.toString())}
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200"
                            >
                              <Eye className="h-4 w-4" />
                              Ver Progreso
                            </Button>

                            {analysis && (
                              <Button
                                onClick={() => toggleAnalysisExpansion(student._id!.toString())}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                              >
                                <Bot className="h-4 w-4" />
                                {isExpanded ? "Ocultar" : "Ver"} Análisis
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Análisis detallado expandible */}
                      {analysis && (
                        <Collapsible
                          open={isExpanded}
                          onOpenChange={() => toggleAnalysisExpansion(student._id!.toString())}
                        >
                          <CollapsibleContent>
                            <div className="px-6 pb-6 border-t border-gray-100">
                              <div className="pt-6 space-y-6">
                                {/* Análisis completo */}
                                <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-4 rounded-lg">
                                  <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                                    <Brain className="h-4 w-4" />
                                    Análisis Detallado
                                  </h4>
                                  <p className="text-sm text-slate-700 leading-relaxed">
                                    {analysis.observation.detailedAnalysis}
                                  </p>
                                </div>

                                {/* Fortalezas */}
                                {analysis.observation.strengths.length > 0 && (
                                  <div>
                                    <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                                      <ThumbsUp className="h-4 w-4" />
                                      Fortalezas Identificadas
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                      {analysis.observation.strengths.map((strength, idx) => (
                                        <div
                                          key={idx}
                                          className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-200"
                                        >
                                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                          <span className="text-sm text-green-800">{strength}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Debilidades */}
                                {analysis.observation.weaknesses.length > 0 && (
                                  <div>
                                    <h4 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                                      <AlertTriangle className="h-4 w-4" />
                                      Áreas de Mejora
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                      {analysis.observation.weaknesses.map((weakness, idx) => (
                                        <div
                                          key={idx}
                                          className="flex items-start gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200"
                                        >
                                          <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                                          <span className="text-sm text-orange-800">{weakness}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Recomendaciones */}
                                {analysis.observation.recommendations.length > 0 && (
                                  <div>
                                    <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                                      <Target className="h-4 w-4" />
                                      Recomendaciones Personalizadas
                                    </h4>
                                    <div className="space-y-2">
                                      {analysis.observation.recommendations.map((recommendation, idx) => (
                                        <div
                                          key={idx}
                                          className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200"
                                        >
                                          <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                          <span className="text-sm text-blue-800">{recommendation}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Métricas adicionales */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <p className="text-2xl font-bold text-gray-800">
                                      {analysis.metrics.modulesCompleted}
                                    </p>
                                    <p className="text-xs text-gray-600">Niveles Completados</p>
                                  </div>
                                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <p className="text-2xl font-bold text-gray-800">{analysis.metrics.totalAttempts}</p>
                                    <p className="text-xs text-gray-600">Intentos Totales</p>
                                  </div>
                                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-600 mb-1">Motivación</p>
                                    <p className="text-sm font-medium text-gray-800 capitalize">
                                      {analysis.observation.motivationLevel}
                                    </p>
                                  </div>
                                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-600 mb-1">Última Actividad</p>
                                    <p className="text-sm font-medium text-gray-800">
                                      {new Date(analysis.metrics.lastActivity).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      )}

                      {/* Módulos asignados */}
                      <div className="px-6 pb-4">
                        <div className="flex flex-wrap gap-1">
                          {getAssignedModules(
                            student.dyslexiaLevel || "leve",
                            student.dyslexiaType || "fonologica",
                            student.hasKinestheticDyslexia || false,
                          ).map((moduleName, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              {moduleName}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
