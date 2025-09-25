interface PredictionInput {
  studentId: string
  currentProgress: number[]
  accuracyTrends: number[]
  sessionFrequency: number[]
  motivationIndicators: number[]
  dyslexiaProfile: {
    level: string
    type: string
    hasKinesthetic: boolean
  }
}

interface PredictionResult {
  shortTerm: {
    expectedProgress: number
    expectedAccuracy: number
    riskOfDropout: number
    timeframe: "1-2 semanas"
  }
  mediumTerm: {
    modulesToComplete: number[]
    estimatedCompletionTime: number
    interventionNeeded: boolean
    timeframe: "1 mes"
  }
  longTerm: {
    overallSuccessProbability: number
    recommendedInterventions: string[]
    projectedOutcome: string
    timeframe: "3 meses"
  }
  trends: {
    progressTrend: "mejorando" | "estable" | "empeorando"
    accuracyTrend: "mejorando" | "estable" | "empeorando"
    engagementTrend: "alta" | "media" | "baja"
    overallTrajectory: "positiva" | "neutral" | "preocupante"
  }
  confidence: number
}

class PredictionNetwork {
  private weights: {
    input_hidden1: number[][]
    hidden1_hidden2: number[][]
    hidden2_hidden3: number[][]
    hidden3_output: number[][]
  }

  constructor() {
    this.weights = {
      input_hidden1: this.initializeWeights(20, 32),
      hidden1_hidden2: this.initializeWeights(32, 24),
      hidden2_hidden3: this.initializeWeights(24, 16),
      hidden3_output: this.initializeWeights(16, 15),
    }
  }

  private initializeWeights(inputSize: number, outputSize: number): number[][] {
    const weights: number[][] = []
    for (let i = 0; i < inputSize; i++) {
      weights[i] = []
      for (let j = 0; j < outputSize; j++) {
        // Xavier initialization
        weights[i][j] = (Math.random() - 0.5) * 2 * Math.sqrt(6 / (inputSize + outputSize))
      }
    }
    return weights
  }

  private relu(x: number): number {
    return Math.max(0, x)
  }

  private leakyRelu(x: number): number {
    return x > 0 ? x : 0.01 * x
  }

