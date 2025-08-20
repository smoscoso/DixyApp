/**
 * Implementación mejorada de una Red Neuronal con BackPropagation
 * Adaptada del código Python para el reconocimiento de letras dibujadas (Módulo 1)
 */
export default class NeuralNetwork {
  // Configuración de la red
  inputNodes: number
  hiddenNodes: number
  outputNodes: number
  learningRate: number
  maxEpochs: number
  precision: number
  momentum: boolean
  beta: number
  activationFunctions: string[]
  betaLeakyRelu: number

  // Pesos y bias (matrices)
  weightsIH!: number[][] // w_oculta en Python
  weightsHO!: number[][] // w_salida en Python
  biasH!: number[] // b_oculta en Python
  biasO!: number[] // b_salida en Python

  // Variables para momentum
  deltaWeightsIHPrev: number[][]
  deltaWeightsHOPrev: number[][]
  deltaBiasHPrev: number[]
  deltaBiasOPrev: number[]

  // Variables para seguimiento del entrenamiento
  currentEpoch: number
  currentError: number

  // Datos de entrenamiento
  trainingData: { input: boolean[]; output: number[] }[]

  // Variables temporales para forward pass
  hiddenInputs: number[]
  hiddenOutputs: number[]
  finalInputs: number[]
  finalOutputs: number[]

  constructor(inputNodes: number, hiddenNodes: number, outputNodes: number) {
    // Configuración básica
    this.inputNodes = inputNodes
    this.hiddenNodes = hiddenNodes
    this.outputNodes = outputNodes
    this.learningRate = 0.01 // alfa en Python
    this.maxEpochs = 100000
    this.precision = 0.01
    this.momentum = true
    this.beta = 0.9
    this.activationFunctions = ["sigmoid", "sigmoid"]
    this.betaLeakyRelu = 0.01

    // Inicializar pesos con inicialización Xavier/Glorot
    this.initializeWeights()

    // Inicializar variables para momentum
    this.deltaWeightsIHPrev = Array(this.hiddenNodes)
      .fill(0)
      .map(() => Array(this.inputNodes).fill(0))
    this.deltaWeightsHOPrev = Array(this.outputNodes)
      .fill(0)
      .map(() => Array(this.hiddenNodes).fill(0))
    this.deltaBiasHPrev = Array(this.hiddenNodes).fill(0)
    this.deltaBiasOPrev = Array(this.outputNodes).fill(0)

    // Variables para seguimiento
    this.currentEpoch = 0
    this.currentError = Number.POSITIVE_INFINITY

    // Inicializar datos de entrenamiento vacíos
    this.trainingData = []

    // Inicializar variables temporales
    this.hiddenInputs = Array(this.hiddenNodes).fill(0)
    this.hiddenOutputs = Array(this.hiddenNodes).fill(0)
    this.finalInputs = Array(this.outputNodes).fill(0)
    this.finalOutputs = Array(this.outputNodes).fill(0)
  }

  // Inicializar pesos con inicialización Xavier/Glorot
  initializeWeights(): void {
    // Límites para inicialización Xavier/Glorot
    const limitHidden = Math.sqrt(6 / (this.inputNodes + this.hiddenNodes))
    const limitOutput = Math.sqrt(6 / (this.hiddenNodes + this.outputNodes))

    // Inicializar pesos entre capa de entrada y oculta
    this.weightsIH = Array(this.hiddenNodes)
      .fill(0)
      .map(() =>
        Array(this.inputNodes)
          .fill(0)
          .map(() => (Math.random() * 2 - 1) * limitHidden),
      )

    // Inicializar pesos entre capa oculta y salida
    this.weightsHO = Array(this.outputNodes)
      .fill(0)
      .map(() =>
        Array(this.hiddenNodes)
          .fill(0)
          .map(() => (Math.random() * 2 - 1) * limitOutput),
      )

    // Inicializar bias con ceros
    this.biasH = Array(this.hiddenNodes).fill(0)
    this.biasO = Array(this.outputNodes).fill(0)
  }

