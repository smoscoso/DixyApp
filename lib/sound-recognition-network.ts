/**
 * Implementación de una Red Neuronal con BackPropagation
 * para la formación de palabras (Módulo 2)
 */
export default class SoundRecognitionNetwork {
  // Configuración de la red
  inputNodes: number
  hiddenNodes: number
  outputNodes: number
  learningRate: number
  maxEpochs: number
  precision: number
  momentum: boolean
  beta: number

  // Pesos y bias
  weightsIH!: number[][]
  weightsHO!: number[][]
  biasH!: number[]
  biasO!: number[]

  // Variables para momentum
  deltaWeightsIHPrev: number[][]
  deltaWeightsHOPrev: number[][]
  deltaBiasHPrev: number[]
  deltaBiasOPrev: number[]

  // Variables para seguimiento del entrenamiento
  currentEpoch: number
  currentError: number

  // Datos de entrenamiento
  trainingData: { input: number[]; output: number[] }[]

  // Diccionario de palabras para formación con imágenes
  wordDictionary: Array<{ word: string; image: string }>

  constructor(inputNodes: number, hiddenNodes: number, outputNodes: number) {
    // Configuración básica
    this.inputNodes = inputNodes
    this.hiddenNodes = hiddenNodes
    this.outputNodes = outputNodes
    this.learningRate = 0.01
    this.maxEpochs = 1000000
    this.precision = 0.01
    this.momentum = true
    this.beta = 0.9

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

    // Inicializar diccionario de palabras
    this.wordDictionary = []
  }

  // Inicializar pesos con inicialización Xavier/Glorot
  initializeWeights(): void {
    const limitHidden = Math.sqrt(6 / (this.inputNodes + this.hiddenNodes))
    const limitOutput = Math.sqrt(6 / (this.hiddenNodes + this.outputNodes))

    // Inicializar pesos entre capa de entrada y oculta
    this.weightsIH = Array(this.hiddenNodes)
      .fill(0)
      .map(() =>
        Array(this.inputNodes)
          .fill(0)
          .map(() => Math.random() * 2 * limitHidden - limitHidden),
      )

    // Inicializar pesos entre capa oculta y salida
    this.weightsHO = Array(this.outputNodes)
      .fill(0)
      .map(() =>
        Array(this.hiddenNodes)
          .fill(0)
          .map(() => Math.random() * 2 * limitOutput - limitOutput),
      )

    // Inicializar bias con ceros
    this.biasH = Array(this.hiddenNodes).fill(0)
    this.biasO = Array(this.outputNodes).fill(0)
  }

