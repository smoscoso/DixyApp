/**
 * Implementación de una Red Neuronal con BackPropagation
 * para el reconocimiento de palabras complejas de dislexia (Módulo 3)
 */
export default class WordRecognitionNetwork {
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
  weightsIH: number[][]
  weightsHO: number[][]
  biasH: number[]
  biasO: number[]

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

  // Diccionario de palabras de dislexia con imágenes
  dyslexiaWords: Array<{ word: string; hint: string; image: string }>

  // Para compatibilidad con simulateAudioFeatures
  wordDictionary: string[] = []

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
    this.dyslexiaWords = []
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
    console.log("Iniciando entrenamiento de la red de palabras de dislexia...")

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

  // Cargar datos de entrenamiento para palabras de dislexia
  loadDyslexiaWords(): void {
    // Palabras que comúnmente causan confusión en niños con dislexia con imágenes
    this.dyslexiaWords = [
      {
        word: "BOCA",
        hint: "Parte del cuerpo para comer y hablar",
        image: "/images/modulo3/boca.png",
      },
      {
        word: "DEDO",
        hint: "Parte de la mano",
        image: "/images/modulo3/dedo.png",
      },
      {
        word: "PATO",
        hint: "Animal que nada en el agua",
        image: "/images/modulo3/pato.png",
      },
      {
        word: "DADO",
        hint: "Cubo para jugar",
        image: "/images/modulo3/dado.png",
      },
      {
        word: "BESO",
        hint: "Muestra de cariño",
        image: "/images/modulo3/beso.png",
      },
      {
        word: "PESO",
        hint: "Qué tan pesado es algo",
        image: "/images/modulo3/peso.png",
      },
      {
        word: "PELO",
        hint: "Crece en la cabeza",
        image: "/images/modulo3/pelo.png",
      },
      {
        word: "PERO",
        hint: "Palabra que indica oposición",
        image: "/images/modulo3/pero.png",
      },
      {
        word: "LOBO",
        hint: "Animal salvaje que aúlla",
        image: "/images/modulo3/lobo.png",
      },
      {
        word: "GLOBO",
        hint: "Se infla con aire",
        image: "/images/modulo3/globo.png",
      },
      {
        word: "PLATO",
        hint: "Para servir comida",
        image: "/images/modulo3/plato.png",
      },
      {
        word: "BLANCO",
        hint: "Color de la nieve",
        image: "/images/modulo3/blanco.png",
      },
      {
        word: "BRAZO",
        hint: "Parte del cuerpo con la mano",
        image: "/images/modulo3/brazo.png",
      },
      {
        word: "BRUJA",
        hint: "Personaje de cuentos con sombrero",
        image: "/images/modulo3/bruja.png",
      },
      {
        word: "DRAGÓN",
        hint: "Animal fantástico que escupe fuego",
        image: "/images/modulo3/dragon.png",
      },
      {
        word: "FRUTA",
        hint: "Alimento dulce que crece en árboles",
        image: "/images/modulo3/fruta.png",
      },
      {
        word: "GRANDE",
        hint: "Lo opuesto a pequeño",
        image: "/images/modulo3/grande.png",
      },
      {
        word: "VERDE",
        hint: "Color de las plantas",
        image: "/images/modulo3/verde.png",
      },
      {
        word: "TRES",
        hint: "Número después del dos",
        image: "/images/modulo3/tres.png",
      },
      {
        word: "CRUZ",
        hint: "Símbolo con dos líneas que se cruzan",
        image: "/images/modulo3/cruz.png",
      },
    ]

    // Inicializar el diccionario de palabras para compatibilidad con simulateAudioFeatures
    this.wordDictionary = this.dyslexiaWords.map((item) => item.word)

    this.trainingData = []

    // Limitar el número de palabras al tamaño de la capa de salida
    const numWords = Math.min(this.dyslexiaWords.length, this.outputNodes)

    // Generar datos de entrenamiento para cada palabra
    for (let i = 0; i < numWords; i++) {
      const wordData = this.dyslexiaWords[i]

      // Crear características basadas en la palabra
      const wordFeatures = this.generateComplexWordFeatures(wordData.word)

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
        const variationFeatures = wordFeatures.map((f) => f + (Math.random() * 0.05 - 0.025))
        this.trainingData.push({
          input: variationFeatures,
          output: output,
        })
      }
    }