  // Función de activación mejorada (equivalente a la función activacion en Python)
  activation(x: number, functionName: string, derivative = false): number {
    // Clamp para evitar overflow
    x = Math.max(-500, Math.min(500, x))

    switch (functionName) {
      case "sigmoid":
        if (derivative) {
          return x * (1 - x)
        }
        return 1 / (1 + Math.exp(-x))

      case "tanh":
        if (derivative) {
          return 1 - Math.pow(Math.tanh(x), 2)
        }
        return Math.tanh(x)

      case "relu":
        if (derivative) {
          return x > 0 ? 1 : 0
        }
        return Math.max(0, x)

      case "leaky_relu":
        if (derivative) {
          return x > 0 ? 1 : this.betaLeakyRelu
        }
        return x > 0 ? x : x * this.betaLeakyRelu

      case "linear":
        if (derivative) {
          return 1
        }
        return x

      case "softmax":
        // Softmax se maneja de manera especial
        if (derivative) {
          return x
        }
        return x // Se calcula en applyActivation para softmax

      default:
        // Por defecto, usar sigmoid
        if (derivative) {
          return x * (1 - x)
        }
        return 1 / (1 + Math.exp(-x))
    }
  }

  // Aplicar función de activación a un array
  applyActivation(array: number[], functionName: string, derivative = false): number[] {
    if (functionName === "softmax" && !derivative) {
      // Implementación especial para softmax
      const maxVal = Math.max(...array)
      const expValues = array.map((x) => Math.exp(x - maxVal))
      const sumExp = expValues.reduce((sum, val) => sum + val, 0)
      return expValues.map((val) => val / sumExp)
    }

    return array.map((x) => this.activation(x, functionName, derivative))
  }

  // Propagación hacia adelante (equivalente a forward en Python)
  forward(inputArray: boolean[]): number[] {
    // Convertir booleanos a números
    const inputs = inputArray.map((val) => (val ? 1.0 : 0.0))

    // Capa oculta: z_oculta = w_oculta * X + b_oculta
    for (let i = 0; i < this.hiddenNodes; i++) {
      let sum = this.biasH[i]
      for (let j = 0; j < this.inputNodes; j++) {
        sum += inputs[j] * this.weightsIH[i][j]
      }
      this.hiddenInputs[i] = sum
    }

    // Aplicar función de activación: a_oculta = activacion(z_oculta)
    this.hiddenOutputs = this.applyActivation(this.hiddenInputs, this.activationFunctions[0])

    // Capa de salida: z_salida = w_salida * a_oculta + b_salida
    for (let i = 0; i < this.outputNodes; i++) {
      let sum = this.biasO[i]
      for (let j = 0; j < this.hiddenNodes; j++) {
        sum += this.hiddenOutputs[j] * this.weightsHO[i][j]
      }
      this.finalInputs[i] = sum
    }

    // Aplicar función de activación: a_salida = activacion(z_salida)
    this.finalOutputs = this.applyActivation(this.finalInputs, this.activationFunctions[1])

    return [...this.finalOutputs]
  }

