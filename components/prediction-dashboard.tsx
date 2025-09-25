"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  RefreshCw,
  BarChart3,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface PredictionData {
  studentId: string
  studentName: string
  username: string
  prediction: {
    shortTerm: {
      expectedProgress: number
      expectedAccuracy: number
      riskOfDropout: number
      timeframe: string
    }
    mediumTerm: {
      modulesToComplete: number[]
      estimatedCompletionTime: number
      interventionNeeded: boolean
      timeframe: string
    }
    longTerm: {
      overallSuccessProbability: number
      recommendedInterventions: string[]
      projectedOutcome: string
      timeframe: string
    }
    trends: {
      progressTrend: "mejorando" | "estable" | "empeorando"
      accuracyTrend: "mejorando" | "estable" | "empeorando"
      engagementTrend: "alta" | "media" | "baja"
      overallTrajectory: "positiva" | "neutral" | "preocupante"
    }
    confidence: number
  }
  lastUpdated: string
}

interface PredictionDashboardProps {
  teacherId: string
}

export default function PredictionDashboard({ teacherId }: PredictionDashboardProps) {
  const [predictions, setPredictions] = useState<PredictionData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (teacherId) {
      loadPredictions()
    }
  }, [teacherId])

  const loadPredictions = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/teacher/student-predictions?teacherId=${teacherId}`)
      const data = await response.json()

      if (response.ok) {
        setPredictions(data.predictions || [])
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

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "mejorando":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "empeorando":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-yellow-600" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "mejorando":
        return "text-green-600 bg-green-50"
      case "empeorando":
        return "text-red-600 bg-red-50"
      default:
        return "text-yellow-600 bg-yellow-50"
    }
  }

  const getRiskColor = (risk: number) => {
    if (risk > 70) return "text-red-600 bg-red-50"
    if (risk > 40) return "text-yellow-600 bg-yellow-50"
    return "text-green-600 bg-green-50"
  }

  const getTrajectoryColor = (trajectory: string) => {
    switch (trajectory) {
      case "positiva":
        return "text-green-600 bg-green-50"
      case "preocupante":
        return "text-red-600 bg-red-50"
      default:
        return "text-blue-600 bg-blue-50"
    }
  }

  const getHighRiskStudents = () => {
    return predictions.filter((p) => p.prediction.shortTerm.riskOfDropout > 70)
  }

  const getStudentsNeedingIntervention = () => {
    return predictions.filter((p) => p.prediction.mediumTerm.interventionNeeded)
  }

  const getAverageSuccessProbability = () => {
    if (predictions.length === 0) return 0
    const total = predictions.reduce((sum, p) => sum + p.prediction.longTerm.overallSuccessProbability, 0)
    return Math.round(total / predictions.length)
  }

  if (isLoading) {
    return (
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            Predicciones de Rendimiento IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <span className="ml-2 text-gray-600">Generando predicciones...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            Predicciones de Rendimiento IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
              <Brain className="h-6 w-6 text-purple-600" />
              Predicciones de Rendimiento IA
            </CardTitle>
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
        </CardHeader>
        <CardContent className="p-6">
          {predictions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Brain className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-xl font-medium mb-2">No hay predicciones disponibles</p>
              <p className="text-gray-400">Se necesitan más datos de progreso para generar predicciones</p>
            </div>
          ) : (
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Resumen</TabsTrigger>
                <TabsTrigger value="predictions">Predicciones</TabsTrigger>
                <TabsTrigger value="interventions">Intervenciones</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Métricas generales */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-orange-50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-red-600 mb-1">Alto Riesgo</p>
                          <p className="text-3xl font-bold text-red-700">{getHighRiskStudents().length}</p>
                          <p className="text-xs text-red-500 mt-1">Estudiantes</p>
                        </div>
                        <div className="bg-red-100 p-3 rounded-2xl">
                          <AlertTriangle className="h-8 w-8 text-red-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-yellow-600 mb-1">Necesitan Intervención</p>
                          <p className="text-3xl font-bold text-yellow-700">
                            {getStudentsNeedingIntervention().length}
                          </p>
                          <p className="text-xs text-yellow-500 mt-1">Estudiantes</p>
                        </div>
                        <div className="bg-yellow-100 p-3 rounded-2xl">
                          <Target className="h-8 w-8 text-yellow-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-600 mb-1">Éxito Promedio</p>
                          <p className="text-3xl font-bold text-green-700">{getAverageSuccessProbability()}%</p>
                          <p className="text-xs text-green-500 mt-1">Probabilidad</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-2xl">
                          <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Estudiantes de alto riesgo */}
                {getHighRiskStudents().length > 0 && (
                  <Card className="border-2 border-red-200 bg-red-50">
                    <CardHeader>
                      <CardTitle className="text-red-800 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Estudiantes de Alto Riesgo
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {getHighRiskStudents().map((student) => (
                          <div
                            key={student.studentId}
                            className="flex items-center justify-between p-3 bg-white rounded-lg"
                          >
                            <div>
                              <p className="font-medium text-gray-900">{student.studentName}</p>
                              <p className="text-sm text-gray-600">@{student.username}</p>
                            </div>
                            <div className="text-right">
                              <Badge className="bg-red-100 text-red-800">
                                {student.prediction.shortTerm.riskOfDropout}% riesgo
                              </Badge>
                              <p className="text-xs text-gray-500 mt-1">
                                Trayectoria: {student.prediction.trends.overallTrajectory}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="predictions" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {predictions.map((student) => (
                    <Card key={student.studentId} className="border-0 shadow-lg">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{student.studentName}</CardTitle>
                            <p className="text-sm text-gray-600">@{student.username}</p>
                          </div>
                          <Badge className={getTrajectoryColor(student.prediction.trends.overallTrajectory)}>
                            {student.prediction.trends.overallTrajectory}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Predicciones a corto plazo */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Corto Plazo (1-2 semanas)
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <p className="text-xs text-blue-600 mb-1">Progreso Esperado</p>
                              <p className="text-lg font-bold text-blue-800">
                                {student.prediction.shortTerm.expectedProgress}%
                              </p>
                            </div>
                            <div
                              className={`p-3 rounded-lg ${getRiskColor(student.prediction.shortTerm.riskOfDropout)}`}
                            >
                              <p className="text-xs mb-1">Riesgo de Abandono</p>
                              <p className="text-lg font-bold">{student.prediction.shortTerm.riskOfDropout}%</p>
                            </div>
                          </div>
                        </div>

                        {/* Tendencias */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Tendencias
                          </h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Progreso:</span>
                              <div
                                className={`flex items-center gap-1 px-2 py-1 rounded ${getTrendColor(student.prediction.trends.progressTrend)}`}
                              >
                                {getTrendIcon(student.prediction.trends.progressTrend)}
                                <span className="text-xs font-medium">{student.prediction.trends.progressTrend}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Precisión:</span>
                              <div
                                className={`flex items-center gap-1 px-2 py-1 rounded ${getTrendColor(student.prediction.trends.accuracyTrend)}`}
                              >
                                {getTrendIcon(student.prediction.trends.accuracyTrend)}
                                <span className="text-xs font-medium">{student.prediction.trends.accuracyTrend}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Probabilidad de éxito a largo plazo */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Probabilidad de Éxito (3 meses)</h4>
                          <div className="space-y-2">
                            <Progress value={student.prediction.longTerm.overallSuccessProbability} className="h-3" />
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">
                                {student.prediction.longTerm.overallSuccessProbability}%
                              </span>
                              <span className="text-gray-500">Confianza: {student.prediction.confidence}%</span>
                            </div>
                          </div>
                        </div>

                        {/* Módulos a completar */}
                        {student.prediction.mediumTerm.modulesToComplete.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Próximos Módulos</h4>
                            <div className="flex flex-wrap gap-1">
                              {student.prediction.mediumTerm.modulesToComplete.map((moduleId) => (
                                <Badge key={moduleId} variant="outline" className="text-xs">
                                  Módulo {moduleId}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="interventions" className="space-y-6">
                {getStudentsNeedingIntervention().map((student) => (
                  <Card key={student.studentId} className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="h-5 w-5 text-orange-600" />
                        {student.studentName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                          <h4 className="font-medium text-orange-800 mb-2">Resultado Proyectado</h4>
                          <p className="text-sm text-orange-700">{student.prediction.longTerm.projectedOutcome}</p>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Intervenciones Recomendadas</h4>
                          <div className="space-y-2">
                            {student.prediction.longTerm.recommendedInterventions.map((intervention, index) => (
                              <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-blue-800">{intervention}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-600">
                            Tiempo estimado de finalización: {student.prediction.mediumTerm.estimatedCompletionTime}{" "}
                            semanas
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {getStudentsNeedingIntervention().length === 0 && (
                  <Card className="border-0 shadow-lg">
                    <CardContent className="text-center py-8">
                      <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                      <p className="text-xl font-medium mb-2 text-gray-900">¡Excelente!</p>
                      <p className="text-gray-600">Ningún estudiante requiere intervención inmediata</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
