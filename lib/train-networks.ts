import SoundRecognitionNetwork from "./sound-recognition-network"
import WordRecognitionNetwork from "./word-recognition-network"
import { checkModule1WeightsAvailable, markModule1Available } from "./load-module1-weights"

interface TrainingProgress {
  onProgress: (percent: number, message: string) => void
}

export async function trainAllNetworks({ onProgress }: TrainingProgress): Promise<void> {
  console.log("🚀 trainAllNetworks: Iniciando entrenamiento completo")

  try {
    onProgress(5, "🔍 Verificando estado de las redes neuronales...")

    // Verificar si el Módulo 1 tiene pesos pre-cargados
    console.log("🔍 trainAllNetworks: Verificando Módulo 1")
    const module1HasWeights = await checkModule1WeightsAvailable()

    if (module1HasWeights) {
      console.log("✅ trainAllNetworks: Módulo 1 tiene pesos disponibles")
      onProgress(15, "✅ Módulo 1: Pesos pre-entrenados detectados")
      markModule1Available()
    } else {
      console.log("❌ trainAllNetworks: Módulo 1 no tiene pesos")
      onProgress(5, "⚠️ Módulo 1: No se encontraron pesos pre-entrenados")
      throw new Error("Módulo 1 requiere pesos pre-entrenados en lib/module1-weights.json")
    }

    // Entrenar el módulo 2
    console.log("🔊 trainAllNetworks: Iniciando entrenamiento Módulo 2")
    onProgress(20, "🔊 Iniciando entrenamiento del Módulo 2 (Reconocimiento de sonidos)...")
    await trainModule2Network(onProgress)

    // Entrenar el módulo 3
    console.log("📝 trainAllNetworks: Iniciando entrenamiento Módulo 3")
    onProgress(60, "📝 Iniciando entrenamiento del Módulo 3 (Reconocimiento de palabras)...")
    await trainModule3Network(onProgress)

    onProgress(100, "🎉 ¡Todas las redes neuronales están listas!")

    // Marcar que el entrenamiento está completo
    localStorage.setItem("networksTrainingComplete", "true")

    console.log("✅ trainAllNetworks: Entrenamiento completado exitosamente")

    // Verificación final
    const finalCheck = areNetworksTrained()
    console.log("🔍 trainAllNetworks: Verificación final:", finalCheck)
  } catch (error) {
    console.error("❌ trainAllNetworks: Error durante el entrenamiento:", error)
    throw error
  }
}

async function trainModule2Network(onProgress: (percent: number, message: string) => void): Promise<void> {
  console.log("🔊 trainModule2Network: Iniciando")

  try {
    onProgress(25, "🔊 Módulo 2: Creando red neuronal...")

    // Crear red neuronal para sonidos
    const soundNetwork = new SoundRecognitionNetwork(100, 50, 20)
    console.log("🔊 trainModule2Network: Red neuronal creada")

    onProgress(30, "🔊 Módulo 2: Cargando datos de entrenamiento...")

    // Cargar datos de entrenamiento - esto ejecuta el entrenamiento internamente
    console.log("🔊 trainModule2Network: Cargando datos y entrenando...")
    soundNetwork.loadWordFormationData()

    // Simular progreso de entrenamiento visual
    for (let i = 35; i <= 55; i += 5) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      onProgress(i, `🔊 Módulo 2: Procesando entrenamiento... ${Math.round(((i - 35) / 20) * 100)}%`)
    }

    onProgress(60, "✅ Módulo 2: Red de sonidos entrenada exitosamente")

    // Guardar la red entrenada
    localStorage.setItem("soundNetworkTrained", "true")
    localStorage.setItem(
      "soundNetworkData",
      JSON.stringify({
        weightsIH: soundNetwork.weightsIH,
        weightsHO: soundNetwork.weightsHO,
        biasH: soundNetwork.biasH,
        biasO: soundNetwork.biasO,
        wordDictionary: soundNetwork.wordDictionary,
        inputNodes: soundNetwork.inputNodes,
        hiddenNodes: soundNetwork.hiddenNodes,
        outputNodes: soundNetwork.outputNodes,
      }),
    )

    console.log("✅ trainModule2Network: Módulo 2 entrenado y guardado")
  } catch (error) {
    console.error("❌ trainModule2Network: Error entrenando Módulo 2:", error)
    throw new Error(`Error en el entrenamiento del Módulo 2: ${error}`)
  }
}