  // Propagación hacia atrás y actualización de pesos (equivalente a backward en Python)
  backward(inputArray: boolean[], targetArray: number[]): void {
    const inputs = inputArray.map((val) => (val ? 1.0 : 0.0))
    const m = 1 // Un ejemplo a la vez

    // Calcular error en la capa de salida
    let deltaOutput: number[]
    if (this.activationFunctions[1] === "softmax") {
      // Para softmax, el error es simplemente la diferencia
      deltaOutput = this.finalOutputs.map((output, i) => output - targetArray[i])
    } else {
      // Para otras funciones, multiplicar por la derivada
      const outputDerivatives = this.applyActivation(this.finalOutputs, this.activationFunctions[1], true)
      deltaOutput = this.finalOutputs.map((output, i) => (output - targetArray[i]) * outputDerivatives[i])
    }

    // Calcular error en la capa oculta
    const deltaHidden = Array(this.hiddenNodes).fill(0)
    for (let i = 0; i < this.hiddenNodes; i++) {
      for (let j = 0; j < this.outputNodes; j++) {
        deltaHidden[i] += deltaOutput[j] * this.weightsHO[j][i]
      }
    }

    // Multiplicar por la derivada de la función de activación oculta
    const hiddenDerivatives = this.applyActivation(this.hiddenOutputs, this.activationFunctions[0], true)
    for (let i = 0; i < this.hiddenNodes; i++) {
      deltaHidden[i] *= hiddenDerivatives[i]
    }

    // Calcular gradientes
    const dwOutput = Array(this.outputNodes)
      .fill(0)
      .map(() => Array(this.hiddenNodes).fill(0))
    const dbOutput = Array(this.outputNodes).fill(0)
    const dwHidden = Array(this.hiddenNodes)
      .fill(0)
      .map(() => Array(this.inputNodes).fill(0))
    const dbHidden = Array(this.hiddenNodes).fill(0)

    // Gradientes para la capa de salida
    for (let i = 0; i < this.outputNodes; i++) {
      for (let j = 0; j < this.hiddenNodes; j++) {
        dwOutput[i][j] = (deltaOutput[i] * this.hiddenOutputs[j]) / m
      }
      dbOutput[i] = deltaOutput[i] / m
    }

    // Gradientes para la capa oculta
    for (let i = 0; i < this.hiddenNodes; i++) {
      for (let j = 0; j < this.inputNodes; j++) {
        dwHidden[i][j] = (deltaHidden[i] * inputs[j]) / m
      }
      dbHidden[i] = deltaHidden[i] / m
    }

    // Actualización de pesos con momentum
    if (this.momentum) {
      // Actualizar pesos de salida con momentum
      for (let i = 0; i < this.outputNodes; i++) {
        for (let j = 0; j < this.hiddenNodes; j++) {
          const deltaWeight = -this.learningRate * dwOutput[i][j] + this.beta * this.deltaWeightsHOPrev[i][j]
          this.weightsHO[i][j] += deltaWeight
          this.deltaWeightsHOPrev[i][j] = deltaWeight
        }
        const deltaBias = -this.learningRate * dbOutput[i] + this.beta * this.deltaBiasOPrev[i]
        this.biasO[i] += deltaBias
        this.deltaBiasOPrev[i] = deltaBias
      }

      // Actualizar pesos ocultos con momentum
      for (let i = 0; i < this.hiddenNodes; i++) {
        for (let j = 0; j < this.inputNodes; j++) {
          const deltaWeight = -this.learningRate * dwHidden[i][j] + this.beta * this.deltaWeightsIHPrev[i][j]
          this.weightsIH[i][j] += deltaWeight
          this.deltaWeightsIHPrev[i][j] = deltaWeight
        }
        const deltaBias = -this.learningRate * dbHidden[i] + this.beta * this.deltaBiasHPrev[i]
        this.biasH[i] += deltaBias
        this.deltaBiasHPrev[i] = deltaBias
      }
    } else {
      // Actualización estándar sin momentum
      for (let i = 0; i < this.outputNodes; i++) {
        for (let j = 0; j < this.hiddenNodes; j++) {
          this.weightsHO[i][j] -= this.learningRate * dwOutput[i][j]
        }
        this.biasO[i] -= this.learningRate * dbOutput[i]
      }

      for (let i = 0; i < this.hiddenNodes; i++) {
        for (let j = 0; j < this.inputNodes; j++) {
          this.weightsIH[i][j] -= this.learningRate * dwHidden[i][j]
        }
        this.biasH[i] -= this.learningRate * dbHidden[i]
      }
    }
  }

  // Calcular error cuadrático medio (equivalente a calcular_error en Python)
  calculateError(targetArray: number[], outputArray: number[]): number {
    let sum = 0
    for (let i = 0; i < targetArray.length; i++) {
      sum += Math.pow(targetArray[i] - outputArray[i], 2)
    }
    return sum / (2 * targetArray.length)
  }

