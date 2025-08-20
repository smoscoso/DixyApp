"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Target,
  AlertTriangle,
  Brain,
  Calendar,
  BarChart3,
  Zap,
  RefreshCw,
  Loader2,
  Info,
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface PredictionData {
  studentId: string
  studentName: string
  hasEnoughData: boolean
  minimumDataReached: boolean
  message?: string
  shortTermPredictions?: {
    expectedProgress: number
    expectedAccuracy: number
    riskOfDropout: number
    motivationForecast: "creciente" | "estable" | "decreciente"
  }
  mediumTermPredictions?: {
    expectedProgress: number
    expectedAccuracy: number
    modulesLikelyToComplete: number[]
    estimatedCompletionTime: number
  }
  longTermPredictions?: {
    expectedProgress: number
    expectedAccuracy: number
    overallSuccessProbability: number
    recommendedInterventions: string[]
  }
  trendAnalysis?: {
    progressTrend: "mejorando" | "estable" | "empeorando"
    accuracyTrend: "mejorando" | "estable" | "empeorando"
    engagementTrend: "aumentando" | "estable" | "disminuyendo"
    overallTrajectory: "positiva" | "neutral" | "preocupante"
  }
  recommendations?: {
    immediate: string[]
    shortTerm: string[]
    longTerm: string[]
  }
  confidence?: number
}

interface PredictionDashboardProps {
  teacherId: string
  studentId?: string
}

