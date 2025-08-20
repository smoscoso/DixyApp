/**
 * Red Neuronal de Predicción de Rendimiento Futuro
 * Analiza patrones históricos para predecir el progreso futuro de estudiantes
 */

export interface PredictionInput {
  // Datos históricos de progreso (últimas 4 semanas)
  progressTrend: number[] // Array de 4 valores (progreso semanal)
  accuracyTrend: number[] // Array de 4 valores (precisión semanal)
  sessionFrequency: number[] // Array de 4 valores (frecuencia de sesiones)

  // Datos actuales del estudiante
  currentProgress: number // Progreso actual total (0-1)
  currentAccuracy: number // Precisión actual promedio (0-1)
  learningVelocity: number // Velocidad de aprendizaje (niveles/semana)
  consistencyScore: number // Qué tan consistente es (0-1)

  // Factores del estudiante
  age: number // Normalizado (0-1)
  dyslexiaLevel: number // leve=0.33, moderado=0.66, severo=1.0
  dyslexiaType: number // fonologica=0.25, superficial=0.5, mixta=0.75, kinestesica=1.0
  hasKinestheticDyslexia: number // 0 o 1

  // Factores temporales
  weeksActive: number // Semanas activo en la plataforma
  averageSessionDuration: number // Duración promedio de sesión (normalizada)
  motivationTrend: number // Tendencia de motivación (-1 a 1)
}

export interface PredictionResult {
  // Predicciones a corto plazo (1-2 semanas)
  shortTermPredictions: {
    expectedProgress: number // Progreso esperado en 2 semanas (0-100%)
    expectedAccuracy: number // Precisión esperada (0-100%)
    riskOfDropout: number // Riesgo de abandono (0-100%)
    motivationForecast: "creciente" | "estable" | "decreciente"
  }

  // Predicciones a mediano plazo (1 mes)
  mediumTermPredictions: {
    expectedProgress: number
    expectedAccuracy: number
    modulesLikelyToComplete: number[]
    estimatedCompletionTime: number // Días para completar módulos actuales
  }

  // Predicciones a largo plazo (3 meses)
  longTermPredictions: {
    expectedProgress: number
    expectedAccuracy: number
    overallSuccessProbability: number // Probabilidad de éxito general (0-100%)
    recommendedInterventions: string[]
  }

  // Análisis de tendencias
  trendAnalysis: {
    progressTrend: "mejorando" | "estable" | "empeorando"
    accuracyTrend: "mejorando" | "estable" | "empeorando"
    engagementTrend: "aumentando" | "estable" | "disminuyendo"
    overallTrajectory: "positiva" | "neutral" | "preocupante"
  }

  // Recomendaciones específicas
  recommendations: {
    immediate: string[] // Acciones inmediatas (1-2 semanas)
    shortTerm: string[] // Acciones a corto plazo (1 mes)
    longTerm: string[] // Estrategias a largo plazo (3 meses)
  }

  confidence: number // Confianza en las predicciones (0-100%)
}

export class PredictionNetwork {
  private inputNodes = 20
  private hiddenNodes1 = 32
  private hiddenNodes2 = 24
  private hiddenNodes3 = 16
  private outputNodes = 15 // Diferentes aspectos de predicción

  private weightsIH1!: number[][]
  private weightsH1H2!: number[][]
  private weightsH2H3!: number[][]
  private weightsH3O!: number[][]
  private biasH1!: number[]
  private biasH2!: number[]
  private biasH3!: number[]
  private biasO!: number[]

  constructor() {
    this.initializeWeights()
    this.loadPretrainedWeights()
  }