  // Entrenar la red con los datos proporcionados (equivalente a entrenar en Python)
  train(): void {
    console.log("Iniciando entrenamiento mejorado con algoritmo adaptado de Python...")

    const errors: number[] = []
    const startTime = Date.now()

    for (let epoch = 0; epoch < this.maxEpochs; epoch++) {
      this.currentEpoch = epoch + 1
      let totalError = 0

      // Mezclar los datos de entrenamiento para mejor convergencia
      const shuffledData = [...this.trainingData].sort(() => Math.random() - 0.5)

      // Entrenar con cada ejemplo
      for (const data of shuffledData) {
        // Forward pass
        const outputs = this.forward(data.input)

        // Calcular error
        const error = this.calculateError(data.output, outputs)
        totalError += error

        // Backward pass
        this.backward(data.input, data.output)
      }

      // Error promedio de esta época
      const avgError = totalError / this.trainingData.length
      this.currentError = avgError
      errors.push(avgError)

      // Mostrar progreso cada 1000 épocas
      if ((epoch + 1) % 1000 === 0 || epoch === 0) {
        const timeElapsed = (Date.now() - startTime) / 1000
        console.log(
          `Época ${epoch + 1}/${this.maxEpochs}, Error: ${avgError.toFixed(6)}, Tiempo: ${timeElapsed.toFixed(2)}s`,
        )
      }

      // Verificar condición de parada
      if (avgError <= this.precision) {
        console.log(`Entrenamiento completado en ${epoch + 1} épocas con error ${avgError.toFixed(6)}`)
        break
      }
    }

    // Calcular exactitud final
    let correctPredictions = 0
    for (const data of this.trainingData) {
      const output = this.forward(data.input)
      const predictedIndex = output.indexOf(Math.max(...output))
      const actualIndex = data.output.indexOf(Math.max(...data.output))
      if (predictedIndex === actualIndex) {
        correctPredictions++
      }
    }

    const accuracy = (correctPredictions / this.trainingData.length) * 100

    console.log(`Entrenamiento finalizado en ${this.currentEpoch} épocas`)
    console.log(`Error final: ${this.currentError.toFixed(6)}`)
    console.log(`Exactitud: ${accuracy.toFixed(2)}%`)
  }

  // Predecir resultado con la red neuronal (equivalente a predecir en Python)
  predict(inputArray: boolean[]): number[] {
    return this.forward(inputArray)
  }

  // Generar variaciones de un patrón de letra (mejorado)
  generateVariations(pattern: number[], numVariations = 8): number[][] {
    const variations = []

    for (let v = 0; v < numVariations; v++) {
      const variation = [...pattern]

      // Añadir diferentes tipos de ruido
      const noiseType = v % 3
      const noiseLevel = 0.05 + Math.random() * 0.15 // 5-20% de ruido

      if (noiseType === 0) {
        // Ruido aleatorio: cambiar algunos píxeles
        const numChanges = Math.floor(pattern.length * noiseLevel)
        for (let i = 0; i < numChanges; i++) {
          const randomIndex = Math.floor(Math.random() * pattern.length)
          variation[randomIndex] = variation[randomIndex] === 1 ? 0 : 1
        }
      } else if (noiseType === 1) {
        // Desplazamiento: mover la letra ligeramente
        // Implementación simplificada para mantener compatibilidad
        const shift = Math.random() > 0.5 ? 1 : -1
        for (let i = 0; i < pattern.length - 1; i++) {
          if (Math.random() < 0.1) {
            const temp = variation[i]
            variation[i] = variation[i + shift] || 0
            variation[i + shift] = temp
          }
        }
      } else {
        // Erosión/dilatación: quitar o añadir píxeles en los bordes
        for (let i = 0; i < pattern.length; i++) {
          if (Math.random() < noiseLevel) {
            // Cambiar píxeles con cierta probabilidad
            variation[i] = Math.random() > 0.5 ? 1 : 0
          }
        }
      }

      variations.push(variation)
    }

    return variations
  }