export default function PredictionDashboard({ teacherId, studentId }: PredictionDashboardProps) {
  const [predictions, setPredictions] = useState<PredictionData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [expandedPredictions, setExpandedPredictions] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadPredictions()
  }, [teacherId, studentId])

  const loadPredictions = async () => {
    setIsLoading(true)
    setError("")

    try {
      const url = studentId
        ? `/api/teacher/student-predictions?teacherId=${teacherId}&studentId=${studentId}`
        : `/api/teacher/student-predictions?teacherId=${teacherId}`

      const response = await fetch(url)
      const data = await response.json()

      if (response.ok) {
        if (studentId) {
          setPredictions([data.prediction])
        } else {
          setPredictions(data.predictions || [])
        }
      } else {
        setError(data.error || "Error al cargar predicciones")
      }
    } catch (err) {
      console.error("Error cargando predicciones:", err)
      setError("Error de conexión al cargar predicciones")
    } finally {
      setIsLoading(false)
    }
  }

  const togglePredictionExpansion = (studentId: string) => {
    const newExpanded = new Set(expandedPredictions)
    if (newExpanded.has(studentId)) {
      newExpanded.delete(studentId)
    } else {
      newExpanded.add(studentId)
    }
    setExpandedPredictions(newExpanded)
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "mejorando":
      case "aumentando":
      case "creciente":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "empeorando":
      case "disminuyendo":
      case "decreciente":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-yellow-600" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "mejorando":
      case "aumentando":
      case "creciente":
      case "positiva":
        return "text-green-700 bg-green-50 border-green-200"
      case "empeorando":
      case "disminuyendo":
      case "decreciente":
      case "preocupante":
        return "text-red-700 bg-red-50 border-red-200"
      default:
        return "text-yellow-700 bg-yellow-50 border-yellow-200"
    }
  }

  const getRiskColor = (risk: number) => {
    if (risk > 70) return "text-red-700 bg-red-50 border-red-200"
    if (risk > 40) return "text-yellow-700 bg-yellow-50 border-yellow-200"
    return "text-green-700 bg-green-50 border-green-200"
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 80) return "text-green-700"
    if (confidence > 60) return "text-yellow-700"
    return "text-red-700"
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="ml-2 text-gray-600">Generando predicciones...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-indigo-600" />
          <h2 className="text-2xl font-bold text-gray-900">Predicciones de Rendimiento Futuro</h2>
        </div>
        <Button
          onClick={loadPredictions}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 bg-transparent"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Actualizar
        </Button>
      </div>

      {predictions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Brain className="h-16 w-16 mx-auto mb-4 opacity-50 text-gray-400" />
            <p className="text-xl font-medium mb-2 text-gray-600">No hay predicciones disponibles</p>
            <p className="text-gray-400">Los estudiantes necesitan más actividad para generar predicciones</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {predictions.map((prediction) => (
            <Card key={prediction.studentId} className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-indigo-900 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    {prediction.studentName}
                  </CardTitle>
                  {prediction.confidence && (
                    <Badge className={`${getConfidenceColor(prediction.confidence)} bg-transparent border`}>
                      Confianza: {Math.round(prediction.confidence)}%
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {!prediction.hasEnoughData ? (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <Info className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">{prediction.message}</AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-6">
                    {/* Resumen de predicciones */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Predicciones a corto plazo */}
                      <Card className="bg-blue-50 border-blue-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Próximas 2 semanas
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-blue-700">Progreso esperado</span>
                              <span className="font-medium text-blue-800">
                                {Math.round(prediction.shortTermPredictions?.expectedProgress || 0)}%
                              </span>
                            </div>
                            <Progress value={prediction.shortTermPredictions?.expectedProgress || 0} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-blue-700">Precisión esperada</span>
                              <span className="font-medium text-blue-800">
                                {Math.round(prediction.shortTermPredictions?.expectedAccuracy || 0)}%
                              </span>
                            </div>
                            <Progress value={prediction.shortTermPredictions?.expectedAccuracy || 0} className="h-2" />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-blue-700">Motivación</span>
                            <div className="flex items-center gap-1">
                              {getTrendIcon(prediction.shortTermPredictions?.motivationForecast || "estable")}
                              <span className="text-sm font-medium text-blue-800 capitalize">
                                {prediction.shortTermPredictions?.motivationForecast}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Predicciones a mediano plazo */}
                      <Card className="bg-green-50 border-green-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Próximo mes
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-green-700">Progreso esperado</span>
                              <span className="font-medium text-green-800">
                                {Math.round(prediction.mediumTermPredictions?.expectedProgress || 0)}%
                              </span>
                            </div>
                            <Progress value={prediction.mediumTermPredictions?.expectedProgress || 0} className="h-2" />
                          </div>
                          <div className="text-sm">
                            <span className="text-green-700">Tiempo estimado: </span>
                            <span className="font-medium text-green-800">
                              {prediction.mediumTermPredictions?.estimatedCompletionTime || 0} días
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="text-green-700">Módulos a completar: </span>
                            <span className="font-medium text-green-800">
                              {prediction.mediumTermPredictions?.modulesLikelyToComplete?.length || 0}
                            </span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Predicciones a largo plazo */}
                      <Card className="bg-purple-50 border-purple-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-purple-800 flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Próximos 3 meses
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-purple-700">Probabilidad de éxito</span>
                              <span className="font-medium text-purple-800">
                                {Math.round(prediction.longTermPredictions?.overallSuccessProbability || 0)}%
                              </span>
                            </div>
                            <Progress
                              value={prediction.longTermPredictions?.overallSuccessProbability || 0}
                              className="h-2"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-purple-700">Progreso final esperado</span>
                              <span className="font-medium text-purple-800">
                                {Math.round(prediction.longTermPredictions?.expectedProgress || 0)}%
                              </span>
                            </div>
                            <Progress value={prediction.longTermPredictions?.expectedProgress || 0} className="h-2" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Análisis de tendencias */}
                    {prediction.trendAnalysis && (
                      <Card className="bg-gray-50 border-gray-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-gray-800 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Análisis de Tendencias
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 mb-1">
                                {getTrendIcon(prediction.trendAnalysis.progressTrend)}
                                <span className="text-sm font-medium">Progreso</span>
                              </div>
                              <Badge className={`${getTrendColor(prediction.trendAnalysis.progressTrend)} text-xs`}>
                                {prediction.trendAnalysis.progressTrend}
                              </Badge>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 mb-1">
                                {getTrendIcon(prediction.trendAnalysis.accuracyTrend)}
                                <span className="text-sm font-medium">Precisión</span>
                              </div>
                              <Badge className={`${getTrendColor(prediction.trendAnalysis.accuracyTrend)} text-xs`}>
                                {prediction.trendAnalysis.accuracyTrend}
                              </Badge>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 mb-1">
                                {getTrendIcon(prediction.trendAnalysis.engagementTrend)}
                                <span className="text-sm font-medium">Compromiso</span>
                              </div>
                              <Badge className={`${getTrendColor(prediction.trendAnalysis.engagementTrend)} text-xs`}>
                                {prediction.trendAnalysis.engagementTrend}
                              </Badge>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 mb-1">
                                {getTrendIcon(prediction.trendAnalysis.overallTrajectory)}
                                <span className="text-sm font-medium">Trayectoria</span>
                              </div>
                              <Badge className={`${getTrendColor(prediction.trendAnalysis.overallTrajectory)} text-xs`}>
                                {prediction.trendAnalysis.overallTrajectory}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Riesgo de abandono */}
                    {prediction.shortTermPredictions && (
                      <Alert className={getRiskColor(prediction.shortTermPredictions.riskOfDropout)}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>
                            Riesgo de abandono: {Math.round(prediction.shortTermPredictions.riskOfDropout)}%
                          </strong>
                          {prediction.shortTermPredictions.riskOfDropout > 70 && (
                            <span className="block mt-1">⚠️ Requiere atención inmediata del docente</span>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Recomendaciones expandibles */}
                    {prediction.recommendations && (
                      <Collapsible
                        open={expandedPredictions.has(prediction.studentId)}
                        onOpenChange={() => togglePredictionExpansion(prediction.studentId)}
                      >
                        <CollapsibleTrigger asChild>
                          <Button variant="outline" className="w-full flex items-center gap-2 bg-transparent">
                            <Zap className="h-4 w-4" />
                            {expandedPredictions.has(prediction.studentId) ? "Ocultar" : "Ver"} Recomendaciones
                            Detalladas
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="mt-4 space-y-4">
                            {/* Recomendaciones inmediatas */}
                            {prediction.recommendations.immediate.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                                  <AlertTriangle className="h-4 w-4" />
                                  Acciones Inmediatas (1-2 semanas)
                                </h4>
                                <div className="space-y-2">
                                  {prediction.recommendations.immediate.map((rec, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-200"
                                    >
                                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                                      <span className="text-sm text-red-800">{rec}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Recomendaciones a corto plazo */}
                            {prediction.recommendations.shortTerm.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  Acciones a Corto Plazo (1 mes)
                                </h4>
                                <div className="space-y-2">
                                  {prediction.recommendations.shortTerm.map((rec, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                                    >
                                      <Clock className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                      <span className="text-sm text-yellow-800">{rec}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Recomendaciones a largo plazo */}
                            {prediction.recommendations.longTerm.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                                  <Target className="h-4 w-4" />
                                  Estrategias a Largo Plazo (3 meses)
                                </h4>
                                <div className="space-y-2">
                                  {prediction.recommendations.longTerm.map((rec, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200"
                                    >
                                      <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                      <span className="text-sm text-blue-800">{rec}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