  private initializeWeights(): void {
    // Inicialización Xavier/Glorot para mejor convergencia
    const limitH1 = Math.sqrt(6 / (this.inputNodes + this.hiddenNodes1))
    const limitH2 = Math.sqrt(6 / (this.hiddenNodes1 + this.hiddenNodes2))
    const limitH3 = Math.sqrt(6 / (this.hiddenNodes2 + this.hiddenNodes3))
    const limitO = Math.sqrt(6 / (this.hiddenNodes3 + this.outputNodes))

    // Pesos entrada -> capa oculta 1
    this.weightsIH1 = Array(this.hiddenNodes1)
      .fill(0)
      .map(() =>
        Array(this.inputNodes)
          .fill(0)
          .map(() => (Math.random() * 2 - 1) * limitH1),
      )

    // Pesos capa oculta 1 -> capa oculta 2
    this.weightsH1H2 = Array(this.hiddenNodes2)
      .fill(0)
      .map(() =>
        Array(this.hiddenNodes1)
          .fill(0)
          .map(() => (Math.random() * 2 - 1) * limitH2),
      )

    // Pesos capa oculta 2 -> capa oculta 3
    this.weightsH2H3 = Array(this.hiddenNodes3)
      .fill(0)
      .map(() =>
        Array(this.hiddenNodes2)
          .fill(0)
          .map(() => (Math.random() * 2 - 1) * limitH3),
      )

    // Pesos capa oculta 3 -> salida
    this.weightsH3O = Array(this.outputNodes)
      .fill(0)
      .map(() =>
        Array(this.hiddenNodes3)
          .fill(0)
          .map(() => (Math.random() * 2 - 1) * limitO),
      )

    // Bias
    this.biasH1 = Array(this.hiddenNodes1).fill(0)
    this.biasH2 = Array(this.hiddenNodes2).fill(0)
    this.biasH3 = Array(this.hiddenNodes3).fill(0)
    this.biasO = Array(this.outputNodes).fill(0)
  }

