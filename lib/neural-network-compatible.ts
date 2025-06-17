/**
 * Red Neuronal compatible con los pesos del sistema Python
 * Adaptada específicamente para cargar pesos pre-entrenados
 */
export default class NeuralNetworkCompatible {
  // Configuración de la red
  inputNodes: number
  hiddenNodes: number
  outputNodes: number

  // Pesos y bias (matrices) - compatibles con formato Python
  W_h: number[][] // Pesos capa oculta (Python: W_h)
  W_o: number[][] // Pesos capa salida (Python: W_o)
  Th: number[][] // Bias capa oculta (Python: Th)
  To: number[][] // Bias capa salida (Python: To)

  // Configuración cargada
  config: any
  bias: boolean

  // Estado de la red
  isLoaded: boolean

  constructor() {
    this.inputNodes = 35 // 7x5 grid
    this.hiddenNodes = 30
    this.outputNodes = 27 // A-Z + Ñ
    this.isLoaded = false
    this.bias = true

    // Inicializar matrices vacías
    this.W_h = []
    this.W_o = []
    this.Th = []
    this.To = []
    this.config = {}
  }

  // Función de activación sigmoide (compatible con Python)
  sigmoid(x: number): number {
    // Clamp para evitar overflow (igual que en Python)
    x = Math.max(-500, Math.min(500, x))
    return 1 / (1 + Math.exp(-x))
  }

  // Función de activación tanh
  tanh(x: number): number {
    return Math.tanh(x)
  }

  // Función de activación ReLU
  relu(x: number): number {
    return Math.max(0, x)
  }

  // Función de activación Leaky ReLU
  leakyRelu(x: number, beta = 0.01): number {
    return x > 0 ? x : beta * x
  }

  // Función de activación lineal
  linear(x: number): number {
    return x
  }

  // Función de activación softmax para un array
  softmax(arr: number[]): number[] {
    const maxVal = Math.max(...arr)
    const expValues = arr.map((x) => Math.exp(x - maxVal))
    const sumExp = expValues.reduce((sum, val) => sum + val, 0)
    return expValues.map((val) => val / sumExp)
  }

  // Aplicar función de activación según el nombre
  applyActivation(value: number, functionName: string): number {
    switch (functionName.toLowerCase()) {
      case "sigmoide":
      case "sigmoid":
        return this.sigmoid(value)
      case "tanh":
        return this.tanh(value)
      case "relu":
        return this.relu(value)
      case "leaky relu":
      case "leaky_relu":
        return this.leakyRelu(value, this.config.beta_leaky_relu || 0.01)
      case "lineal":
      case "linear":
        return this.linear(value)
      default:
        return this.sigmoid(value) // Por defecto sigmoide
    }
  }

  // Aplicar función de activación a un array
  applyActivationArray(arr: number[], functionName: string): number[] {
    if (functionName.toLowerCase() === "softmax") {
      return this.softmax(arr)
    }
    return arr.map((x) => this.applyActivation(x, functionName))
  }

  // Cargar pesos desde un objeto JSON (compatible con formato Python)
  loadWeights(data: any): boolean {
    try {
      // Validar que los datos tengan la estructura correcta
      if (!data.W_h || !data.W_o) {
        console.error("Error: Faltan pesos principales (W_h, W_o)")
        return false
      }

      // Cargar pesos principales
      this.W_h = data.W_h
      this.W_o = data.W_o

      // Cargar bias si están disponibles
      if (data.Th && data.To) {
        this.Th = data.Th
        this.To = data.To
        this.bias = true
      } else {
        this.bias = false
      }

      // Cargar configuración si está disponible
      if (data.config) {
        this.config = data.config

        // Actualizar dimensiones desde la configuración
        if (data.config.capa_entrada) this.inputNodes = data.config.capa_entrada
        if (data.config.capa_oculta) this.hiddenNodes = data.config.capa_oculta
        if (data.config.capa_salida) this.outputNodes = data.config.capa_salida
      }

      // Validar dimensiones
      if (this.W_h.length !== this.hiddenNodes || this.W_h[0].length !== this.inputNodes) {
        console.error("Error: Dimensiones incorrectas en W_h")
        return false
      }

      if (this.W_o.length !== this.outputNodes || this.W_o[0].length !== this.hiddenNodes) {
        console.error("Error: Dimensiones incorrectas en W_o")
        return false
      }

      this.isLoaded = true
      console.log("Pesos cargados exitosamente")
      console.log(`Dimensiones: ${this.inputNodes} -> ${this.hiddenNodes} -> ${this.outputNodes}`)

      return true
    } catch (error) {
      console.error("Error al cargar pesos:", error)
      this.isLoaded = false
      return false
    }
  }