  // Cargar datos de entrenamiento para el alfabeto español completo con variaciones mejoradas
  loadSpanishAlphabet(): void {
    // Alfabeto español: A-Z + Ñ (27 letras)
    this.trainingData = []

    // Patrones base para cada letra (7x5 = 35 píxeles) - mismos que antes
    const letterPatterns = {
      A: [0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
      B: [1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0],
      C: [0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0],
      D: [1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 0],
      E: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1],
      F: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0],
      G: [0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0],
      H: [1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
      I: [1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1],
      J: [0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0],
      K: [1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1],
      L: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1],
      M: [1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
      N: [1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
      Ñ: [0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 1],
      O: [0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0],
      P: [1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0],
      Q: [0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1],
      R: [1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1],
      S: [0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0],
      T: [1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
      U: [1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0],
      V: [1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0],
      W: [1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1],
      X: [1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1],
      Y: [1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
      Z: [1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1],
    }

    const alphabet = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ"

    // Para cada letra, generar el patrón base y múltiples variaciones mejoradas
    for (let i = 0; i < alphabet.length; i++) {
      const letter = alphabet[i]
      const pattern = letterPatterns[letter as keyof typeof letterPatterns]

      if (pattern) {
        // Crear el vector de salida (one-hot encoding)
        const output = Array(27).fill(0)
        output[i] = 1

        // Añadir el patrón base
        this.trainingData.push({
          input: pattern.map((v) => v === 1),
          output: output,
        })

        // Generar y añadir variaciones mejoradas
        const variations = this.generateVariations(pattern, 12) // Más variaciones
        for (const variation of variations) {
          this.trainingData.push({
            input: variation.map((v) => v === 1),
            output: output,
          })
        }
      }
    }

    console.log(`Datos de entrenamiento cargados: ${this.trainingData.length} ejemplos`)
    console.log("Iniciando entrenamiento con algoritmo mejorado...")
    this.train()
  }

  // Obtener la letra correspondiente al índice
  getLetterFromIndex(index: number): string {
    const alphabet = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ"
    return alphabet[index] || "?"
  }

  // Predecir la letra a partir de una cuadrícula con confianza mejorada
  predictLetter(grid: boolean[]): { letter: string; confidence: number } {
    const output = this.predict(grid)
    const maxValue = Math.max(...output)
    const maxIndex = output.indexOf(maxValue)

    // Calcular confianza mejorada
    const sortedOutputs = [...output].sort((a, b) => b - a)
    const confidence = Math.max(0, Math.min(1, (maxValue - sortedOutputs[1]) * 2))

    return {
      letter: this.getLetterFromIndex(maxIndex),
      confidence: confidence,
    }
  }

  // Método simple para compatibilidad
  predictLetterSimple(grid: boolean[]): string {
    return this.predictLetter(grid).letter
  }

  // Guardar pesos (equivalente a guardar_pesos en Python)
  saveWeights(): object {
    return {
      weightsIH: this.weightsIH,
      biasH: this.biasH,
      weightsHO: this.weightsHO,
      biasO: this.biasO,
      config: {
        inputNodes: this.inputNodes,
        hiddenNodes: this.hiddenNodes,
        outputNodes: this.outputNodes,
        activationFunctions: this.activationFunctions,
        betaLeakyRelu: this.betaLeakyRelu,
      },
    }
  }

  // Cargar pesos (equivalente a cargar_pesos en Python)
  loadWeights(data: any): void {
    if (data.weightsIH) this.weightsIH = data.weightsIH
    if (data.biasH) this.biasH = data.biasH
    if (data.weightsHO) this.weightsHO = data.weightsHO
    if (data.biasO) this.biasO = data.biasO

    if (data.config) {
      if (data.config.activationFunctions) {
        this.activationFunctions = data.config.activationFunctions
      }
      if (data.config.betaLeakyRelu) {
        this.betaLeakyRelu = data.config.betaLeakyRelu
      }
    }
  }
}
