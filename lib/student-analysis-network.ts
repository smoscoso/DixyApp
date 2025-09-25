/**
 * Red Neuronal para Análisis de Progreso Estudiantil
 * Genera observaciones automáticas basadas en el desempeño en los módulos
 */

interface StudentAnalysisInput {
  // Datos de progreso por módulo (normalizado 0-1)
  module1Progress: number
  module2Progress: number
  module3Progress: number
  module4Progress: number
  module5Progress: number
  module6Progress: number

  // Precisión por módulo (0-1)
  module1Accuracy: number
  module2Accuracy: number
  module3Accuracy: number
  module4Accuracy: number
  module5Accuracy: number
  module6Accuracy: number

  // Datos del estudiante (normalizados)
  age: number // normalizado 5-18 años -> 0-1
  dyslexiaLevel: number // leve=0.33, moderado=0.66, severo=1.0
  dyslexiaType: number // fonologica=0.25, superficial=0.5, mixta=0.75, kinestesica=1.0
  hasKinestheticDyslexia: number // 0 o 1

  // Métricas temporales
  averageSessionTime: number // normalizado
  consistencyScore: number // qué tan consistente es el estudiante
  improvementRate: number // tasa de mejora
}

interface StudentObservation {
  overallPerformance: "excelente" | "bueno" | "regular" | "necesita_apoyo"
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  riskLevel: "bajo" | "medio" | "alto"
  motivationLevel: "alta" | "media" | "baja"
  detailedAnalysis: string
}

interface StudentData {
  studentId: string
  name: string
  age: number
  dyslexiaLevel: string
  dyslexiaType: string
  hasKinestheticDyslexia: boolean
  progressData: {
    moduleId: number
    progress: number
    accuracy: number
    attempts: number
    lastActivity: Date
  }[]
}

interface AnalysisResult {
  overallPerformance: "excelente" | "bueno" | "regular" | "necesita_apoyo"
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  riskLevel: "bajo" | "medio" | "alto"
  motivationLevel: "alta" | "media" | "baja"
  detailedAnalysis: string
}

class StudentAnalysisNetwork {
  private inputNodes = 16
  private hiddenNodes1 = 24
  private hiddenNodes2 = 16
  private outputNodes = 12 // Diferentes aspectos del análisis

  private weights: {
    input_hidden1: number[][]
    hidden1_hidden2: number[][]
    hidden2_output: number[][]
  }

  constructor() {
    // Inicializar pesos preentrenados
    this.weights = {
      input_hidden1: this.initializeWeights(this.inputNodes, this.hiddenNodes1),
      hidden1_hidden2: this.initializeWeights(this.hiddenNodes1, this.hiddenNodes2),
      hidden2_output: this.initializeWeights(this.hiddenNodes2, this.outputNodes),
    }
  }

  private initializeWeights(inputSize: number, outputSize: number): number[][] {
    const weights: number[][] = []
    for (let i = 0; i < inputSize; i++) {
      weights[i] = []
      for (let j = 0; j < outputSize; j++) {
        weights[i][j] = (Math.random() - 0.5) * 2 * Math.sqrt(6 / (inputSize + outputSize))
      }
    }
    return weights
  }

  private relu(x: number): number {
    return Math.max(0, x)
  }