    console.log("Datos de entrenamiento para palabras de dislexia cargados. Iniciando entrenamiento...")
    this.train()
  }

  // Generar características complejas para palabras de dislexia
  generateComplexWordFeatures(word: string): number[] {
    const features = Array(this.inputNodes).fill(0)

    // Características básicas
    features[0] = word.length / 15 // Normalizar longitud

    // Características de letras individuales
    for (let i = 0; i < Math.min(word.length, 30); i++) {
      const charCode = word.charCodeAt(i) - 65 // A=0, B=1, etc.
      if (charCode >= 0 && charCode < 26) {
        features[i + 1] = charCode / 25 // Normalizar
      }
    }

    // Características de patrones problemáticos en dislexia
    features[50] = word.includes("B") && word.includes("D") ? 1 : 0 // Confusión B-D
    features[51] = word.includes("P") && word.includes("Q") ? 1 : 0 // Confusión P-Q
    features[52] = word.includes("BR") ? 1 : 0 // Grupos consonánticos
    features[53] = word.includes("BL") ? 1 : 0
    features[54] = word.includes("CR") ? 1 : 0
    features[55] = word.includes("CL") ? 1 : 0
    features[56] = word.includes("DR") ? 1 : 0
    features[57] = word.includes("FL") ? 1 : 0
    features[58] = word.includes("FR") ? 1 : 0
    features[59] = word.includes("GL") ? 1 : 0
    features[60] = word.includes("GR") ? 1 : 0
    features[61] = word.includes("PL") ? 1 : 0
    features[62] = word.includes("PR") ? 1 : 0
    features[63] = word.includes("TR") ? 1 : 0

    // Características de vocales
    features[70] = (word.match(/A/g) || []).length / word.length
    features[71] = (word.match(/E/g) || []).length / word.length
    features[72] = (word.match(/I/g) || []).length / word.length
    features[73] = (word.match(/O/g) || []).length / word.length
    features[74] = (word.match(/U/g) || []).length / word.length

    // Rellenar el resto con características derivadas
    for (let i = 80; i < this.inputNodes; i++) {
      const index = i - 80
      features[i] = Math.sin(word.length * 2 + index) * 0.3 + 0.5
    }

    return features
  }

  // Obtener la palabra correspondiente al índice
  getWordFromIndex(index: number): string {
    return this.dyslexiaWords[index]?.word || "?"
  }

  // Obtener datos completos de la palabra
  getWordDataFromIndex(index: number) {
    return this.dyslexiaWords[index] || null
  }

  // Predecir la palabra a partir de características
  predictWord(wordFeatures: number[]): string {
    const output = this.predict(wordFeatures)
    const maxIndex = output.indexOf(Math.max(...output))
    return this.getWordFromIndex(maxIndex)
  }

  // Generar características para una palabra específica (para uso en el juego)
  getWordFeatures(word: string): number[] {
    return this.generateComplexWordFeatures(word)
  }

  // Simular la extracción de características de audio a partir de una palabra
  simulateAudioFeatures(word: string): number[] {
    // En una implementación real, aquí se extraerían características del audio
    // Para este prototipo, generamos características aleatorias pero consistentes para cada palabra

    const index = this.wordDictionary.indexOf(word.toUpperCase())

    if (index === -1) {
      return Array(this.inputNodes)
        .fill(0)
        .map(() => Math.random())
    }

    // Generar características consistentes para la misma palabra
    const seed = index * 100
    const features = Array(this.inputNodes)
      .fill(0)
      .map((_, i) => {
        // Usar una función pseudoaleatoria pero determinista basada en la palabra y la posición
        return Math.sin(seed + i) * 0.5 + 0.5
      })

    // Añadir un poco de ruido aleatorio para simular variaciones en la pronunciación
    return features.map((f) => f + (Math.random() * 0.05 - 0.025))
  }
}

// También exportación nombrada para compatibilidad
export { WordRecognitionNetwork }
