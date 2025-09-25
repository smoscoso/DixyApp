interface EnhancedPredictionInput {
  studentId: string
  currentProgress: number[]
  accuracyTrends: number[]
  sessionFrequency: number[]
  motivationIndicators: number[]
  learningVelocity: number[]
  consistencyScores: number[]
  difficultyAdaptation: number[]
  timeSpentPerModule: number[]
  errorPatterns: number[]
  dyslexiaProfile: {
    level: string
    type: string
    hasKinesthetic: boolean
    severity: number
  }
  demographicFactors: {
    age: number
    courseLevel: number
    previousExperience: number
  }
  environmentalFactors: {
    sessionLength: number[]
    timeOfDay: number[]
    deviceUsed: string[]
  }
}

interface EnhancedPredictionResult {
  shortTerm: {
    expectedProgress: number
    expectedAccuracy: number
    riskOfDropout: number
    motivationForecast: "creciente" | "estable" | "decreciente"
    optimalSessionLength: number
    recommendedFrequency: number
    timeframe: "1-2 semanas"
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
    timeframe: "1 mes"
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
    timeframe: "3 meses"
  }
  trends: {
    progressTrend: "mejorando" | "estable" | "empeorando"
    accuracyTrend: "mejorando" | "estable" | "empeorando"
    engagementTrend: "alta" | "media" | "baja"
    learningEfficiencyTrend: "mejorando" | "estable" | "empeorando"
    overallTrajectory: "positiva" | "neutral" | "preocupante"
  }
  personalizedRecommendations: {
    immediate: string[]
    shortTerm: string[]
    longTerm: string[]
    parentGuidance: string[]
    teacherActions: string[]
  }
  riskFactors: {
    factor: string
    severity: "bajo" | "medio" | "alto"
    mitigation: string
  }[]
  confidence: number
  dataQuality: number
  lastAnalysisDate: string
}

class EnhancedPredictionNetwork {
  private weights: {
    input_hidden1: number[][]
    hidden1_hidden2: number[][]
    hidden2_hidden3: number[][]
    hidden3_hidden4: number[][]
    hidden4_output: number[][]
  }

  private biases: {
    hidden1: number[]
    hidden2: number[]
    hidden3: number[]
    hidden4: number[]
    output: number[]
  }

  constructor() {
    // Red neuronal más profunda y compleja
    this.weights = {
      input_hidden1: this.initializeWeights(35, 64), // Más inputs
      hidden1_hidden2: this.initializeWeights(64, 48),
      hidden2_hidden3: this.initializeWeights(48, 32),
      hidden3_hidden4: this.initializeWeights(32, 24),
      hidden4_output: this.initializeWeights(24, 25), // Más outputs
    }

    this.biases = {
      hidden1: new Array(64).fill(0).map(() => (Math.random() - 0.5) * 0.1),
      hidden2: new Array(48).fill(0).map(() => (Math.random() - 0.5) * 0.1),
      hidden3: new Array(32).fill(0).map(() => (Math.random() - 0.5) * 0.1),
      hidden4: new Array(24).fill(0).map(() => (Math.random() - 0.5) * 0.1),
      output: new Array(25).fill(0).map(() => (Math.random() - 0.5) * 0.1),
    }
  }

  private initializeWeights(inputSize: number, outputSize: number): number[][] {
    const weights: number[][] = []
    for (let i = 0; i < inputSize; i++) {
      weights[i] = []
      for (let j = 0; j < outputSize; j++) {
        // He initialization para mejor convergencia
        weights[i][j] = Math.random() * Math.sqrt(2 / inputSize) * (Math.random() > 0.5 ? 1 : -1)
      }
    }
    return weights
  }

  private relu(x: number): number {
    return Math.max(0, x)
  }

  private leakyRelu(x: number, alpha = 0.01): number {
    return x > 0 ? x : alpha * x
  }