  // Predicción (forward pass) - Compatible con implementación Python
  predict(inputArray: number[]): number[] {
    if (!this.isLoaded) {
      throw new Error("Red neuronal no cargada. Primero debe cargar los pesos.")
    }

    if (inputArray.length !== this.inputNodes) {
      throw new Error(`Entrada debe tener ${this.inputNodes} elementos, recibió ${inputArray.length}`)
    }

    try {
      // === CAPA OCULTA ===
      // Calcular entradas netas: Neth = W_h * x + Th
      const hiddenInputs: number[] = []

      for (let i = 0; i < this.hiddenNodes; i++) {
        let sum = 0

        // Multiplicación matriz-vector
        for (let j = 0; j < this.inputNodes; j++) {
          sum += this.W_h[i][j] * inputArray[j]
        }

        // Añadir bias si está habilitado
        if (this.bias && this.Th.length > 0) {
          sum += this.Th[i][0] // Th es una matriz columna en Python
        }

        hiddenInputs[i] = sum
      }

      // Aplicar función de activación a la capa oculta
      const funcOculta = this.config.funciones_activacion?.[0] || "sigmoide"
      const hiddenOutputs = this.applyActivationArray(hiddenInputs, funcOculta)

      // === CAPA DE SALIDA ===
      // Calcular entradas netas: Neto = W_o * Yh + To
      const outputInputs: number[] = []

      for (let i = 0; i < this.outputNodes; i++) {
        let sum = 0

        // Multiplicación matriz-vector
        for (let j = 0; j < this.hiddenNodes; j++) {
          sum += this.W_o[i][j] * hiddenOutputs[j]
        }

        // Añadir bias si está habilitado
        if (this.bias && this.To.length > 0) {
          sum += this.To[i][0] // To es una matriz columna en Python
        }

        outputInputs[i] = sum
      }

      // Aplicar función de activación a la capa de salida
      const funcSalida = this.config.funciones_activacion?.[1] || "sigmoide"
      const finalOutputs = this.applyActivationArray(outputInputs, funcSalida)

      return finalOutputs
    } catch (error) {
      console.error("Error en la predicción:", error)
      throw error
    }
  }

  // Predecir letra con información adicional
  predictLetter(grid: boolean[]): { letter: string; confidence: number; activations: number[] } {
    // Convertir grid booleano a array numérico
    const input = grid.map((cell) => (cell ? 1 : 0))

    // Realizar predicción
    const output = this.predict(input)

    // Encontrar la letra con mayor activación
    const maxValue = Math.max(...output)
    const maxIndex = output.indexOf(maxValue)

    // Calcular confianza (diferencia entre la mayor y segunda mayor activación)
    const sortedOutputs = [...output].sort((a, b) => b - a)
    const confidence = Math.max(0, Math.min(1, (sortedOutputs[0] - sortedOutputs[1]) * 2))

    // Obtener la letra correspondiente
    const alphabet = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ"
    const letter = alphabet[maxIndex] || "?"

    return {
      letter,
      confidence,
      activations: output,
    }
  }

  // Verificar si la red está lista para usar
  isReady(): boolean {
    return this.isLoaded
  }

  // Obtener información de la red
  getInfo(): object {
    return {
      inputNodes: this.inputNodes,
      hiddenNodes: this.hiddenNodes,
      outputNodes: this.outputNodes,
      bias: this.bias,
      isLoaded: this.isLoaded,
      config: this.config,
    }
  }
}