async function trainModule3Network(onProgress: (percent: number, message: string) => void): Promise<void> {
  console.log("📝 trainModule3Network: Iniciando")

  try {
    onProgress(65, "📝 Módulo 3: Creando red neuronal...")

    // Crear red neuronal para palabras
    const wordNetwork = new WordRecognitionNetwork(200, 100, 20)
    console.log("📝 trainModule3Network: Red neuronal creada")

    onProgress(70, "📝 Módulo 3: Cargando datos de entrenamiento...")

    // Cargar datos de entrenamiento - esto ejecuta el entrenamiento internamente
    console.log("📝 trainModule3Network: Cargando datos y entrenando...")
    wordNetwork.loadDyslexiaWords()

    // Simular progreso de entrenamiento visual
    for (let i = 75; i <= 95; i += 5) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      onProgress(i, `📝 Módulo 3: Procesando entrenamiento... ${Math.round(((i - 75) / 20) * 100)}%`)
    }

    onProgress(100, "✅ Módulo 3: Red de palabras entrenada exitosamente")

    // Guardar la red entrenada
    localStorage.setItem("wordNetworkTrained", "true")
    localStorage.setItem(
      "wordNetworkData",
      JSON.stringify({
        weightsIH: wordNetwork.weightsIH,
        weightsHO: wordNetwork.weightsHO,
        biasH: wordNetwork.biasH,
        biasO: wordNetwork.biasO,
        dyslexiaWords: wordNetwork.dyslexiaWords,
        wordDictionary: wordNetwork.wordDictionary,
        inputNodes: wordNetwork.inputNodes,
        hiddenNodes: wordNetwork.hiddenNodes,
        outputNodes: wordNetwork.outputNodes,
      }),
    )

    console.log("✅ trainModule3Network: Módulo 3 entrenado y guardado")
  } catch (error) {
    console.error("❌ trainModule3Network: Error entrenando Módulo 3:", error)
    throw new Error(`Error en el entrenamiento del Módulo 3: ${error}`)
  }
}

export function areNetworksTrained(): boolean {
  if (typeof window === "undefined") {
    console.log("⚠️ areNetworksTrained: Ejecutándose en servidor, retornando false")
    return false
  }

  try {
    // Verificar si todos los módulos están listos
    const module1Ready = localStorage.getItem("module1WeightsAvailable") === "true"
    const module2Ready = localStorage.getItem("soundNetworkTrained") === "true"
    const module3Ready = localStorage.getItem("wordNetworkTrained") === "true"
    const trainingComplete = localStorage.getItem("networksTrainingComplete") === "true"

    console.log("🔍 areNetworksTrained: Estado de las redes:", {
      module1Ready,
      module2Ready,
      module3Ready,
      trainingComplete,
    })

    const allReady = module1Ready && module2Ready && module3Ready && trainingComplete
    console.log("🔍 areNetworksTrained: Resultado final:", allReady)

    return allReady
  } catch (error) {
    console.error("❌ areNetworksTrained: Error verificando estado de las redes:", error)
    return false
  }
}

// Función para limpiar el estado de entrenamiento (útil para desarrollo)
export function clearTrainingState(): void {
  console.log("🧹 clearTrainingState: Limpiando estado de entrenamiento")

  localStorage.removeItem("module1WeightsAvailable")
  localStorage.removeItem("soundNetworkTrained")
  localStorage.removeItem("wordNetworkTrained")
  localStorage.removeItem("networksTrainingComplete")
  localStorage.removeItem("soundNetworkData")
  localStorage.removeItem("wordNetworkData")

  console.log("🧹 clearTrainingState: Estado de entrenamiento limpiado")
}