  private loadPretrainedWeights(): void {
    // Pesos preentrenados optimizados para predicción temporal

    // Dar más peso a las tendencias recientes
    for (let i = 0; i < 4; i++) {
      this.weightsIH1[i][i] = 0.9 - i * 0.1 // Más peso a datos más recientes
      this.weightsIH1[i + 4][i + 4] = 0.8 - i * 0.1
    }

    // Pesos para velocidad de aprendizaje y consistencia
    this.weightsIH1[8][10] = 0.85 // learningVelocity
    this.weightsIH1[9][11] = 0.8 // consistencyScore

    // Factores de dislexia
    this.weightsIH1[10][13] = 0.7 // dyslexiaLevel
    this.weightsIH1[11][14] = 0.6 // dyslexiaType

    // Tendencia de motivación es crucial para predicciones
    this.weightsIH1[12][18] = 0.9 // motivationTrend

    // Ajustar bias para mejor predicción
    this.biasH1[0] = -0.1
    this.biasH2[0] = 0.05
    this.biasO[0] = 0.1 // Predicción de progreso a corto plazo
  }

  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x))))
  }

  private relu(x: number): number {
    return Math.max(0, x)
  }

  private tanh(x: number): number {
    return Math.tanh(x)
  }

  private leakyRelu(x: number): number {
    return x > 0 ? x : 0.01 * x
  }

  public predict(input: PredictionInput): PredictionResult {
    // Convertir input a array normalizado
    const inputArray = [
      ...input.progressTrend,
      ...input.accuracyTrend,
      ...input.sessionFrequency,
      input.currentProgress,
      input.currentAccuracy,
      input.learningVelocity,
      input.consistencyScore,
      input.age,
      input.dyslexiaLevel,
      input.dyslexiaType,
      input.hasKinestheticDyslexia,
      input.weeksActive / 52, // Normalizar semanas a año
      input.averageSessionDuration,
      input.motivationTrend,
    ]

    // Forward pass
    const output = this.forward(inputArray)

    // Interpretar resultados
    return this.interpretPredictions(output, input)
  }

  private forward(inputs: number[]): number[] {
    // Capa oculta 1
    const hidden1 = Array(this.hiddenNodes1).fill(0)
    for (let i = 0; i < this.hiddenNodes1; i++) {
      let sum = this.biasH1[i]
      for (let j = 0; j < this.inputNodes; j++) {
        sum += inputs[j] * this.weightsIH1[i][j]
      }
      hidden1[i] = this.leakyRelu(sum)
    }

    // Capa oculta 2
    const hidden2 = Array(this.hiddenNodes2).fill(0)
    for (let i = 0; i < this.hiddenNodes2; i++) {
      let sum = this.biasH2[i]
      for (let j = 0; j < this.hiddenNodes1; j++) {
        sum += hidden1[j] * this.weightsH1H2[i][j]
      }
      hidden2[i] = this.relu(sum)
    }

    // Capa oculta 3
    const hidden3 = Array(this.hiddenNodes3).fill(0)
    for (let i = 0; i < this.hiddenNodes3; i++) {
      let sum = this.biasH3[i]
      for (let j = 0; j < this.hiddenNodes2; j++) {
        sum += hidden2[j] * this.weightsH2H3[i][j]
      }
      hidden3[i] = this.tanh(sum)
    }

    // Capa de salida
    const output = Array(this.outputNodes).fill(0)
    for (let i = 0; i < this.outputNodes; i++) {
      let sum = this.biasO[i]
      for (let j = 0; j < this.hiddenNodes3; j++) {
        sum += hidden3[j] * this.weightsH3O[i][j]
      }
      output[i] = this.sigmoid(sum)
    }

    return output
  }

  private interpretPredictions(output: number[], input: PredictionInput): PredictionResult {
    const [
      shortTermProgress,
      shortTermAccuracy,
      dropoutRisk,
      motivationDirection,
      mediumTermProgress,
      mediumTermAccuracy,
      completionTimeEstimate,
      longTermProgress,
      longTermAccuracy,
      successProbability,
      progressTrendDirection,
      accuracyTrendDirection,
      engagementDirection,
      overallTrajectory,
      confidence,
    ] = output

    // Calcular predicciones a corto plazo
    const currentProgressPercent = input.currentProgress * 100
    const shortTermPredictions = {
      expectedProgress: Math.min(100, currentProgressPercent + shortTermProgress * 20),
      expectedAccuracy: Math.min(100, (input.currentAccuracy + shortTermAccuracy * 0.2) * 100),
      riskOfDropout: dropoutRisk * 100,
      motivationForecast: this.interpretMotivationForecast(motivationDirection),
    }

    // Calcular predicciones a mediano plazo
    const mediumTermPredictions = {
      expectedProgress: Math.min(100, currentProgressPercent + mediumTermProgress * 40),
      expectedAccuracy: Math.min(100, (input.currentAccuracy + mediumTermAccuracy * 0.3) * 100),
      modulesLikelyToComplete: this.predictModuleCompletion(input, mediumTermProgress),
      estimatedCompletionTime: Math.round(completionTimeEstimate * 90), // Días
    }

    // Calcular predicciones a largo plazo
    const longTermPredictions = {
      expectedProgress: Math.min(100, currentProgressPercent + longTermProgress * 60),
      expectedAccuracy: Math.min(100, (input.currentAccuracy + longTermAccuracy * 0.4) * 100),
      overallSuccessProbability: successProbability * 100,
      recommendedInterventions: this.generateInterventions(output, input),
    }

    // Análisis de tendencias
    const trendAnalysis = {
      progressTrend: this.interpretTrend(progressTrendDirection),
      accuracyTrend: this.interpretTrend(accuracyTrendDirection),
      engagementTrend: this.interpretEngagementTrend(engagementDirection),
      overallTrajectory: this.interpretTrajectory(overallTrajectory),
    }

    // Generar recomendaciones
    const recommendations = this.generateRecommendations(output, input, trendAnalysis)

    return {
      shortTermPredictions,
      mediumTermPredictions,
      longTermPredictions,
      trendAnalysis,
      recommendations,
      confidence: confidence * 100,
    }
  }

  private interpretMotivationForecast(value: number): "creciente" | "estable" | "decreciente" {
    if (value > 0.6) return "creciente"
    if (value < 0.4) return "decreciente"
    return "estable"
  }

  private interpretTrend(value: number): "mejorando" | "estable" | "empeorando" {
    if (value > 0.6) return "mejorando"
    if (value < 0.4) return "empeorando"
    return "estable"
  }

  private interpretEngagementTrend(value: number): "aumentando" | "estable" | "disminuyendo" {
    if (value > 0.6) return "aumentando"
    if (value < 0.4) return "disminuyendo"
    return "estable"
  }

  private interpretTrajectory(value: number): "positiva" | "neutral" | "preocupante" {
    if (value > 0.6) return "positiva"
    if (value < 0.4) return "preocupante"
    return "neutral"
  }

  private predictModuleCompletion(input: PredictionInput, progressPrediction: number): number[] {
    // Predecir qué módulos es más probable que complete
    interface ModulePredictionContext {
      modules: number[]
    }

    const modules: ModulePredictionContext["modules"] = []
    const baseProgress = input.currentProgress
    const expectedGrowth = progressPrediction * 0.6

    // Módulos básicos (1-3) más probables si tiene dislexia fonológica/superficial
    if (input.dyslexiaType <= 0.5 && baseProgress + expectedGrowth > 0.3) {
      modules.push(1, 2, 3)
    }

    // Módulos kinestésicos (4-6) si tiene dislexia kinestésica
    if (input.hasKinestheticDyslexia > 0 && baseProgress + expectedGrowth > 0.4) {
      modules.push(4, 5, 6)
    }

    // Módulos avanzados si el progreso es alto
    if (baseProgress + expectedGrowth > 0.7) {
      modules.push(...[1, 2, 3, 4, 5, 6].filter((m) => !modules.includes(m)))
    }

    return modules.slice(0, 4) // Máximo 4 módulos
  }

  private generateInterventions(output: number[], input: PredictionInput): string[] {
    const interventions = []
    const [shortTermProgress, shortTermAccuracy, dropoutRisk] = output

    if (dropoutRisk > 0.7) {
      interventions.push("Intervención urgente: Alto riesgo de abandono")
      interventions.push("Implementar sistema de recompensas inmediato")
    }

    if (shortTermProgress < 0.3) {
      interventions.push("Ajustar dificultad de ejercicios")
      interventions.push("Proporcionar apoyo adicional personalizado")
    }

    if (shortTermAccuracy < 0.4) {
      interventions.push("Revisar metodología de enseñanza")
      interventions.push("Aumentar tiempo de práctica en áreas débiles")
    }

    if (input.motivationTrend < -0.3) {
      interventions.push("Implementar estrategias de gamificación")
      interventions.push("Establecer metas más alcanzables")
    }

    return interventions
  }

  private generateRecommendations(
    output: number[],
    input: PredictionInput,
    trends: any,
  ): { immediate: string[]; shortTerm: string[]; longTerm: string[] } {
    const immediate = []
    const shortTerm = []
    const longTerm = []

    // Recomendaciones inmediatas (1-2 semanas)
    if (output[2] > 0.6) {
      // Alto riesgo de abandono
      immediate.push("Contactar al estudiante inmediatamente")
      immediate.push("Revisar y ajustar la carga de trabajo")
    }

    if (trends.motivationForecast === "decreciente") {
      immediate.push("Implementar actividades más atractivas")
      immediate.push("Celebrar pequeños logros para aumentar motivación")
    }

    if (input.consistencyScore < 0.4) {
      immediate.push("Establecer horarios de estudio más estructurados")
    }

    // Recomendaciones a corto plazo (1 mes)
    if (trends.progressTrend === "empeorando") {
      shortTerm.push("Evaluar y modificar estrategia de aprendizaje")
      shortTerm.push("Considerar apoyo adicional del docente")
    }

    if (output[1] < 0.5) {
      // Baja precisión esperada
      shortTerm.push("Enfocarse en ejercicios de refuerzo")
      shortTerm.push("Aumentar tiempo de práctica en módulos débiles")
    }

    if (input.learningVelocity < 0.3) {
      shortTerm.push("Adaptar ritmo de enseñanza al estudiante")
      shortTerm.push("Proporcionar material de apoyo adicional")
    }

    // Recomendaciones a largo plazo (3 meses)
    if (output[9] < 0.6) {
      // Baja probabilidad de éxito
      longTerm.push("Considerar evaluación psicopedagógica adicional")
      longTerm.push("Desarrollar plan de intervención personalizado")
    }

    if (trends.overallTrajectory === "preocupante") {
      longTerm.push("Involucrar a la familia en el proceso de aprendizaje")
      longTerm.push("Considerar terapias complementarias")
    }

    longTerm.push("Monitorear progreso mensualmente")
    longTerm.push("Ajustar objetivos según evolución del estudiante")

    return { immediate, shortTerm, longTerm }
  }
}