  private tanh(x: number): number {
    return Math.tanh(x)
  }

  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x))
  }

  private normalizeInput(data: StudentData): number[] {
    const input: number[] = []

    // Datos del estudiante (4 valores)
    input.push(data.age / 18) // Normalizar edad
    input.push(data.dyslexiaLevel === "leve" ? 0.33 : data.dyslexiaLevel === "moderado" ? 0.66 : 1.0)
    input.push(
      data.dyslexiaType === "fonologica"
        ? 0.25
        : data.dyslexiaType === "superficial"
          ? 0.5
          : data.dyslexiaType === "mixta"
            ? 0.75
            : 1.0,
    )
    input.push(data.hasKinestheticDyslexia ? 1 : 0)

    // Progreso por módulo (6 módulos × 2 valores = 12 valores)
    for (let moduleId = 1; moduleId <= 6; moduleId++) {
      const moduleData = data.progressData.find((p) => p.moduleId === moduleId)
      if (moduleData) {
        input.push(moduleData.progress / 100) // Progreso normalizado
        input.push(moduleData.accuracy / 100) // Precisión normalizada
      } else {
        input.push(0) // Sin progreso
        input.push(0) // Sin precisión
      }
    }

    return input
  }

  private forwardPass(input: number[]): number[] {
    // Capa oculta 1
    const hidden1 = new Array(this.hiddenNodes1).fill(0)
    for (let j = 0; j < this.hiddenNodes1; j++) {
      let sum = 0
      for (let i = 0; i < this.inputNodes; i++) {
        sum += input[i] * this.weights.input_hidden1[i][j]
      }
      hidden1[j] = this.relu(sum)
    }

    // Capa oculta 2
    const hidden2 = new Array(this.hiddenNodes2).fill(0)
    for (let j = 0; j < this.hiddenNodes2; j++) {
      let sum = 0
      for (let i = 0; i < this.hiddenNodes1; i++) {
        sum += hidden1[i] * this.weights.hidden1_hidden2[i][j]
      }
      hidden2[j] = this.tanh(sum)
    }

    // Capa de salida
    const output = new Array(this.outputNodes).fill(0)
    for (let j = 0; j < this.outputNodes; j++) {
      let sum = 0
      for (let i = 0; i < this.hiddenNodes2; i++) {
        sum += hidden2[i] * this.weights.hidden2_output[i][j]
      }
      output[j] = this.sigmoid(sum)
    }

    return output
  }

  private interpretOutput(output: number[], data: StudentData): AnalysisResult {
    // Interpretar las salidas de la red neuronal
    const overallPerformance = this.getPerformanceLevel(output[0])
    const riskLevel = this.getRiskLevel(output[1])
    const motivationLevel = this.getMotivationLevel(output[2])

    // Generar fortalezas basadas en las salidas
    const strengths = this.generateStrengths(output.slice(3, 6), data)
    const weaknesses = this.generateWeaknesses(output.slice(6, 9), data)
    const recommendations = this.generateRecommendations(output.slice(9, 12), data, riskLevel)

    const detailedAnalysis = this.generateDetailedAnalysis(data, overallPerformance, riskLevel, motivationLevel)

    return {
      overallPerformance,
      strengths,
      weaknesses,
      recommendations,
      riskLevel,
      motivationLevel,
      detailedAnalysis,
    }
  }

  private getPerformanceLevel(value: number): "excelente" | "bueno" | "regular" | "necesita_apoyo" {
    if (value > 0.8) return "excelente"
    if (value > 0.6) return "bueno"
    if (value > 0.4) return "regular"
    return "necesita_apoyo"
  }

  private getRiskLevel(value: number): "bajo" | "medio" | "alto" {
    if (value > 0.7) return "alto"
    if (value > 0.4) return "medio"
    return "bajo"
  }

  private getMotivationLevel(value: number): "alta" | "media" | "baja" {
    if (value > 0.7) return "alta"
    if (value > 0.4) return "media"
    return "baja"
  }

  private generateStrengths(strengthOutputs: number[], data: StudentData): string[] {
    const strengths: string[] = []
    const strengthCategories = [
      "Excelente procesamiento fonológico y reconocimiento de sonidos",
      "Fuerte capacidad de reconocimiento visual de patrones",
      "Buena coordinación motriz y habilidades kinestésicas",
    ]

    strengthOutputs.forEach((value, index) => {
      if (value > 0.6) {
        strengths.push(strengthCategories[index])
      }
    })

    // Agregar fortalezas específicas basadas en el progreso
    const avgProgress = data.progressData.reduce((sum, p) => sum + p.progress, 0) / data.progressData.length
    if (avgProgress > 70) {
      strengths.push("Muestra consistencia en el aprendizaje y progreso constante")
    }

    const avgAccuracy = data.progressData.reduce((sum, p) => sum + p.accuracy, 0) / data.progressData.length
    if (avgAccuracy > 80) {
      strengths.push("Alta precisión en la resolución de ejercicios")
    }

    return strengths.slice(0, 4) // Limitar a 4 fortalezas
  }

  private generateWeaknesses(weaknessOutputs: number[], data: StudentData): string[] {
    const weaknesses: string[] = []
    const weaknessCategories = [
      "Dificultades en el procesamiento secuencial de información",
      "Necesita refuerzo en reconocimiento de patrones visuales",
      "Requiere más práctica en coordinación motriz fina",
    ]

    weaknessOutputs.forEach((value, index) => {
      if (value > 0.6) {
        weaknesses.push(weaknessCategories[index])
      }
    })

    // Agregar debilidades específicas basadas en el progreso
    const lowProgressModules = data.progressData.filter((p) => p.progress < 30)
    if (lowProgressModules.length > 0) {
      weaknesses.push(`Progreso lento en ${lowProgressModules.length} módulo(s)`)
    }

    const lowAccuracyModules = data.progressData.filter((p) => p.accuracy < 60)
    if (lowAccuracyModules.length > 0) {
      weaknesses.push("Necesita mejorar la precisión en algunos ejercicios")
    }

    return weaknesses.slice(0, 3) // Limitar a 3 debilidades
  }

  private generateRecommendations(recOutputs: number[], data: StudentData, riskLevel: string): string[] {
    const recommendations: string[] = []

    // Recomendaciones basadas en el nivel de riesgo
    if (riskLevel === "alto") {
      recommendations.push("Requiere atención inmediata y sesiones de refuerzo adicionales")
      recommendations.push("Considerar reducir la dificultad temporalmente")
    } else if (riskLevel === "medio") {
      recommendations.push("Beneficiaría de sesiones de práctica más frecuentes")
      recommendations.push("Monitorear progreso semanalmente")
    }

    // Recomendaciones específicas por tipo de dislexia
    switch (data.dyslexiaType) {
      case "fonologica":
        recommendations.push("Enfocarse en ejercicios de conciencia fonológica")
        recommendations.push("Usar técnicas multisensoriales para el aprendizaje")
        break
      case "superficial":
        recommendations.push("Practicar reconocimiento visual de palabras")
        recommendations.push("Trabajar con patrones ortográficos")
        break
      case "mixta":
        recommendations.push("Combinar estrategias fonológicas y visuales")
        recommendations.push("Alternar entre diferentes tipos de ejercicios")
        break
      case "kinestesica":
        recommendations.push("Incorporar más actividades de movimiento")
        recommendations.push("Usar técnicas de aprendizaje táctil")
        break
    }

    // Recomendaciones basadas en módulos con bajo rendimiento
    const strugglingModules = data.progressData.filter((p) => p.progress < 50 || p.accuracy < 70)
    if (strugglingModules.length > 0) {
      recommendations.push(`Dedicar tiempo extra a los módulos ${strugglingModules.map((m) => m.moduleId).join(", ")}`)
    }

    return recommendations.slice(0, 5) // Limitar a 5 recomendaciones
  }

  private generateDetailedAnalysis(data: StudentData, performance: string, risk: string, motivation: string): string {
    const avgProgress = data.progressData.reduce((sum, p) => sum + p.progress, 0) / data.progressData.length
    const avgAccuracy = data.progressData.reduce((sum, p) => sum + p.accuracy, 0) / data.progressData.length
    const totalAttempts = data.progressData.reduce((sum, p) => sum + p.attempts, 0)

    let analysis = `${data.name} presenta un rendimiento ${performance} con un nivel de riesgo ${risk}. `

    analysis += `Su progreso promedio es del ${Math.round(avgProgress)}% con una precisión del ${Math.round(avgAccuracy)}%. `

    if (motivation === "alta") {
      analysis += "Muestra alta motivación y compromiso con las actividades. "
    } else if (motivation === "media") {
      analysis += "Su nivel de motivación es moderado, podría beneficiarse de estrategias de gamificación. "
    } else {
      analysis += "Presenta baja motivación, requiere estrategias especiales para mantener el interés. "
    }

    analysis += `Ha realizado ${totalAttempts} intentos en total, lo que indica ${
      totalAttempts > 100 ? "alta" : totalAttempts > 50 ? "moderada" : "baja"
    } actividad en la plataforma. `

    // Análisis específico por tipo de dislexia
    switch (data.dyslexiaType) {
      case "fonologica":
        analysis +=
          "Su perfil de dislexia fonológica sugiere enfocarse en el procesamiento de sonidos y la conciencia fonológica."
        break
      case "superficial":
        analysis += "Con dislexia superficial, se beneficia más de estrategias visuales y reconocimiento de patrones."
        break
      case "mixta":
        analysis += "Su dislexia mixta requiere un enfoque combinado de estrategias fonológicas y visuales."
        break
      case "kinestesica":
        analysis += "Su perfil kinestésico indica la necesidad de incorporar movimiento y actividades táctiles."
        break
    }

    return analysis
  }

  public analyzeStudent(data: StudentData): AnalysisResult {
    const normalizedInput = this.normalizeInput(data)
    const output = this.forwardPass(normalizedInput)
    return this.interpretOutput(output, data)
  }
}