  // Función de activación sigmoide
  sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x))))
  }

  // Derivada de la función sigmoide
  dsigmoid(y: number): number {
    return y * (1 - y)
  }

  // Propagación hacia adelante
  forward(inputArray: number[]): number[] {
    // Calcular salidas de la capa oculta
    const hiddenInputs = Array(this.hiddenNodes).fill(0)
    for (let i = 0; i < this.hiddenNodes; i++) {
      let sum = this.biasH[i]
      for (let j = 0; j < this.inputNodes; j++) {
        sum += inputArray[j] * this.weightsIH[i][j]
      }
      hiddenInputs[i] = sum
    }
    const hiddenOutputs = hiddenInputs.map((x) => this.sigmoid(x))

    // Calcular salidas de la capa de salida
    const finalInputs = Array(this.outputNodes).fill(0)
    for (let i = 0; i < this.outputNodes; i++) {
      let sum = this.biasO[i]
      for (let j = 0; j < this.hiddenNodes; j++) {
        sum += hiddenOutputs[j] * this.weightsHO[i][j]
      }
      finalInputs[i] = sum
    }
    const finalOutputs = finalInputs.map((x) => this.sigmoid(x))

    return finalOutputs
  }

  // Propagación hacia atrás y actualización de pesos
  backward(inputArray: number[], targetArray: number[]): void {
    // Forward pass para obtener las salidas
    const hiddenInputs = Array(this.hiddenNodes).fill(0)
    for (let i = 0; i < this.hiddenNodes; i++) {
      let sum = this.biasH[i]
      for (let j = 0; j < this.inputNodes; j++) {
        sum += inputArray[j] * this.weightsIH[i][j]
      }
      hiddenInputs[i] = sum
    }
    const hiddenOutputs = hiddenInputs.map((x) => this.sigmoid(x))

    const finalInputs = Array(this.outputNodes).fill(0)
    for (let i = 0; i < this.outputNodes; i++) {
      let sum = this.biasO[i]
      for (let j = 0; j < this.hiddenNodes; j++) {
        sum += hiddenOutputs[j] * this.weightsHO[i][j]
      }
      finalInputs[i] = sum
    }
    const finalOutputs = finalInputs.map((x) => this.sigmoid(x))

    // Backward pass
    // Calcular errores de la capa de salida
    const outputErrors = targetArray.map((target, i) => target - finalOutputs[i])

    // Calcular gradientes de la capa de salida
    const outputGradients = finalOutputs.map((output, i) => outputErrors[i] * this.dsigmoid(output) * this.learningRate)

    // Calcular errores de la capa oculta
    const hiddenErrors = Array(this.hiddenNodes).fill(0)
    for (let i = 0; i < this.hiddenNodes; i++) {
      for (let j = 0; j < this.outputNodes; j++) {
        hiddenErrors[i] += outputErrors[j] * this.weightsHO[j][i]
      }
    }

    // Calcular gradientes de la capa oculta
    const hiddenGradients = hiddenOutputs.map(
      (hidden, i) => hiddenErrors[i] * this.dsigmoid(hidden) * this.learningRate,
    )

    // Actualizar pesos entre capa oculta y salida con momentum
    for (let i = 0; i < this.outputNodes; i++) {
      for (let j = 0; j < this.hiddenNodes; j++) {
        const deltaWeight = outputGradients[i] * hiddenOutputs[j] + this.beta * this.deltaWeightsHOPrev[i][j]
        this.weightsHO[i][j] += deltaWeight
        this.deltaWeightsHOPrev[i][j] = deltaWeight
      }
      const deltaBias = outputGradients[i] + this.beta * this.deltaBiasOPrev[i]
      this.biasO[i] += deltaBias
      this.deltaBiasOPrev[i] = deltaBias
    }

    // Actualizar pesos entre capa de entrada y oculta con momentum
    for (let i = 0; i < this.hiddenNodes; i++) {
      for (let j = 0; j < this.inputNodes; j++) {
        const deltaWeight = hiddenGradients[i] * inputArray[j] + this.beta * this.deltaWeightsIHPrev[i][j]
        this.weightsIH[i][j] += deltaWeight
        this.deltaWeightsIHPrev[i][j] = deltaWeight
      }
      const deltaBias = hiddenGradients[i] + this.beta * this.deltaBiasHPrev[i]
      this.biasH[i] += deltaBias
      this.deltaBiasHPrev[i] = deltaBias
    }
  }

  // Calcular error cuadrático medio
  calculateError(targetArray: number[], outputArray: number[]): number {
    let sum = 0
    for (let i = 0; i < targetArray.length; i++) {
      sum += Math.pow(targetArray[i] - outputArray[i], 2)
    }
    return sum / (2 * targetArray.length)
  }

  // Entrenar la red con los datos proporcionados
  train(): void {
    console.log("Iniciando entrenamiento de la red de formación de palabras...")

    for (let epoch = 0; epoch < this.maxEpochs; epoch++) {
      this.currentEpoch = epoch + 1
      let totalError = 0

      // Entrenar con cada ejemplo
      for (const data of this.trainingData) {
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

      // Mostrar progreso cada 1000 épocas
      if ((epoch + 1) % 1000 === 0 || epoch === 0) {
        console.log(`Época ${epoch + 1}/${this.maxEpochs}, Error: ${avgError.toFixed(6)}`)
      }

      // Verificar condición de parada - SOLO cuando se alcance el error objetivo
      if (avgError <= this.precision) {
        console.log(`Entrenamiento completado en ${epoch + 1} épocas con error ${avgError.toFixed(6)}`)
        break
      }
    }

    if (this.currentError > this.precision) {
      console.log(
        `Entrenamiento finalizado después de ${this.maxEpochs} épocas. Error final: ${this.currentError.toFixed(6)}`,
      )
    }
  }

  // Predecir resultado con la red neuronal
  predict(inputArray: number[]): number[] {
    return this.forward(inputArray)
  }

  // Cargar datos de entrenamiento para la formación de palabras
  loadWordFormationData(): void {
    // Diccionario de palabras para el módulo 2 con imágenes
    this.wordDictionary = [
      { word: "CASA", image: "/images/modulo2/casa.png" },
      { word: "MESA", image: "/images/modulo2/mesa.png" },
      { word: "SILLA", image: "/images/modulo2/silla.png" },
      { word: "LIBRO", image: "/images/modulo2/libro.png" },
      { word: "PAPEL", image: "/images/modulo2/papel.png" },
      { word: "GATO", image: "/images/modulo2/gato.png" },
      { word: "PERRO", image: "/images/modulo2/perro.png" },
      { word: "FLOR", image: "/images/modulo2/flor.png" },
      { word: "ÁRBOL", image: "/images/modulo2/arbol.png" },
      { word: "AGUA", image: "/images/modulo2/agua.png" },
      { word: "NIÑO", image: "/images/modulo2/nino.png" },
      { word: "NIÑA", image: "/images/modulo2/nina.png" },
      { word: "MAMÁ", image: "/images/modulo2/mama.png" },
      { word: "PAPÁ", image: "/images/modulo2/papa.png" },
      { word: "SOL", image: "/images/modulo2/sol.png" },
      { word: "LUNA", image: "/images/modulo2/luna.png" },
      { word: "PAN", image: "/images/modulo2/pan.png" },
      { word: "LECHE", image: "/images/modulo2/leche.png" },
      { word: "COCHE", image: "/images/modulo2/coche.png" },
      { word: "BICI", image: "/images/modulo2/bici.png" },
    ]

    this.trainingData = []

    // Limitar el número de palabras al tamaño de la capa de salida
    const numWords = Math.min(this.wordDictionary.length, this.outputNodes)

    // Generar datos de entrenamiento para cada palabra
    for (let i = 0; i < numWords; i++) {
      const wordData = this.wordDictionary[i]

      // Crear características basadas en la palabra
      const wordFeatures = this.generateWordFeatures(wordData.word)

      // Crear el vector de salida (one-hot encoding)
      const output = Array(this.outputNodes).fill(0)
      output[i] = 1

      // Añadir a los datos de entrenamiento
      this.trainingData.push({
        input: wordFeatures,
        output: output,
      })

      // Añadir variaciones para mejorar la robustez
      for (let j = 0; j < 2; j++) {
        const variationFeatures = wordFeatures.map((f) => f + (Math.random() * 0.1 - 0.05))
        this.trainingData.push({
          input: variationFeatures,
          output: output,
        })
      }
    }

    console.log("Datos de entrenamiento para formación de palabras cargados. Iniciando entrenamiento...")
    this.train()
  }

  // Generar características para una palabra
  generateWordFeatures(word: string): number[] {
    const features = Array(this.inputNodes).fill(0)

    // Características basadas en la longitud de la palabra
    features[0] = word.length / 10 // Normalizar longitud

    // Características basadas en las letras
    for (let i = 0; i < Math.min(word.length, 20); i++) {
      const charCode = word.charCodeAt(i) - 65 // A=0, B=1, etc.
      if (charCode >= 0 && charCode < 26) {
        features[i + 1] = charCode / 25 // Normalizar
      }
    }

    // Características adicionales basadas en patrones
    features[30] = word.includes("A") ? 1 : 0
    features[31] = word.includes("E") ? 1 : 0
    features[32] = word.includes("I") ? 1 : 0
    features[33] = word.includes("O") ? 1 : 0
    features[34] = word.includes("U") ? 1 : 0

    // Rellenar el resto con características derivadas
    for (let i = 35; i < this.inputNodes; i++) {
      features[i] = Math.sin(word.length + i) * 0.5 + 0.5
    }

    return features
  }

  // Obtener la palabra correspondiente al índice
  getWordFromIndex(index: number): string {
    return this.wordDictionary[index]?.word || "?"
  }

  // Obtener datos completos de la palabra (incluyendo imagen)
  getWordDataFromIndex(index: number) {
    return this.wordDictionary[index] || null
  }

  // Predecir la palabra a partir de características
  predictWord(wordFeatures: number[]): string {
    const output = this.predict(wordFeatures)
    const maxIndex = output.indexOf(Math.max(...output))
    return this.getWordFromIndex(maxIndex)
  }

  // Generar características para una palabra específica (para uso en el juego)
  getWordFeatures(word: string): number[] {
    return this.generateWordFeatures(word)
  }
}

// También exportación nombrada para compatibilidad
export { SoundRecognitionNetwork }