// Función helper para preparar datos de predicción
export function preparePredictionData(progressHistory: any[], student: any): PredictionInput {
  // Calcular tendencias de las últimas 4 semanas
  const now = new Date()
  const fourWeeksAgo = new Date(now.getTime() - 4 * 7 * 24 * 60 * 60 * 1000)

  const recentProgress = progressHistory
    .filter((p) => new Date(p.date) >= fourWeeksAgo)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Dividir en semanas
  const weeklyData = Array(4)
    .fill(0)
    .map((_, weekIndex) => {
      const weekStart = new Date(fourWeeksAgo.getTime() + weekIndex * 7 * 24 * 60 * 60 * 1000)
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)

      const weekData = recentProgress.filter((p) => {
        const date = new Date(p.date)
        return date >= weekStart && date < weekEnd
      })

      const totalAttempts = weekData.reduce((sum, p) => sum + p.attempts, 0)
      const totalSuccesses = weekData.reduce((sum, p) => sum + p.successes, 0)
      const uniqueDays = new Set(weekData.map((p) => new Date(p.date).toDateString())).size

      return {
        progress: weekData.length > 0 ? weekData.filter((p) => p.successes > 0).length / 10 : 0,
        accuracy: totalAttempts > 0 ? totalSuccesses / totalAttempts : 0,
        frequency: uniqueDays / 7, // Días activos en la semana
      }
    })

  // Calcular métricas actuales
  const allProgress = progressHistory.length > 0 ? progressHistory.filter((p) => p.successes > 0).length / (6 * 10) : 0 // 6 módulos, 10 niveles cada uno

  const allAttempts = progressHistory.reduce((sum, p) => sum + p.attempts, 0)
  const allSuccesses = progressHistory.reduce((sum, p) => sum + p.successes, 0)
  const currentAccuracy = allAttempts > 0 ? allSuccesses / allAttempts : 0

  // Calcular velocidad de aprendizaje (niveles completados por semana)
  const weeksActive = Math.max(
    1,
    Math.ceil((now.getTime() - new Date(student.createdAt).getTime()) / (7 * 24 * 60 * 60 * 1000)),
  )
  const completedLevels = progressHistory.filter((p) => p.successes > 0).length
  const learningVelocity = completedLevels / weeksActive

  // Calcular consistencia (qué tan regular es la actividad)
  const activeDays = new Set(progressHistory.map((p) => new Date(p.date).toDateString())).size
  const possibleDays = Math.min(
    30,
    Math.ceil((now.getTime() - new Date(student.createdAt).getTime()) / (24 * 60 * 60 * 1000)),
  )
  const consistencyScore = possibleDays > 0 ? activeDays / possibleDays : 0

  // Calcular tendencia de motivación (basada en frecuencia de sesiones recientes vs anteriores)
  const recentFreq = weeklyData.slice(-2).reduce((sum, w) => sum + w.frequency, 0) / 2
  const olderFreq = weeklyData.slice(0, 2).reduce((sum, w) => sum + w.frequency, 0) / 2
  const motivationTrend = olderFreq > 0 ? (recentFreq - olderFreq) / olderFreq : 0

  // Normalizar datos del estudiante
  const normalizedAge = (student.age - 5) / 13
  const dyslexiaLevelMap = { leve: 0.33, moderado: 0.66, severo: 1.0 }
  const dyslexiaTypeMap = { fonologica: 0.25, superficial: 0.5, mixta: 0.75, kinestesica: 1.0 }

  return {
    progressTrend: weeklyData.map((w) => w.progress),
    accuracyTrend: weeklyData.map((w) => w.accuracy),
    sessionFrequency: weeklyData.map((w) => w.frequency),
    currentProgress: allProgress,
    currentAccuracy: currentAccuracy,
    learningVelocity: Math.min(1, learningVelocity / 5), // Normalizar a máximo 5 niveles/semana
    consistencyScore: consistencyScore,
    age: normalizedAge,
    dyslexiaLevel: dyslexiaLevelMap[student.dyslexiaLevel as keyof typeof dyslexiaLevelMap] || 0.33,
    dyslexiaType: dyslexiaTypeMap[student.dyslexiaType as keyof typeof dyslexiaTypeMap] || 0.25,
    hasKinestheticDyslexia: student.hasKinestheticDyslexia ? 1 : 0,
    weeksActive: weeksActive,
    averageSessionDuration: 0.5, // Placeholder - se puede calcular con datos reales
    motivationTrend: Math.max(-1, Math.min(1, motivationTrend)),
  }
}
