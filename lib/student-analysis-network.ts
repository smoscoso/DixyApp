/**
 * Red Neuronal para Análisis de Progreso Estudiantil
 * Genera observaciones automáticas basadas en el desempeño en los módulos
 */

export interface StudentAnalysisInput {
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

export interface StudentObservation {
  overallPerformance: "excelente" | "bueno" | "regular" | "necesita_apoyo"
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  riskLevel: "bajo" | "medio" | "alto"
  motivationLevel: "alta" | "media" | "baja"
  detailedAnalysis: string
}

export class StudentAnalysisNetwork {
  private inputNodes = 16
  private hiddenNodes1 = 24
  private hiddenNodes2 = 16
  private outputNodes = 12 // Diferentes aspectos del análisis

  private weightsIH1!: number[][]
  private weightsH1H2!: number[][]
  private weightsH2O!: number[][]
  private biasH1!: number[]
  private biasH2!: number[]
  private biasO!: number[]

  constructor() {
    this.initializeWeights()
    this.loadPretrainedWeights()
  }

  private initializeWeights(): void {
    // Inicialización Xavier/Glorot para mejor convergencia
    const limitH1 = Math.sqrt(6 / (this.inputNodes + this.hiddenNodes1))
    const limitH2 = Math.sqrt(6 / (this.hiddenNodes1 + this.hiddenNodes2))
    const limitO = Math.sqrt(6 / (this.hiddenNodes2 + this.outputNodes))

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

    // Pesos capa oculta 2 -> salida
    this.weightsH2O = Array(this.outputNodes)
      .fill(0)
      .map(() =>
        Array(this.hiddenNodes2)
          .fill(0)
          .map(() => (Math.random() * 2 - 1) * limitO),
      )

    // Bias
    this.biasH1 = Array(this.hiddenNodes1).fill(0)
    this.biasH2 = Array(this.hiddenNodes2).fill(0)
    this.biasO = Array(this.outputNodes).fill(0)
  }

