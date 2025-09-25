"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Loader2,
  ArrowLeft,
  BarChart3,
  Lightbulb,
  Calendar,
  Activity,
  Zap,
  Shield,
  Heart,
  Star,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
} from "lucide-react"

interface PredictionData {
  studentId: string
  studentName: string
  username: string
  prediction: {
    shortTerm: {
      expectedProgress: number
      expectedAccuracy: number
      riskOfDropout: number
      motivationForecast: "creciente" | "estable" | "decreciente"
      optimalSessionLength: number
      recommendedFrequency: number
      timeframe: string
    }
    mediumTerm: {
      modulesToComplete: number[]
      estimatedCompletionTime: number
      interventionNeeded: boolean
      difficultyAdjustments: {
        moduleId: number
        recommendedLevel: "reducir" | "mantener" | "aumentar"
      }[]
      learningPathOptimization: string[]
      timeframe: string
    }
    longTerm: {
      overallSuccessProbability: number
      recommendedInterventions: string[]
      projectedOutcome: string
      skillMastery: {
        reading: number
        writing: number
        comprehension: number
        phonological: number
      }
      adaptiveStrategies: string[]
      timeframe: string
    }
    trends: {
      progressTrend: "mejorando" | "estable" | "empeorando"
      accuracyTrend: "mejorando" | "estable" | "empeorando"
      engagementTrend: "alta" | "media" | "baja"
      learningEfficiencyTrend: "mejorando" | "estable" | "empeorando"
      overallTrajectory: "positiva" | "neutral" | "preocupante"
    }
    confidence: number
  }
  lastUpdated: string
}