// Función helper para normalizar datos de entrada
export function normalizeStudentData(progressData: any[], student: any): StudentAnalysisInput {
  // Calcular progreso y precisión por módulo
  const moduleStats = Array(6)
    .fill(0)
    .map((_, i) => {
      const moduleData = progressData.filter((p) => p.module === i + 1)
      const totalAttempts = moduleData.reduce((sum, p) => sum + p.attempts, 0)
      const totalSuccesses = moduleData.reduce((sum, p) => sum + p.successes, 0)
      const completedLevels = moduleData.filter((p) => p.successes > 0).length

      return {
        progress: completedLevels / 10, // 10 niveles por módulo
        accuracy: totalAttempts > 0 ? totalSuccesses / totalAttempts : 0,
      }
    })

  // Normalizar edad (5-18 años -> 0-1)
  const normalizedAge = (student.age - 5) / 13

  // Normalizar nivel de dislexia
  const dyslexiaLevelMap = { leve: 0.33, moderado: 0.66, severo: 1.0 }
  const normalizedDyslexiaLevel = dyslexiaLevelMap[student.dyslexiaLevel as keyof typeof dyslexiaLevelMap] || 0.33

  // Normalizar tipo de dislexia
  const dyslexiaTypeMap = { fonologica: 0.25, superficial: 0.5, mixta: 0.75, kinestesica: 1.0 }
  const normalizedDyslexiaType = dyslexiaTypeMap[student.dyslexiaType as keyof typeof dyslexiaTypeMap] || 0.25

  // Calcular métricas adicionales
  const averageProgress = moduleStats.reduce((sum, m) => sum + m.progress, 0) / 6
  const averageAccuracy = moduleStats.reduce((sum, m) => sum + m.accuracy, 0) / 6
  const consistencyScore =
    1 - (Math.max(...moduleStats.map((m) => m.progress)) - Math.min(...moduleStats.map((m) => m.progress)))

  return {
    module1Progress: moduleStats[0].progress,
    module2Progress: moduleStats[1].progress,
    module3Progress: moduleStats[2].progress,
    module4Progress: moduleStats[3].progress,
    module5Progress: moduleStats[4].progress,
    module6Progress: moduleStats[5].progress,
    module1Accuracy: moduleStats[0].accuracy,
    module2Accuracy: moduleStats[1].accuracy,
    module3Accuracy: moduleStats[2].accuracy,
    module4Accuracy: moduleStats[3].accuracy,
    module5Accuracy: moduleStats[4].accuracy,
    module6Accuracy: moduleStats[5].accuracy,
    age: normalizedAge,
    dyslexiaLevel: normalizedDyslexiaLevel,
    dyslexiaType: normalizedDyslexiaType,
    hasKinestheticDyslexia: student.hasKinestheticDyslexia ? 1 : 0,
    averageSessionTime: 0.5, // Placeholder - se puede calcular con datos reales
    consistencyScore: consistencyScore,
    improvementRate: averageProgress, // Placeholder - se puede calcular con datos históricos
  }
}

export { StudentAnalysisNetwork, type StudentData, type AnalysisResult }