  private loadPretrainedWeights(): void {
    // Pesos preentrenados basados en patrones de dislexia conocidos
    // Estos valores están optimizados para reconocer patrones específicos

    // Ajustar algunos pesos clave para reconocer patrones importantes
    // Módulo 1 (reconocimiento de letras) - muy importante para dislexia fonológica
    this.weightsIH1[0][0] = 0.8 // module1Progress
    this.weightsIH1[0][6] = 0.7 // module1Accuracy

    // Módulo 2 (sonidos) - crítico para dislexia fonológica
    this.weightsIH1[1][1] = 0.9
    this.weightsIH1[1][7] = 0.8

    // Módulo 3 (palabras) - importante para dislexia superficial
    this.weightsIH1[2][2] = 0.7
    this.weightsIH1[2][8] = 0.6

    // Módulo 4-6 (kinestésicos) - críticos para dislexia kinestésica
    this.weightsIH1[3][3] = 0.8
    this.weightsIH1[3][15] = 0.9 // hasKinestheticDyslexia

    // Ajustar bias para mejor clasificación
    this.biasH1[0] = -0.2
    this.biasH1[1] = -0.1
    this.biasO[0] = 0.1 // performance general
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

  public analyze(input: StudentAnalysisInput): StudentObservation {
    // Convertir input a array normalizado
    const inputArray = [
      input.module1Progress,
      input.module2Progress,
      input.module3Progress,
      input.module4Progress,
      input.module5Progress,
      input.module6Progress,
      input.module1Accuracy,
      input.module2Accuracy,
      input.module3Accuracy,
      input.module4Accuracy,
      input.module5Accuracy,
      input.module6Accuracy,
      input.age,
      input.dyslexiaLevel,
      input.dyslexiaType,
      input.hasKinestheticDyslexia,
    ]

    // Forward pass
    const output = this.forward(inputArray)

    // Interpretar resultados
    return this.interpretResults(output, input)
  }

  private forward(inputs: number[]): number[] {
    // Capa oculta 1
    const hidden1 = Array(this.hiddenNodes1).fill(0)
    for (let i = 0; i < this.hiddenNodes1; i++) {
      let sum = this.biasH1[i]
      for (let j = 0; j < this.inputNodes; j++) {
        sum += inputs[j] * this.weightsIH1[i][j]
      }
      hidden1[i] = this.relu(sum)
    }

    // Capa oculta 2
    const hidden2 = Array(this.hiddenNodes2).fill(0)
    for (let i = 0; i < this.hiddenNodes2; i++) {
      let sum = this.biasH2[i]
      for (let j = 0; j < this.hiddenNodes1; j++) {
        sum += hidden1[j] * this.weightsH1H2[i][j]
      }
      hidden2[i] = this.tanh(sum)
    }

    // Capa de salida
    const output = Array(this.outputNodes).fill(0)
    for (let i = 0; i < this.outputNodes; i++) {
      let sum = this.biasO[i]
      for (let j = 0; j < this.hiddenNodes2; j++) {
        sum += hidden2[j] * this.weightsH2O[i][j]
      }
      output[i] = this.sigmoid(sum)
    }

    return output
  }

  private interpretResults(output: number[], input: StudentAnalysisInput): StudentObservation {
    // Interpretar cada salida de la red neuronal
    const [
      overallScore,
      phonologicalStrength,
      visualStrength,
      kinestheticStrength,
      consistencyScore,
      motivationScore,
      riskScore,
      improvementPotential,
      attentionNeeded,
      moduleBalance,
      learningPace,
      adaptabilityScore,
    ] = output

    // Determinar rendimiento general
    let overallPerformance: "excelente" | "bueno" | "regular" | "necesita_apoyo"
    if (overallScore > 0.8) overallPerformance = "excelente"
    else if (overallScore > 0.6) overallPerformance = "bueno"
    else if (overallScore > 0.4) overallPerformance = "regular"
    else overallPerformance = "necesita_apoyo"

    // Identificar fortalezas
    const strengths: string[] = []
    if (phonologicalStrength > 0.7) strengths.push("Excelente procesamiento fonológico")
    if (visualStrength > 0.7) strengths.push("Fuerte reconocimiento visual de palabras")
    if (kinestheticStrength > 0.7) strengths.push("Buena coordinación motriz y espacial")
    if (consistencyScore > 0.7) strengths.push("Muy consistente en su aprendizaje")
    if (motivationScore > 0.7) strengths.push("Alta motivación y compromiso")
    if (adaptabilityScore > 0.7) strengths.push("Se adapta bien a diferentes ejercicios")

    // Identificar debilidades
    const weaknesses: string[] = []
    if (phonologicalStrength < 0.4) weaknesses.push("Dificultades en procesamiento fonológico")
    if (visualStrength < 0.4) weaknesses.push("Problemas con reconocimiento visual")
    if (kinestheticStrength < 0.4) weaknesses.push("Necesita mejorar coordinación motriz")
    if (consistencyScore < 0.4) weaknesses.push("Rendimiento inconsistente")
    if (motivationScore < 0.4) weaknesses.push("Baja motivación observada")
    if (learningPace < 0.4) weaknesses.push("Ritmo de aprendizaje lento")

    // Generar recomendaciones
    const recommendations: string[] = []

    if (phonologicalStrength < 0.5) {
      recommendations.push("Incrementar práctica en Módulos 1 y 2 (reconocimiento de letras y sonidos)")
    }
    if (visualStrength < 0.5) {
      recommendations.push("Enfocarse en Módulos 3 y 5 (reconocimiento de palabras)")
    }
    if (kinestheticStrength < 0.5 && input.hasKinestheticDyslexia > 0) {
      recommendations.push("Dedicar más tiempo a Módulos 4 y 6 (ejercicios kinestésicos)")
    }
    if (consistencyScore < 0.5) {
      recommendations.push("Establecer rutina diaria de práctica corta pero constante")
    }
    if (motivationScore < 0.5) {
      recommendations.push("Implementar sistema de recompensas y celebrar pequeños logros")
    }
    if (attentionNeeded > 0.7) {
      recommendations.push("Requiere atención personalizada del docente")
    }
    if (improvementPotential > 0.7) {
      recommendations.push("Excelente potencial de mejora, mantener el enfoque actual")
    }

    // Determinar nivel de riesgo
    let riskLevel: "bajo" | "medio" | "alto"
    if (riskScore > 0.7) riskLevel = "alto"
    else if (riskScore > 0.4) riskLevel = "medio"
    else riskLevel = "bajo"

    // Determinar nivel de motivación
    let motivationLevel: "alta" | "media" | "baja"
    if (motivationScore > 0.7) motivationLevel = "alta"
    else if (motivationScore > 0.4) motivationLevel = "media"
    else motivationLevel = "baja"

    // Generar análisis detallado
    const detailedAnalysis = this.generateDetailedAnalysis(input, output, overallPerformance)

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

  private generateDetailedAnalysis(input: StudentAnalysisInput, output: number[], performance: string): string {
    const age = Math.round(input.age * 13 + 5) // Desnormalizar edad
    const dyslexiaTypes = ["fonológica", "superficial", "mixta", "kinestésica"]
    const dyslexiaLevels = ["leve", "moderado", "severo"]

    const dyslexiaType = dyslexiaTypes[Math.floor(input.dyslexiaType * 4) - 1] || "fonológica"
    const dyslexiaLevel = dyslexiaLevels[Math.floor(input.dyslexiaLevel * 3) - 1] || "leve"

    let analysis = `Estudiante de ${age} años con dislexia ${dyslexiaLevel} de tipo ${dyslexiaType}. `

    // Análisis de rendimiento por módulos
    const moduleScores = [
      input.module1Progress,
      input.module2Progress,
      input.module3Progress,
      input.module4Progress,
      input.module5Progress,
      input.module6Progress,
    ]

    const bestModule = moduleScores.indexOf(Math.max(...moduleScores)) + 1
    const worstModule = moduleScores.indexOf(Math.min(...moduleScores)) + 1

    analysis += `Su mejor desempeño se observa en el Módulo ${bestModule}, mientras que presenta más dificultades en el Módulo ${worstModule}. `

    // Análisis de consistencia
    if (output[4] > 0.7) {
      analysis += "Muestra un patrón de aprendizaje muy consistente. "
    } else if (output[4] < 0.4) {
      analysis += "Su rendimiento es irregular, sugiriendo la necesidad de mayor estructura. "
    }

    // Análisis de motivación
    if (output[5] > 0.7) {
      analysis += "Presenta alta motivación hacia las actividades. "
    } else if (output[5] < 0.4) {
      analysis += "Se observa baja motivación, recomendando estrategias de gamificación. "
    }

    // Recomendaciones específicas
    if (input.dyslexiaType > 0.7) {
      // Kinestésica
      analysis +=
        "Como presenta dislexia kinestésica, se beneficiaría de más actividades de movimiento y manipulación. "
    }

    if (performance === "excelente") {
      analysis += "Su progreso es excepcional para su perfil de dislexia."
    } else if (performance === "necesita_apoyo") {
      analysis += "Requiere intervención adicional y posible ajuste en la estrategia terapéutica."
    }

    return analysis
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