function StudentAIAnalysisContent() {
  const [prediction, setPrediction] = useState<PredictionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const studentId = searchParams.get("id")

  useEffect(() => {
    if (studentId) {
      loadStudentPrediction()
    }
  }, [studentId])

  const loadStudentPrediction = async () => {
    const teacherId = localStorage.getItem("userId")
    if (!teacherId || !studentId) {
      setError("Información de sesión no válida")
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError("")

    try {
      console.log("Loading prediction for student:", studentId)
      const response = await fetch(`/api/teacher/student-predictions?teacherId=${teacherId}`)
      const data = await response.json()

      console.log("API Response:", data)

      if (response.ok) {
        const studentPrediction = data.predictions?.find((p: PredictionData) => p.studentId === studentId)
        console.log("Found prediction:", studentPrediction)

        if (studentPrediction) {
          setPrediction(studentPrediction)
        } else {
          setError("No se encontraron predicciones para este estudiante")
        }
      } else {
        setError(data.error || "Error al cargar predicciones")
      }
    } catch (err) {
      console.error("Error cargando predicción:", err)
      setError("Error de conexión al cargar predicciones")
    } finally {
      setIsLoading(false)
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "mejorando":
        return <TrendingUp className="h-5 w-5 text-green-600" />
      case "empeorando":
        return <TrendingDown className="h-5 w-5 text-red-600" />
      default:
        return <Minus className="h-5 w-5 text-yellow-600" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "mejorando":
        return "text-green-600 bg-green-50 border-green-200"
      case "empeorando":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
    }
  }

  const getRiskLevel = (risk: number) => {
    if (risk > 70) return { level: "Alto", color: "text-red-600 bg-red-50 border-red-200", icon: AlertTriangle }
    if (risk > 40) return { level: "Medio", color: "text-yellow-600 bg-yellow-50 border-yellow-200", icon: Clock }
    return { level: "Bajo", color: "text-green-600 bg-green-50 border-green-200", icon: CheckCircle }
  }

  const getSuccessLevel = (success: number) => {
    if (success > 80) return { level: "Excelente", color: "text-green-600 bg-green-50 border-green-200", icon: Star }
    if (success > 60) return { level: "Bueno", color: "text-blue-600 bg-blue-50 border-blue-200", icon: ThumbsUp }
    if (success > 40) return { level: "Regular", color: "text-yellow-600 bg-yellow-50 border-yellow-200", icon: Clock }
    return { level: "Preocupante", color: "text-red-600 bg-red-50 border-red-200", icon: ThumbsDown }
  }

  const getEngagementColor = (engagement: string) => {
    switch (engagement) {
      case "alta":
        return "text-green-600 bg-green-50 border-green-200"
      case "baja":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Analizando Datos del Estudiante</h2>
              <p className="text-gray-600">La IA está procesando el historial de aprendizaje...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !prediction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-6 py-8">
          <Button onClick={() => router.back()} variant="outline" className="mb-6 flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error || "No se pudo cargar la información del estudiante"}</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={loadStudentPrediction} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const riskInfo = getRiskLevel(prediction.prediction.shortTerm.riskOfDropout)
  const successInfo = getSuccessLevel(prediction.prediction.longTerm.overallSuccessProbability)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button onClick={() => router.back()} variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Análisis IA Completo
              </h1>
              <p className="text-gray-600 mt-1">
                {prediction.studentName} (@{prediction.username})
              </p>
            </div>
          </div>
          <Button
            onClick={loadStudentPrediction}
            disabled={isLoading}
            variant="outline"
            className="flex items-center gap-2 bg-transparent"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Actualizar
          </Button>
        </div>

        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className={`border-2 ${riskInfo.color}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium mb-1">Riesgo de Abandono</p>
                  <p className="text-3xl font-bold">{prediction.prediction.shortTerm.riskOfDropout}%</p>
                  <p className="text-xs mt-1">{riskInfo.level}</p>
                </div>
                <riskInfo.icon className="h-8 w-8" />
              </div>
            </CardContent>
          </Card>

          <Card className={`border-2 ${successInfo.color}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium mb-1">Probabilidad de Éxito</p>
                  <p className="text-3xl font-bold">{prediction.prediction.longTerm.overallSuccessProbability}%</p>
                  <p className="text-xs mt-1">{successInfo.level}</p>
                </div>
                <successInfo.icon className="h-8 w-8" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">Progreso Esperado</p>
                  <p className="text-3xl font-bold text-blue-700">
                    {prediction.prediction.shortTerm.expectedProgress}%
                  </p>
                  <p className="text-xs text-blue-500 mt-1">Próximas 2 semanas</p>
                </div>
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 bg-purple-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-1">Confianza IA</p>
                  <p className="text-3xl font-bold text-purple-700">{prediction.prediction.confidence}%</p>
                  <p className="text-xs text-purple-500 mt-1">Precisión del análisis</p>
                </div>
                <Brain className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="predictions">Predicciones</TabsTrigger>
            <TabsTrigger value="trends">Tendencias</TabsTrigger>
            <TabsTrigger value="interventions">Intervenciones</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Trayectoria general */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-indigo-600" />
                  Trayectoria General del Estudiante
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div
                    className={`p-4 rounded-lg border-2 ${getTrendColor(prediction.prediction.trends.progressTrend)}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {getTrendIcon(prediction.prediction.trends.progressTrend)}
                      <h3 className="font-semibold">Progreso</h3>
                    </div>
                    <p className="text-sm capitalize">{prediction.prediction.trends.progressTrend}</p>
                  </div>

                  <div
                    className={`p-4 rounded-lg border-2 ${getTrendColor(prediction.prediction.trends.accuracyTrend)}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {getTrendIcon(prediction.prediction.trends.accuracyTrend)}
                      <h3 className="font-semibold">Precisión</h3>
                    </div>
                    <p className="text-sm capitalize">{prediction.prediction.trends.accuracyTrend}</p>
                  </div>

                  <div
                    className={`p-4 rounded-lg border-2 ${getEngagementColor(prediction.prediction.trends.engagementTrend)}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Heart className="h-5 w-5" />
                      <h3 className="font-semibold">Compromiso</h3>
                    </div>
                    <p className="text-sm capitalize">{prediction.prediction.trends.engagementTrend}</p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                  <h4 className="font-semibold text-indigo-900 mb-2">Resultado Proyectado</h4>
                  <p className="text-indigo-800">{prediction.prediction.longTerm.projectedOutcome}</p>
                </div>
              </CardContent>
            </Card>

            {/* Proceso recomendado */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-6 w-6 text-yellow-600" />
                  Proceso de Seguimiento Recomendado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">Evaluación Inmediata (Esta semana)</h4>
                      <p className="text-blue-800 text-sm">
                        Revisar el rendimiento actual en los módulos activos y identificar áreas de dificultad
                        específicas.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-900 mb-1">Implementación de Estrategias (Semanas 2-3)</h4>
                      <p className="text-green-800 text-sm">
                        Aplicar las intervenciones recomendadas por la IA y ajustar la metodología según el tipo de
                        dislexia.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-purple-900 mb-1">Monitoreo Continuo (Mensual)</h4>
                      <p className="text-purple-800 text-sm">
                        Evaluar el progreso mensualmente y ajustar las predicciones basándose en los nuevos datos
                        recopilados.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold text-orange-900 mb-1">Evaluación Trimestral</h4>
                      <p className="text-orange-800 text-sm">
                        Realizar una evaluación completa del progreso y actualizar el plan de aprendizaje personalizado.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Predicciones a corto plazo */}
              <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <Clock className="h-5 w-5" />
                    Corto Plazo
                  </CardTitle>
                  <p className="text-sm text-blue-700">{prediction.prediction.shortTerm.timeframe}</p>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Progreso Esperado</p>
                    <Progress value={prediction.prediction.shortTerm.expectedProgress} className="h-3" />
                    <p className="text-right text-sm font-medium mt-1">
                      {prediction.prediction.shortTerm.expectedProgress}%
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Precisión Esperada</p>
                    <Progress value={prediction.prediction.shortTerm.expectedAccuracy} className="h-3" />
                    <p className="text-right text-sm font-medium mt-1">
                      {prediction.prediction.shortTerm.expectedAccuracy}%
                    </p>
                  </div>

                  <div
                    className={`p-3 rounded-lg ${getRiskLevel(prediction.prediction.shortTerm.riskOfDropout).color}`}
                  >
                    <p className="text-sm font-medium mb-1">Riesgo de Abandono</p>
                    <p className="text-lg font-bold">{prediction.prediction.shortTerm.riskOfDropout}%</p>
                  </div>
                </CardContent>
              </Card>

              {/* Predicciones a mediano plazo */}
              <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardTitle className="flex items-center gap-2 text-green-900">
                    <Calendar className="h-5 w-5" />
                    Mediano Plazo
                  </CardTitle>
                  <p className="text-sm text-green-700">{prediction.prediction.mediumTerm.timeframe}</p>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Tiempo de Finalización</p>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">
                        {prediction.prediction.mediumTerm.estimatedCompletionTime} semanas
                      </span>
                    </div>
                  </div>

                  {prediction.prediction.mediumTerm.modulesToComplete.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Módulos a Completar</p>
                      <div className="flex flex-wrap gap-1">
                        {prediction.prediction.mediumTerm.modulesToComplete.map((moduleId) => (
                          <Badge key={moduleId} variant="outline" className="text-xs">
                            Módulo {moduleId}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {prediction.prediction.mediumTerm.interventionNeeded && (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-800">Intervención Necesaria</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Predicciones a largo plazo */}
              <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                  <CardTitle className="flex items-center gap-2 text-purple-900">
                    <Target className="h-5 w-5" />
                    Largo Plazo
                  </CardTitle>
                  <p className="text-sm text-purple-700">{prediction.prediction.longTerm.timeframe}</p>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Probabilidad de Éxito</p>
                    <Progress value={prediction.prediction.longTerm.overallSuccessProbability} className="h-3" />
                    <p className="text-right text-sm font-medium mt-1">
                      {prediction.prediction.longTerm.overallSuccessProbability}%
                    </p>
                  </div>

                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-sm font-medium text-purple-800 mb-1">Resultado Proyectado</p>
                    <p className="text-xs text-purple-700">{prediction.prediction.longTerm.projectedOutcome}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 mb-2">Dominio de Habilidades</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs">Lectura</span>
                        <span className="text-xs font-medium">
                          {prediction.prediction.longTerm.skillMastery.reading}%
                        </span>
                      </div>
                      <Progress value={prediction.prediction.longTerm.skillMastery.reading} className="h-2" />

                      <div className="flex justify-between items-center">
                        <span className="text-xs">Escritura</span>
                        <span className="text-xs font-medium">
                          {prediction.prediction.longTerm.skillMastery.writing}%
                        </span>
                      </div>
                      <Progress value={prediction.prediction.longTerm.skillMastery.writing} className="h-2" />

                      <div className="flex justify-between items-center">
                        <span className="text-xs">Comprensión</span>
                        <span className="text-xs font-medium">
                          {prediction.prediction.longTerm.skillMastery.comprehension}%
                        </span>
                      </div>
                      <Progress value={prediction.prediction.longTerm.skillMastery.comprehension} className="h-2" />

                      <div className="flex justify-between items-center">
                        <span className="text-xs">Fonológico</span>
                        <span className="text-xs font-medium">
                          {prediction.prediction.longTerm.skillMastery.phonological}%
                        </span>
                      </div>
                      <Progress value={prediction.prediction.longTerm.skillMastery.phonological} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-indigo-600" />
                  Análisis de Tendencias Detallado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Tendencias de Rendimiento</h3>

                    <div
                      className={`p-4 rounded-lg border-2 ${getTrendColor(prediction.prediction.trends.progressTrend)}`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        {getTrendIcon(prediction.prediction.trends.progressTrend)}
                        <h4 className="font-medium">Progreso General</h4>
                      </div>
                      <p className="text-sm capitalize mb-2">{prediction.prediction.trends.progressTrend}</p>
                      <p className="text-xs opacity-75">
                        {prediction.prediction.trends.progressTrend === "mejorando" &&
                          "El estudiante muestra una tendencia positiva en su aprendizaje"}
                        {prediction.prediction.trends.progressTrend === "estable" &&
                          "El progreso se mantiene constante sin cambios significativos"}
                        {prediction.prediction.trends.progressTrend === "empeorando" &&
                          "Se observa una disminución en el rendimiento que requiere atención"}
                      </p>
                    </div>

                    <div
                      className={`p-4 rounded-lg border-2 ${getTrendColor(prediction.prediction.trends.accuracyTrend)}`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        {getTrendIcon(prediction.prediction.trends.accuracyTrend)}
                        <h4 className="font-medium">Precisión en Ejercicios</h4>
                      </div>
                      <p className="text-sm capitalize mb-2">{prediction.prediction.trends.accuracyTrend}</p>
                      <p className="text-xs opacity-75">
                        {prediction.prediction.trends.accuracyTrend === "mejorando" &&
                          "La precisión en los ejercicios está aumentando consistentemente"}
                        {prediction.prediction.trends.accuracyTrend === "estable" &&
                          "La precisión se mantiene en un nivel constante"}
                        {prediction.prediction.trends.accuracyTrend === "empeorando" &&
                          "La precisión está disminuyendo, posible fatiga o dificultad creciente"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Compromiso y Motivación</h3>

                    <div
                      className={`p-4 rounded-lg border-2 ${getEngagementColor(prediction.prediction.trends.engagementTrend)}`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Heart className="h-5 w-5" />
                        <h4 className="font-medium">Nivel de Compromiso</h4>
                      </div>
                      <p className="text-sm capitalize mb-2">{prediction.prediction.trends.engagementTrend}</p>
                      <p className="text-xs opacity-75">
                        {prediction.prediction.trends.engagementTrend === "alta" &&
                          "El estudiante muestra alto interés y participación activa"}
                        {prediction.prediction.trends.engagementTrend === "media" &&
                          "Nivel de compromiso moderado, puede beneficiarse de más motivación"}
                        {prediction.prediction.trends.engagementTrend === "baja" &&
                          "Bajo compromiso, requiere estrategias de motivación inmediatas"}
                      </p>
                    </div>

                    <div
                      className={`p-4 rounded-lg border-2 ${
                        prediction.prediction.trends.overallTrajectory === "positiva"
                          ? "border-green-200 bg-green-50 text-green-800"
                          : prediction.prediction.trends.overallTrajectory === "preocupante"
                            ? "border-red-200 bg-red-50 text-red-800"
                            : "border-yellow-200 bg-yellow-50 text-yellow-800"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Shield className="h-5 w-5" />
                        <h4 className="font-medium">Trayectoria General</h4>
                      </div>
                      <p className="text-sm capitalize mb-2">{prediction.prediction.trends.overallTrajectory}</p>
                      <p className="text-xs opacity-75">
                        {prediction.prediction.trends.overallTrajectory === "positiva" &&
                          "Excelente trayectoria, el estudiante está en el camino correcto"}
                        {prediction.prediction.trends.overallTrajectory === "neutral" &&
                          "Trayectoria estable, con oportunidades de mejora"}
                        {prediction.prediction.trends.overallTrajectory === "preocupante" &&
                          "Trayectoria que requiere intervención inmediata y seguimiento cercano"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interventions" className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-6 w-6 text-orange-600" />
                  Plan de Intervenciones Personalizadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {prediction.prediction.longTerm.recommendedInterventions.map((intervention, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200"
                    >
                      <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-900 mb-2">Intervención {index + 1}</h4>
                        <p className="text-blue-800 text-sm mb-3">{intervention}</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                          <div className="bg-white p-2 rounded border">
                            <span className="font-medium text-gray-600">Prioridad:</span>
                            <span
                              className={`ml-1 ${index < 2 ? "text-red-600" : index < 4 ? "text-yellow-600" : "text-green-600"}`}
                            >
                              {index < 2 ? "Alta" : index < 4 ? "Media" : "Baja"}
                            </span>
                          </div>
                          <div className="bg-white p-2 rounded border">
                            <span className="font-medium text-gray-600">Tiempo:</span>
                            <span className="ml-1 text-gray-800">
                              {index < 2 ? "1-2 semanas" : index < 4 ? "2-4 semanas" : "1-2 meses"}
                            </span>
                          </div>
                          <div className="bg-white p-2 rounded border">
                            <span className="font-medium text-gray-600">Tipo:</span>
                            <span className="ml-1 text-gray-800">
                              {intervention.includes("refuerzo")
                                ? "Refuerzo"
                                : intervention.includes("metodología")
                                  ? "Metodológica"
                                  : intervention.includes("gamificación")
                                    ? "Motivacional"
                                    : "Específica"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Indicadores de Éxito
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <span>Aumento del 15% en la precisión de ejercicios</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <span>Reducción del riesgo de abandono por debajo del 30%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <span>Mejora en el compromiso y participación</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <span>Progreso constante en módulos asignados</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Información adicional */}
        <Card className="border-0 shadow-xl mt-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Última actualización: {new Date(prediction.lastUpdated).toLocaleString()}</span>
              <span>Confianza del análisis: {prediction.prediction.confidence}%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function StudentAIAnalysis() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
          <div className="container mx-auto px-6 py-8">
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
            </div>
          </div>
        </div>
      }
    >
      <StudentAIAnalysisContent />
    </Suspense>
  )
}