  private tanh(x: number): number {
    return Math.tanh(x)
  }

  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x))
  }

  private normalizeInput(data: PredictionInput): number[] {
    const input: number[] = []

    // Progreso actual (6 valores - uno por módulo)
    for (let i = 0; i < 6; i++) {
      input.push((data.currentProgress[i] || 0) / 100)
    }

    // Tendencias de precisión (4 valores - últimas 4 semanas)
    for (let i = 0; i < 4; i++) {
      input.push((data.accuracyTrends[i] || 0) / 100)
    }

    // Frecuencia de sesiones (4 valores - últimas 4 semanas)
    for (let i = 0; i < 4; i++) {
      input.push(Math.min((data.sessionFrequency[i] || 0) / 10, 1)) // Normalizar a máximo 10 sesiones por semana
    }

    // Indicadores de motivación (3 valores)
    for (let i = 0; i < 3; i++) {
      input.push((data.motivationIndicators[i] || 0) / 100)
    }

    // Perfil de dislexia (3 valores)
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

    return input
  }

  private forwardPass(input: number[]): number[] {
    // Capa oculta 1
    const hidden1 = new Array(32).fill(0)
    for (let j = 0; j < 32; j++) {
      let sum = 0
      for (let i = 0; i < 20; i++) {
        sum += input[i] * this.weights.input_hidden1[i][j]
      }
      hidden1[j] = this.leakyRelu(sum)
    }

    // Capa oculta 2
    const hidden2 = new Array(24).fill(0)
    for (let j = 0; j < 24; j++) {
      let sum = 0
      for (let i = 0; i < 32; i++) {
        sum += hidden1[i] * this.weights.hidden1_hidden2[i][j]
      }
      hidden2[j] = this.relu(sum)
    }

    // Capa oculta 3
    const hidden3 = new Array(16).fill(0)
    for (let j = 0; j < 16; j++) {
      let sum = 0
      for (let i = 0; i < 24; i++) {
        sum += hidden2[i] * this.weights.hidden2_hidden3[i][j]
      }
      hidden3[j] = this.tanh(sum)
    }

    // Capa de salida
    const output = new Array(15).fill(0)
    for (let j = 0; j < 15; j++) {
      let sum = 0
      for (let i = 0; i < 16; i++) {
        sum += hidden3[i] * this.weights.hidden3_output[i][j]
      }
      output[j] = this.sigmoid(sum)
    }

    return output
  }

  private interpretOutput(output: number[], data: PredictionInput): PredictionResult {
    // Predicciones a corto plazo
    const shortTerm = {
      expectedProgress: Math.round(output[0] * 100),
      expectedAccuracy: Math.round(output[1] * 100),
      riskOfDropout: Math.round(output[2] * 100),
      timeframe: "1-2 semanas" as const,
    }

    // Predicciones a mediano plazo
    const mediumTerm = {
      modulesToComplete: this.predictModulesToComplete(output.slice(3, 6), data),
      estimatedCompletionTime: Math.round(output[6] * 12), // En semanas
      interventionNeeded: output[7] > 0.6,
      timeframe: "1 mes" as const,
    }

    // Predicciones a largo plazo
    const longTerm = {
      overallSuccessProbability: Math.round(output[8] * 100),
      recommendedInterventions: this.generateInterventions(output.slice(9, 12), data),
      projectedOutcome: this.getProjectedOutcome(output[8]),
      timeframe: "3 meses" as const,
    }

    // Tendencias
    const trends = {
      progressTrend: this.getTrend(output[12]) as "mejorando" | "estable" | "empeorando",
      accuracyTrend: this.getTrend(output[13]) as "mejorando" | "estable" | "empeorando",
      engagementTrend: this.getEngagementTrend(output[14]) as "alta" | "media" | "baja",
      overallTrajectory: this.getOverallTrajectory(output.slice(12, 15)) as "positiva" | "neutral" | "preocupante",
    }

    // Calcular confianza basada en la cantidad de datos disponibles
    const dataQuality = this.calculateDataQuality(data)
    const confidence = Math.round(dataQuality * 100)

    return {
      shortTerm,
      mediumTerm,
      longTerm,
      trends,
      confidence,
    }
  }

  private predictModulesToComplete(moduleOutputs: number[], data: PredictionInput): number[] {
    const modules: number[] = []
    const currentProgress = data.currentProgress

    moduleOutputs.forEach((probability, index) => {
      const moduleId = index + 1
      // Si el módulo no está completado y la probabilidad es alta
      if (currentProgress[index] < 100 && probability > 0.6) {
        modules.push(moduleId)
      }
    })

    return modules
  }

  private generateInterventions(interventionOutputs: number[], data: PredictionInput): string[] {
    const interventions: string[] = []

    if (interventionOutputs[0] > 0.7) {
      interventions.push("Implementar sesiones de refuerzo personalizadas")
    }

    if (interventionOutputs[1] > 0.6) {
      interventions.push("Ajustar metodología según tipo de dislexia")
    }

    if (interventionOutputs[2] > 0.5) {
      interventions.push("Incorporar estrategias de gamificación")
    }

    // Intervenciones específicas por tipo de dislexia
    switch (data.dyslexiaProfile.type) {
      case "fonologica":
        interventions.push("Enfocarse en ejercicios de conciencia fonológica")
        break
      case "superficial":
        interventions.push("Usar más estrategias visuales y reconocimiento de patrones")
        break
      case "mixta":
        interventions.push("Combinar estrategias fonológicas y visuales")
        break
      case "kinestesica":
        interventions.push("Incorporar más actividades de movimiento y táctiles")
        break
    }

    return interventions.slice(0, 4) // Limitar a 4 intervenciones
  }

  private getProjectedOutcome(probability: number): string {
    if (probability > 0.8) return "Excelente - Alta probabilidad de éxito completo"
    if (probability > 0.6) return "Bueno - Progreso satisfactorio esperado"
    if (probability > 0.4) return "Regular - Requiere apoyo adicional"
    return "Preocupante - Necesita intervención inmediata"
  }

  private getTrend(value: number): string {
    if (value > 0.6) return "mejorando"
    if (value < 0.4) return "empeorando"
    return "estable"
  }

  private getEngagementTrend(value: number): string {
    if (value > 0.7) return "alta"
    if (value < 0.4) return "baja"
    return "media"
  }

  private getOverallTrajectory(trendValues: number[]): string {
    const average = trendValues.reduce((sum, val) => sum + val, 0) / trendValues.length
    if (average > 0.6) return "positiva"
    if (average < 0.4) return "preocupante"
    return "neutral"
  }

  private calculateDataQuality(data: PredictionInput): number {
    let quality = 0
    let factors = 0

    // Calidad basada en datos de progreso
    const progressDataPoints = data.currentProgress.filter((p) => p > 0).length
    quality += (progressDataPoints / 6) * 0.3
    factors += 0.3

    // Calidad basada en tendencias de precisión
    const accuracyDataPoints = data.accuracyTrends.filter((a) => a > 0).length
    quality += (accuracyDataPoints / 4) * 0.25
    factors += 0.25

    // Calidad basada en frecuencia de sesiones
    const sessionDataPoints = data.sessionFrequency.filter((s) => s > 0).length
    quality += (sessionDataPoints / 4) * 0.25
    factors += 0.25

    // Calidad basada en indicadores de motivación
    const motivationDataPoints = data.motivationIndicators.filter((m) => m > 0).length
    quality += (motivationDataPoints / 3) * 0.2
    factors += 0.2

    return Math.min(quality / factors, 1)
  }

  public predict(data: PredictionInput): PredictionResult {
    const normalizedInput = this.normalizeInput(data)
    const output = this.forwardPass(normalizedInput)
    return this.interpretOutput(output, data)
  }
}

export { PredictionNetwork, type PredictionInput, type PredictionResult }