  private swish(x: number): number {
    return x / (1 + Math.exp(-x))
  }

  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x))))
  }

  private tanh(x: number): number {
    return Math.tanh(x)
  }

  private dropout(values: number[], rate = 0.1): number[] {
    return values.map((v) => (Math.random() > rate ? v : 0))
  }

  private normalizeInput(data: EnhancedPredictionInput): number[] {
    const input: number[] = []

    // Progreso actual (6 valores - uno por módulo)
    for (let i = 0; i < 6; i++) {
      input.push((data.currentProgress[i] || 0) / 100)
    }

    // Tendencias de precisión (6 valores - últimas 6 semanas)
    for (let i = 0; i < 6; i++) {
      input.push((data.accuracyTrends[i] || 0) / 100)
    }

    // Frecuencia de sesiones (4 valores - últimas 4 semanas)
    for (let i = 0; i < 4; i++) {
      input.push(Math.min((data.sessionFrequency[i] || 0) / 10, 1))
    }

    // Indicadores de motivación (4 valores)
    for (let i = 0; i < 4; i++) {
      input.push((data.motivationIndicators[i] || 0) / 100)
    }

    // Velocidad de aprendizaje (3 valores)
    for (let i = 0; i < 3; i++) {
      input.push((data.learningVelocity[i] || 0) / 100)
    }

    // Puntuaciones de consistencia (3 valores)
    for (let i = 0; i < 3; i++) {
      input.push((data.consistencyScores[i] || 0) / 100)
    }

    // Adaptación a la dificultad (2 valores)
    for (let i = 0; i < 2; i++) {
      input.push((data.difficultyAdaptation[i] || 0) / 100)
    }

    // Tiempo por módulo (normalizado)
    const avgTime = data.timeSpentPerModule.reduce((sum, time) => sum + time, 0) / data.timeSpentPerModule.length || 1
    input.push(Math.min(avgTime / 3600, 1)) // Normalizar a horas

    // Patrones de error
    const avgErrors = data.errorPatterns.reduce((sum, errors) => sum + errors, 0) / data.errorPatterns.length || 0
    input.push(Math.min(avgErrors / 10, 1))

    // Perfil de dislexia (4 valores)
    input.push(data.dyslexiaProfile.level === "leve" ? 0.33 : data.dyslexiaProfile.level === "moderado" ? 0.66 : 1.0)
    input.push(
      data.dyslexiaProfile.type === "fonologica"
        ? 0.25
        : data.dyslexiaProfile.type === "superficial"
          ? 0.5
          : data.dyslexiaProfile.type === "mixta"
            ? 0.75
            : 1.0,
    )
    input.push(data.dyslexiaProfile.hasKinesthetic ? 1 : 0)
    input.push(data.dyslexiaProfile.severity / 10)

    // Factores demográficos (3 valores)
    input.push(data.demographicFactors.age / 18)
    input.push(data.demographicFactors.courseLevel / 12)
    input.push(data.demographicFactors.previousExperience / 5)

    // Factores ambientales (2 valores)
    const avgSessionLength =
      data.environmentalFactors.sessionLength.reduce((sum, len) => sum + len, 0) /
        data.environmentalFactors.sessionLength.length || 30
    input.push(Math.min(avgSessionLength / 120, 1)) // Normalizar a 2 horas máximo

    const avgTimeOfDay =
      data.environmentalFactors.timeOfDay.reduce((sum, time) => sum + time, 0) /
        data.environmentalFactors.timeOfDay.length || 12
    input.push(avgTimeOfDay / 24)

    return input
  }

  private forwardPass(input: number[]): number[] {
    // Capa oculta 1 con Swish activation
    const hidden1 = new Array(64).fill(0)
    for (let j = 0; j < 64; j++) {
      let sum = this.biases.hidden1[j]
      for (let i = 0; i < 35; i++) {
        sum += input[i] * this.weights.input_hidden1[i][j]
      }
      hidden1[j] = this.swish(sum)
    }

    // Aplicar dropout durante entrenamiento (simulado)
    const hidden1_dropped = this.dropout(hidden1, 0.1)

    // Capa oculta 2 con LeakyReLU
    const hidden2 = new Array(48).fill(0)
    for (let j = 0; j < 48; j++) {
      let sum = this.biases.hidden2[j]
      for (let i = 0; i < 64; i++) {
        sum += hidden1_dropped[i] * this.weights.hidden1_hidden2[i][j]
      }
      hidden2[j] = this.leakyRelu(sum)
    }

    // Capa oculta 3 con ReLU
    const hidden3 = new Array(32).fill(0)
    for (let j = 0; j < 32; j++) {
      let sum = this.biases.hidden3[j]
      for (let i = 0; i < 48; i++) {
        sum += hidden2[i] * this.weights.hidden2_hidden3[i][j]
      }
      hidden3[j] = this.relu(sum)
    }

    // Capa oculta 4 con Tanh
    const hidden4 = new Array(24).fill(0)
    for (let j = 0; j < 24; j++) {
      let sum = this.biases.hidden4[j]
      for (let i = 0; i < 32; i++) {
        sum += hidden3[i] * this.weights.hidden3_hidden4[i][j]
      }
      hidden4[j] = this.tanh(sum)
    }

    // Capa de salida con Sigmoid
    const output = new Array(25).fill(0)
    for (let j = 0; j < 25; j++) {
      let sum = this.biases.output[j]
      for (let i = 0; i < 24; i++) {
        sum += hidden4[i] * this.weights.hidden4_output[i][j]
      }
      output[j] = this.sigmoid(sum)
    }

    return output
  }

  private interpretOutput(output: number[], data: EnhancedPredictionInput): EnhancedPredictionResult {
    // Predicciones a corto plazo (outputs 0-5)
    const shortTerm = {
      expectedProgress: Math.round(output[0] * 100),
      expectedAccuracy: Math.round(output[1] * 100),
      riskOfDropout: Math.round(output[2] * 100),
      motivationForecast: this.getMotivationForecast(output[3]) as "creciente" | "estable" | "decreciente",
      optimalSessionLength: Math.round(output[4] * 120 + 15), // 15-135 minutos
      recommendedFrequency: Math.round(output[5] * 6 + 1), // 1-7 sesiones por semana
      timeframe: "1-2 semanas" as const,
    }

    // Predicciones a mediano plazo (outputs 6-12)
    const mediumTerm = {
      modulesToComplete: this.predictModulesToComplete(output.slice(6, 9), data),
      estimatedCompletionTime: Math.round(output[9] * 16 + 2), // 2-18 semanas
      interventionNeeded: output[10] > 0.6,
      difficultyAdjustments: this.generateDifficultyAdjustments(output.slice(11, 12), data),
      learningPathOptimization: this.generateLearningPathOptimization(output[12], data),
      timeframe: "1 mes" as const,
    }

    // Predicciones a largo plazo (outputs 13-18)
    const longTerm = {
      overallSuccessProbability: Math.round(output[13] * 100),
      recommendedInterventions: this.generateEnhancedInterventions(output.slice(14, 17), data),
      projectedOutcome: this.getProjectedOutcome(output[13]),
      skillMastery: {
        reading: Math.round(output[17] * 100),
        writing: Math.round(output[18] * 100),
        comprehension: Math.round(output[19] * 100),
        phonological: Math.round(output[20] * 100),
      },
      adaptiveStrategies: this.generateAdaptiveStrategies(output[21], data),
      timeframe: "3 meses" as const,
    }

    // Tendencias (outputs 22-24)
    const trends = {
      progressTrend: this.getTrend(output[22]) as "mejorando" | "estable" | "empeorando",
      accuracyTrend: this.getTrend(output[23]) as "mejorando" | "estable" | "empeorando",
      engagementTrend: this.getEngagementTrend(output[24]) as "alta" | "media" | "baja",
      learningEfficiencyTrend: this.getTrend((output[22] + output[23]) / 2) as "mejorando" | "estable" | "empeorando",
      overallTrajectory: this.getOverallTrajectory(output.slice(22, 25)) as "positiva" | "neutral" | "preocupante",
    }

    // Recomendaciones personalizadas
    const personalizedRecommendations = {
      immediate: this.generateImmediateRecommendations(output, data),
      shortTerm: this.generateShortTermRecommendations(output, data),
      longTerm: this.generateLongTermRecommendations(output, data),
      parentGuidance: this.generateParentGuidance(output, data),
      teacherActions: this.generateTeacherActions(output, data),
    }

    // Factores de riesgo
    const riskFactors = this.identifyRiskFactors(output, data)

    // Calcular confianza y calidad de datos
    const dataQuality = this.calculateDataQuality(data)
    const confidence = Math.round(dataQuality * 100)

    return {
      shortTerm,
      mediumTerm,
      longTerm,
      trends,
      personalizedRecommendations,
      riskFactors,
      confidence,
      dataQuality,
      lastAnalysisDate: new Date().toISOString(),
    }
  }

  private getMotivationForecast(value: number): string {
    if (value > 0.7) return "creciente"
    if (value < 0.4) return "decreciente"
    return "estable"
  }

  private predictModulesToComplete(moduleOutputs: number[], data: EnhancedPredictionInput): number[] {
    const modules: number[] = []
    const currentProgress = data.currentProgress

    moduleOutputs.forEach((probability, index) => {
      const moduleId = index + 1
      if (currentProgress[index] < 100 && probability > 0.6) {
        modules.push(moduleId)
      }
    })

    return modules
  }

  private generateDifficultyAdjustments(
    outputs: number[],
    data: EnhancedPredictionInput,
  ): {
    moduleId: number
    recommendedLevel: "reducir" | "mantener" | "aumentar"
  }[] {
    const adjustments: { moduleId: number; recommendedLevel: "reducir" | "mantener" | "aumentar" }[] = []

    data.currentProgress.forEach((progress, index) => {
      if (progress > 0 && progress < 100) {
        const moduleId = index + 1
        const accuracy = data.accuracyTrends[index] || 0

        if (accuracy < 40) {
          adjustments.push({ moduleId, recommendedLevel: "reducir" })
        } else if (accuracy > 80) {
          adjustments.push({ moduleId, recommendedLevel: "aumentar" })
        } else {
          adjustments.push({ moduleId, recommendedLevel: "mantener" })
        }
      }
    })

    return adjustments
  }

  private generateLearningPathOptimization(output: number, data: EnhancedPredictionInput): string[] {
    const optimizations: string[] = []

    if (output > 0.8) {
      optimizations.push("Acelerar progresión en módulos dominados")
      optimizations.push("Introducir desafíos adicionales")
    } else if (output > 0.6) {
      optimizations.push("Mantener ritmo actual con refuerzos ocasionales")
      optimizations.push("Alternar entre módulos para mantener interés")
    } else {
      optimizations.push("Reducir velocidad y enfocarse en fundamentos")
      optimizations.push("Implementar más repeticiones y práctica")
    }

    // Optimizaciones específicas por tipo de dislexia
    switch (data.dyslexiaProfile.type) {
      case "fonologica":
        optimizations.push("Priorizar ejercicios de conciencia fonológica")
        break
      case "superficial":
        optimizations.push("Enfatizar reconocimiento visual de palabras")
        break
      case "mixta":
        optimizations.push("Combinar estrategias fonológicas y visuales")
        break
      case "kinestesica":
        optimizations.push("Incorporar más actividades de movimiento")
        break
    }

    return optimizations
  }

  private generateEnhancedInterventions(interventionOutputs: number[], data: EnhancedPredictionInput): string[] {
    const interventions: string[] = []

    if (interventionOutputs[0] > 0.7) {
      interventions.push("Implementar sesiones de refuerzo personalizadas con enfoque multisensorial")
    }

    if (interventionOutputs[1] > 0.6) {
      interventions.push("Ajustar metodología según perfil específico de dislexia y preferencias de aprendizaje")
    }

    if (interventionOutputs[2] > 0.5) {
      interventions.push("Incorporar estrategias de gamificación y recompensas adaptativas")
    }

    // Intervenciones específicas por severidad
    if (data.dyslexiaProfile.severity > 7) {
      interventions.push("Considerar apoyo especializado adicional y terapia específica")
      interventions.push("Implementar pausas frecuentes y sesiones más cortas")
    }

    // Intervenciones por edad
    if (data.demographicFactors.age < 8) {
      interventions.push("Usar más elementos visuales y actividades lúdicas")
    } else if (data.demographicFactors.age > 12) {
      interventions.push("Incorporar elementos de autonomía y autorregulación")
    }

    return interventions.slice(0, 6) // Limitar a 6 intervenciones
  }

  private generateAdaptiveStrategies(output: number, data: EnhancedPredictionInput): string[] {
    const strategies: string[] = []

    if (output > 0.7) {
      strategies.push("Implementar aprendizaje adaptativo basado en rendimiento en tiempo real")
      strategies.push("Usar inteligencia artificial para personalizar dificultad automáticamente")
    }

    strategies.push("Ajustar velocidad de presentación según capacidad de procesamiento")
    strategies.push("Implementar retroalimentación inmediata y específica")
    strategies.push("Usar técnicas de espaciado temporal para mejorar retención")

    return strategies
  }

  private generateImmediateRecommendations(output: number[], data: EnhancedPredictionInput): string[] {
    const recommendations: string[] = []

    if (output[2] > 0.7) {
      // Alto riesgo de abandono
      recommendations.push("Contactar inmediatamente con el estudiante para evaluar motivación")
      recommendations.push("Reducir dificultad temporalmente para recuperar confianza")
    }

    if (output[1] < 0.4) {
      // Baja precisión esperada
      recommendations.push("Revisar comprensión de conceptos básicos antes de continuar")
      recommendations.push("Implementar sesión de repaso intensivo")
    }

    recommendations.push("Monitorear progreso diariamente durante la próxima semana")

    return recommendations
  }

  private generateShortTermRecommendations(output: number[], data: EnhancedPredictionInput): string[] {
    const recommendations: string[] = []

    recommendations.push("Establecer metas semanales alcanzables y celebrar logros")
    recommendations.push("Implementar sistema de seguimiento visual del progreso")

    if (data.dyslexiaProfile.hasKinesthetic) {
      recommendations.push("Incorporar más actividades táctiles y de movimiento")
    }

    recommendations.push("Ajustar horarios de estudio según patrones de rendimiento óptimo")

    return recommendations
  }

  private generateLongTermRecommendations(output: number[], data: EnhancedPredictionInput): string[] {
    const recommendations: string[] = []

    recommendations.push("Desarrollar plan de transición hacia mayor independencia")
    recommendations.push("Establecer objetivos de dominio de habilidades específicas")
    recommendations.push("Preparar estrategias de mantenimiento a largo plazo")

    if (output[13] > 0.8) {
      // Alta probabilidad de éxito
      recommendations.push("Considerar módulos de extensión y desafíos avanzados")
    }

    return recommendations
  }

  private generateParentGuidance(output: number[], data: EnhancedPredictionInput): string[] {
    const guidance: string[] = []

    guidance.push("Mantener rutina de estudio consistente en casa")
    guidance.push("Celebrar pequeños logros para mantener motivación")
    guidance.push("Proporcionar ambiente de estudio libre de distracciones")

    if (output[2] > 0.5) {
      // Riesgo moderado-alto
      guidance.push("Aumentar comunicación con el docente sobre progreso")
      guidance.push("Considerar apoyo adicional o tutoría especializada")
    }

    return guidance
  }

  private generateTeacherActions(output: number[], data: EnhancedPredictionInput): string[] {
    const actions: string[] = []

    actions.push("Documentar patrones de rendimiento y ajustar estrategias semanalmente")
    actions.push("Mantener comunicación regular con padres sobre progreso")

    if (output[10] > 0.6) {
      // Intervención necesaria
      actions.push("Implementar plan de intervención personalizado inmediatamente")
      actions.push("Coordinar con especialistas en dislexia si es necesario")
    }

    actions.push("Usar datos de la IA para informar decisiones pedagógicas")

    return actions
  }

  private identifyRiskFactors(
    output: number[],
    data: EnhancedPredictionInput,
  ): {
    factor: string
    severity: "bajo" | "medio" | "alto"
    mitigation: string
  }[] {
    const riskFactors: { factor: string; severity: "bajo" | "medio" | "alto"; mitigation: string }[] = []

    if (output[2] > 0.7) {
      riskFactors.push({
        factor: "Alto riesgo de abandono",
        severity: "alto",
        mitigation: "Implementar estrategias de motivación inmediatas y reducir dificultad temporalmente",
      })
    }

    if (data.consistencyScores.some((score) => score < 30)) {
      riskFactors.push({
        factor: "Inconsistencia en el rendimiento",
        severity: "medio",
        mitigation: "Establecer rutinas más estructuradas y monitoreo frecuente",
      })
    }

    if (data.motivationIndicators.some((indicator) => indicator < 40)) {
      riskFactors.push({
        factor: "Baja motivación",
        severity: "medio",
        mitigation: "Incorporar elementos de gamificación y recompensas personalizadas",
      })
    }

    return riskFactors
  }

  private getProjectedOutcome(probability: number): string {
    if (probability > 0.85) return "Excelente - Dominio completo de habilidades esperado"
    if (probability > 0.7) return "Muy Bueno - Alta probabilidad de éxito con apoyo mínimo"
    if (probability > 0.55) return "Bueno - Progreso satisfactorio con apoyo regular"
    if (probability > 0.4) return "Regular - Requiere apoyo intensivo y seguimiento cercano"
    return "Preocupante - Necesita intervención especializada inmediata"
  }

  private getTrend(value: number): string {
    if (value > 0.65) return "mejorando"
    if (value < 0.35) return "empeorando"
    return "estable"
  }

  private getEngagementTrend(value: number): string {
    if (value > 0.7) return "alta"
    if (value < 0.4) return "baja"
    return "media"
  }

  private getOverallTrajectory(trendValues: number[]): string {
    const average = trendValues.reduce((sum, val) => sum + val, 0) / trendValues.length
    if (average > 0.65) return "positiva"
    if (average < 0.35) return "preocupante"
    return "neutral"
  }

  private calculateDataQuality(data: EnhancedPredictionInput): number {
    let quality = 0
    let factors = 0

    // Calidad basada en datos de progreso
    const progressDataPoints = data.currentProgress.filter((p) => p > 0).length
    quality += (progressDataPoints / 6) * 0.25
    factors += 0.25

    // Calidad basada en tendencias de precisión
    const accuracyDataPoints = data.accuracyTrends.filter((a) => a > 0).length
    quality += (accuracyDataPoints / 6) * 0.2
    factors += 0.2

    // Calidad basada en frecuencia de sesiones
    const sessionDataPoints = data.sessionFrequency.filter((s) => s > 0).length
    quality += (sessionDataPoints / 4) * 0.2
    factors += 0.2

    // Calidad basada en indicadores de motivación
    const motivationDataPoints = data.motivationIndicators.filter((m) => m > 0).length
    quality += (motivationDataPoints / 4) * 0.15
    factors += 0.15

    // Calidad basada en velocidad de aprendizaje
    const velocityDataPoints = data.learningVelocity.filter((v) => v > 0).length
    quality += (velocityDataPoints / 3) * 0.1
    factors += 0.1

    // Calidad basada en consistencia
    const consistencyDataPoints = data.consistencyScores.filter((c) => c > 0).length
    quality += (consistencyDataPoints / 3) * 0.1
    factors += 0.1

    return Math.min(quality / factors, 1)
  }

  public predict(data: EnhancedPredictionInput): EnhancedPredictionResult {
    const normalizedInput = this.normalizeInput(data)
    const output = this.forwardPass(normalizedInput)
    return this.interpretOutput(output, data)
  }
}

export { EnhancedPredictionNetwork, type EnhancedPredictionInput, type EnhancedPredictionResult }
