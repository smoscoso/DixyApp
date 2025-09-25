"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
  Search,
  Filter,
  MoreVertical,
  Settings,
  BookOpen,
  Award,
  Activity,
  TrendingDown,
  Minus,
} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
  const [filteredStudents, setFilteredStudents] = useState<User[]>([])
  const [studentAnalyses, setStudentAnalyses] = useState<StudentAnalysis[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBy, setFilterBy] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [currentPage, setCurrentPage] = useState(1)
  const [studentsPerPage] = useState(6)
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
  const [userId, setUserId] = useState("")
  const [createdCredentials, setCreatedCredentials] = useState<{ username: string; password: string } | null>(null)
  const [expandedAnalyses, setExpandedAnalyses] = useState<Set<string>>(new Set())
  const [studentPredictions, setStudentPredictions] = useState<any[]>([])
  const [isLoadingPredictions, setIsLoadingPredictions] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const userIdFromStorage = localStorage.getItem("userId")
    const userRole = localStorage.getItem("userRole")
    const name = localStorage.getItem("userName")

    if (!userIdFromStorage || userRole !== "teacher") {
      router.push("/auth/login")
      return
    }

    setUserId(userIdFromStorage)
    setUserName(name || "")
    loadStudents()
  }, [router])

  // Filtrar y ordenar estudiantes
  useEffect(() => {
    let filtered = [...students]

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.course?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filtrar por categoría
    if (filterBy !== "all") {
      filtered = filtered.filter((student) => {
        const analysis = getStudentAnalysis(student._id!.toString())
        const prediction = getStudentPrediction(student._id!.toString())
        switch (filterBy) {
          case "high-risk":
            return (
              analysis?.observation.riskLevel === "alto" ||
              (prediction && prediction.prediction.shortTerm.riskOfDropout > 70)
            )
          case "excellent":
            return (
              analysis?.observation.overallPerformance === "excelente" ||
              (prediction && prediction.prediction.longTerm.overallSuccessProbability > 80)
            )
          case "needs-support":
            return (
              analysis?.observation.overallPerformance === "necesita_apoyo" ||
              (prediction && prediction.prediction.mediumTerm.interventionNeeded)
            )
          case "kinesthetic":
            return student.hasKinestheticDyslexia || student.dyslexiaType === "kinestesica"
          default:
            return true
        }
      })
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return `${a.name} ${a.lastName}`.localeCompare(`${b.name} ${b.lastName}`)
        case "progress":
          const progressA = getStudentAnalysis(a._id!.toString())?.metrics.totalProgress || 0
          const progressB = getStudentAnalysis(b._id!.toString())?.metrics.totalProgress || 0
          return progressB - progressA
        case "lastActivity":
          return new Date(b.lastLogin).getTime() - new Date(a.lastLogin).getTime()
        case "risk":
          const predictionA = getStudentPrediction(a._id!.toString())
          const predictionB = getStudentPrediction(b._id!.toString())
          const riskA = predictionA?.prediction.shortTerm.riskOfDropout || 0
          const riskB = predictionB?.prediction.shortTerm.riskOfDropout || 0
          return riskB - riskA
        default:
          return 0
      }
    })

    setFilteredStudents(filtered)
    setCurrentPage(1)
  }, [students, searchTerm, filterBy, sortBy, studentAnalyses, studentPredictions])

  const loadStudents = async () => {
    const userIdFromStorage = localStorage.getItem("userId")
    if (!userIdFromStorage) return

    setIsLoadingStudents(true)
    try {
      const response = await fetch(`/api/teacher/students?teacherId=${userIdFromStorage}`)
      const data = await response.json()

      if (response.ok) {
        setStudents(data.students || [])
        if (data.students && data.students.length > 0) {
          loadStudentAnalyses(userIdFromStorage)
          loadStudentPredictions()
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
    const userIdFromStorage = teacherId || localStorage.getItem("userId")
    if (!userIdFromStorage) return

    setIsLoadingAnalyses(true)
    try {
      const response = await fetch(`/api/teacher/student-analysis?teacherId=${userIdFromStorage}`)
      const data = await response.json()

      if (response.ok) {
        setStudentAnalyses(data.analyses || [])
      } else {
        console.error("Error al cargar análisis:", data.error)
      }
    } catch (error) {
      console.error("Error al cargar análisis:", error)
    } finally {
      setIsLoadingAnalyses(false)
    }
  }

  const loadStudentPredictions = async () => {
    const userIdFromStorage = localStorage.getItem("userId")
    if (!userIdFromStorage) return

    setIsLoadingPredictions(true)
    try {
      const response = await fetch(`/api/teacher/student-predictions?teacherId=${userIdFromStorage}`)
      const data = await response.json()

      if (response.ok) {
        setStudentPredictions(data.predictions || [])
      } else {
        console.error("Error al cargar predicciones:", data.error)
      }
    } catch (error) {
      console.error("Error al cargar predicciones:", error)
    } finally {
      setIsLoadingPredictions(false)
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
    setSuccess("¡Copiado al portapapeles!")
    setTimeout(() => setSuccess(""), 2000)
  }

  const handleLogout = () => {
    localStorage.clear()
    router.push("/")
  }

  const viewStudentProgress = (studentId: string) => {
    router.push(`/teacher/student-progress?id=${studentId}`)
  }

  const viewStudentAIAnalysis = (studentId: string) => {
    router.push(`/teacher/student-ai-analysis?id=${studentId}`)
  }

  const getAssignedModules = (dyslexiaLevel: string, dyslexiaType: string, hasKinestheticDyslexia: boolean) => {
    const configKey = `${dyslexiaLevel}-${dyslexiaType}`
    const config = DYSLEXIA_CONFIGS[configKey]

    if (!config) return []

    let modules = [...config.assignedModules]

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

  const getHighRiskStudents = () => {
    return studentPredictions.filter((p) => p.prediction.shortTerm.riskOfDropout > 70).length
  }

  const getAverageProgress = () => {
    if (studentAnalyses.length === 0) return 0
    const totalProgress = studentAnalyses.reduce((sum, a) => sum + a.metrics.totalProgress, 0)
    return Math.round(totalProgress / studentAnalyses.length)
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

  const getStudentPrediction = (studentId: string) => {
    return studentPredictions.find((p) => p.studentId === studentId)
  }

  // Paginación
  const indexOfLastStudent = currentPage * studentsPerPage
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent)
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header Profesional */}
      <header className="bg-white/95 backdrop-blur-md shadow-lg border-b sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                    <Brain className="h-7 w-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
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
                onClick={() => {
                  loadStudentAnalyses()
                  loadStudentPredictions()
                }}
                disabled={isLoadingAnalyses || isLoadingPredictions}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 hover:bg-indigo-50"
              >
                {isLoadingAnalyses || isLoadingPredictions ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Actualizar
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

      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 lg:w-[600px] mx-auto">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Resumen
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Estudiantes
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Crear
            </TabsTrigger>
          </TabsList>

          {/* Tab de Resumen */}
          <TabsContent value="overview" className="space-y-8">
            {/* Estadísticas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-xl transition-shadow">
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

              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-shadow">
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

              <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50 hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-600 mb-1">Alto Riesgo</p>
                      <p className="text-3xl font-bold text-red-700">{getHighRiskStudents()}</p>
                      <p className="text-xs text-red-500 mt-1">Requieren atención</p>
                    </div>
                    <div className="bg-red-100 p-3 rounded-2xl">
                      <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600 mb-1">Progreso Promedio</p>
                      <p className="text-3xl font-bold text-purple-700">{getAverageProgress()}%</p>
                      <p className="text-xs text-purple-500 mt-1">Completado</p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-2xl">
                      <Award className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráficas */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-indigo-600" />
                  Análisis y Estadísticas Detalladas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DashboardCharts students={students} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Estudiantes */}
          <TabsContent value="students" className="space-y-6">
            {/* Controles de filtrado y búsqueda */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Buscar estudiantes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={filterBy} onValueChange={setFilterBy}>
                      <SelectTrigger className="w-[200px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filtrar por..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="high-risk">Alto riesgo</SelectItem>
                        <SelectItem value="excellent">Excelente</SelectItem>
                        <SelectItem value="needs-support">Necesita apoyo</SelectItem>
                        <SelectItem value="kinesthetic">Kinestésica</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Ordenar por..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Nombre</SelectItem>
                        <SelectItem value="progress">Progreso</SelectItem>
                        <SelectItem value="lastActivity">Última actividad</SelectItem>
                        <SelectItem value="risk">Nivel de riesgo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={downloadStudentsData}
                      disabled={isLoading || students.length === 0}
                      variant="outline"
                      className="flex items-center gap-2 bg-transparent"
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                      Exportar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de estudiantes */}
            {isLoadingStudents ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                <span className="ml-2 text-gray-600">Cargando estudiantes...</span>
              </div>
            ) : currentStudents.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="text-center py-12">
                  <Users className="h-16 w-16 mx-auto mb-4 opacity-50 text-gray-400" />
                  <p className="text-xl font-medium mb-2 text-gray-600">
                    {filteredStudents.length === 0 && students.length > 0
                      ? "No se encontraron estudiantes con los filtros aplicados"
                      : "No tienes estudiantes registrados"}
                  </p>
                  <p className="text-gray-400">
                    {filteredStudents.length === 0 && students.length > 0
                      ? "Intenta cambiar los filtros de búsqueda"
                      : "Crea tu primer estudiante para comenzar"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {currentStudents.map((student) => {
                    const analysis = getStudentAnalysis(student._id!.toString())
                    const prediction = getStudentPrediction(student._id!.toString())
                    const isExpanded = expandedAnalyses.has(student._id!.toString())

                    return (
                      <Card
                        key={student._id?.toString()}
                        className="border-0 shadow-lg hover:shadow-xl transition-all duration-200 bg-white"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-12 w-12">
                                <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold">
                                  {student.name.charAt(0)}
                                  {student.lastName?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {student.name} {student.lastName}
                                </h3>
                                <p className="text-sm text-gray-500">@{student.username}</p>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => viewStudentProgress(student._id!.toString())}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Ver progreso
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Settings className="h-4 w-4 mr-2" />
                                  Configurar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <div className="space-y-3 mb-4">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Edad:</span>
                              <span className="font-medium">{student.age} años</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Curso:</span>
                              <span className="font-medium">{student.course}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Dislexia:</span>
                              <div className="flex gap-1">
                                <Badge variant="outline" className="text-xs">
                                  {student.dyslexiaLevel}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {student.dyslexiaType}
                                </Badge>
                                {student.hasKinestheticDyslexia && student.dyslexiaType !== "kinestesica" && (
                                  <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                                    + Kinestésica
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          {analysis && (
                            <div className="space-y-3 mb-4">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Rendimiento:</span>
                                <Badge className={getPerformanceBadgeColor(analysis.observation.overallPerformance)}>
                                  {analysis.observation.overallPerformance.replace("_", " ")}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Riesgo:</span>
                                <Badge className={getRiskBadgeColor(analysis.observation.riskLevel)}>
                                  {analysis.observation.riskLevel}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Progreso:</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-20 bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${analysis.metrics.totalProgress}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-medium">{analysis.metrics.totalProgress}%</span>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-4 border-t">
                            <div className="text-xs text-gray-500">
                              Último acceso: {new Date(student.lastLogin).toLocaleDateString()}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => viewStudentProgress(student._id!.toString())}
                                className="flex items-center gap-1"
                              >
                                <Eye className="h-3 w-3" />
                                Ver
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => viewStudentAIAnalysis(student._id!.toString())}
                                className="flex items-center gap-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                              >
                                <Brain className="h-3 w-3" />
                                Análisis IA
                              </Button>
                              {analysis && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => toggleAnalysisExpansion(student._id!.toString())}
                                  className="flex items-center gap-1"
                                >
                                  <Bot className="h-3 w-3" />
                                  {isExpanded ? "Ocultar" : "IA"}
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Análisis expandido */}
                          {analysis && isExpanded && (
                            <Collapsible open={isExpanded}>
                              <CollapsibleContent>
                                <div className="mt-4 pt-4 border-t space-y-4">
                                  <div className="bg-blue-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                                      <Brain className="h-4 w-4" />
                                      Análisis IA
                                    </h4>
                                    <p className="text-sm text-blue-800 leading-relaxed">
                                      {analysis.observation.detailedAnalysis}
                                    </p>
                                  </div>

                                  {analysis.observation.strengths.length > 0 && (
                                    <div>
                                      <h5 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                                        <ThumbsUp className="h-4 w-4" />
                                        Fortalezas
                                      </h5>
                                      <div className="space-y-1">
                                        {analysis.observation.strengths.slice(0, 2).map((strength, idx) => (
                                          <div key={idx} className="text-sm text-green-700 bg-green-50 p-2 rounded">
                                            • {strength}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {analysis.observation.recommendations.length > 0 && (
                                    <div>
                                      <h5 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                                        <Target className="h-4 w-4" />
                                        Recomendaciones
                                      </h5>
                                      <div className="space-y-1">
                                        {analysis.observation.recommendations.slice(0, 2).map((rec, idx) => (
                                          <div key={idx} className="text-sm text-blue-700 bg-blue-50 p-2 rounded">
                                            • {rec}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          )}

                          {/* Sección de Predicciones IA */}
                          {prediction && (
                            <div className="mt-4 pt-4 border-t">
                              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200">
                                <h4 className="font-medium text-purple-900 mb-3 flex items-center gap-2">
                                  <Brain className="h-4 w-4" />
                                  Predicciones IA
                                </h4>

                                <div className="grid grid-cols-2 gap-3 mb-3">
                                  <div className="bg-white p-3 rounded-lg">
                                    <p className="text-xs text-gray-600 mb-1">Riesgo de Abandono</p>
                                    <div className="flex items-center gap-2">
                                      <div
                                        className={`w-3 h-3 rounded-full ${
                                          prediction.prediction.shortTerm.riskOfDropout > 70
                                            ? "bg-red-500"
                                            : prediction.prediction.shortTerm.riskOfDropout > 40
                                              ? "bg-yellow-500"
                                              : "bg-green-500"
                                        }`}
                                      ></div>
                                      <span className="text-sm font-bold">
                                        {prediction.prediction.shortTerm.riskOfDropout}%
                                      </span>
                                    </div>
                                  </div>

                                  <div className="bg-white p-3 rounded-lg">
                                    <p className="text-xs text-gray-600 mb-1">Éxito Proyectado</p>
                                    <div className="flex items-center gap-2">
                                      <div
                                        className={`w-3 h-3 rounded-full ${
                                          prediction.prediction.longTerm.overallSuccessProbability > 70
                                            ? "bg-green-500"
                                            : prediction.prediction.longTerm.overallSuccessProbability > 40
                                              ? "bg-yellow-500"
                                              : "bg-red-500"
                                        }`}
                                      ></div>
                                      <span className="text-sm font-bold">
                                        {prediction.prediction.longTerm.overallSuccessProbability}%
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-white p-3 rounded-lg mb-3">
                                  <p className="text-xs text-gray-600 mb-2">Trayectoria General</p>
                                  <div className="flex items-center gap-2">
                                    {prediction.prediction.trends.overallTrajectory === "positiva" && (
                                      <>
                                        <TrendingUp className="h-4 w-4 text-green-600" />
                                        <span className="text-sm font-medium text-green-700">Positiva</span>
                                      </>
                                    )}
                                    {prediction.prediction.trends.overallTrajectory === "preocupante" && (
                                      <>
                                        <TrendingDown className="h-4 w-4 text-red-600" />
                                        <span className="text-sm font-medium text-red-700">Preocupante</span>
                                      </>
                                    )}
                                    {prediction.prediction.trends.overallTrajectory === "neutral" && (
                                      <>
                                        <Minus className="h-4 w-4 text-yellow-600" />
                                        <span className="text-sm font-medium text-yellow-700">Neutral</span>
                                      </>
                                    )}
                                  </div>
                                </div>

                                {prediction.prediction.mediumTerm.interventionNeeded && (
                                  <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg mb-3">
                                    <div className="flex items-center gap-2 mb-2">
                                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                                      <span className="text-sm font-medium text-orange-800">
                                        Intervención Requerida
                                      </span>
                                    </div>
                                    <p className="text-xs text-orange-700">
                                      Se recomienda implementar estrategias de apoyo personalizadas en las próximas 2
                                      semanas.
                                    </p>
                                  </div>
                                )}

                                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                                  <p className="text-xs text-blue-800 mb-2">
                                    <strong>Proceso Recomendado:</strong>
                                  </p>
                                  <div className="space-y-1">
                                    {prediction.prediction.trends.progressTrend === "empeorando" && (
                                      <p className="text-xs text-blue-700">• Revisar metodología de enseñanza actual</p>
                                    )}
                                    {prediction.prediction.shortTerm.riskOfDropout > 50 && (
                                      <p className="text-xs text-blue-700">
                                        • Implementar sesiones de motivación adicionales
                                      </p>
                                    )}
                                    {prediction.prediction.mediumTerm.interventionNeeded && (
                                      <p className="text-xs text-blue-700">
                                        • Aplicar intervenciones personalizadas inmediatamente
                                      </p>
                                    )}
                                    <p className="text-xs text-blue-700">• Monitorear progreso semanalmente</p>
                                    <p className="text-xs text-blue-700">• Ajustar dificultad según rendimiento</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => paginate(page)}
                        className="w-10"
                      >
                        {page}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Siguiente
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Tab de Crear Estudiante */}
          <TabsContent value="create" className="space-y-6">
            {/* Mensajes de estado */}
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            {/* Credenciales del estudiante creado */}
            {createdCredentials && (
              <Card className="border-2 border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-800 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Credenciales del Estudiante
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Usuario:</p>
                        <p className="text-lg font-bold text-gray-900">{createdCredentials.username}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => copyToClipboard(createdCredentials.username)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Contraseña:</p>
                        <p className="text-lg font-bold text-gray-900">{createdCredentials.password}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => copyToClipboard(createdCredentials.password)}>
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

            {/* Formulario de creación */}
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
                <CardTitle className="text-xl text-indigo-900 flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Crear Nuevo Estudiante
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleCreateStudent} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                        Nombres *
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
                        Apellidos *
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
                        Edad *
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
                        Curso *
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
                        Nivel de Dislexia *
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
                        Tipo de Dislexia *
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
                      <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Módulos que se asignarán:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {getAssignedModules(
                          formData.dyslexiaLevel,
                          formData.dyslexiaType,
                          formData.hasKinestheticDyslexia,
                        ).map((moduleName, index) => (
                          <Badge key={index} variant="outline" className="bg-blue-100 text-blue-800">
                            {moduleName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-4 pt-6 border-t">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-8"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creando...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Crear Estudiante
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
