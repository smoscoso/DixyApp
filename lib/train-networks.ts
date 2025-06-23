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

// Función principal para verificar si las redes están entrenadas
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

// Nueva función para verificar redes específicas por módulos asignados
export function areAssignedModuleNetworksReady(assignedModules: number[]): boolean {
  if (typeof window === "undefined") {
    console.log("⚠️ areAssignedModuleNetworksReady: Ejecutándose en servidor")
    return false
  }

  console.log("🔍 Verificando redes para módulos asignados:", assignedModules)

  try {
    for (const moduleId of assignedModules) {
      const isReady = checkModuleNetworkReady(moduleId)
      console.log(`📊 Módulo ${moduleId}: ${isReady ? "✅ Listo" : "❌ No listo"}`)

      if (!isReady) {
        console.log(`❌ Módulo ${moduleId} no está listo`)
        return false
      }
    }

    console.log("✅ Todas las redes de módulos asignados están listas")
    return true
  } catch (error) {
    console.error("❌ Error verificando redes de módulos asignados:", error)
    return false
  }
}

// Función para verificar si la red de un módulo específico está lista
function checkModuleNetworkReady(moduleId: number): boolean {
  switch (moduleId) {
    case 1:
      // Módulo 1 requiere pesos pre-entrenados
      return localStorage.getItem("module1WeightsAvailable") === "true"
    case 2:
      // Módulo 2 requiere red de reconocimiento de sonidos
      return localStorage.getItem("soundNetworkTrained") === "true"
    case 3:
      // Módulo 3 requiere red de reconocimiento de palabras
      return localStorage.getItem("wordNetworkTrained") === "true"
    case 4:
    case 5:
    case 6:
      // Módulos 4, 5, 6 no requieren redes neuronales específicas
      return true
    default:
      console.warn(`⚠️ Módulo ${moduleId} no reconocido`)
      return false
  }
}

// Función para inicializar redes básicas automáticamente
export async function initializeBasicNetworks(): Promise<void> {
  console.log("🚀 Inicializando redes básicas...")

  try {
    // Marcar módulos básicos como disponibles si no requieren entrenamiento
    if (!localStorage.getItem("soundNetworkTrained")) {
      console.log("🔊 Inicializando red de sonidos básica...")
      // Crear una red básica para módulo 2
      const soundNetwork = new SoundRecognitionNetwork(100, 50, 20)
      soundNetwork.loadWordFormationData()

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
      console.log("✅ Red de sonidos inicializada")
    }

    if (!localStorage.getItem("wordNetworkTrained")) {
      console.log("📝 Inicializando red de palabras básica...")
      // Crear una red básica para módulo 3
      const wordNetwork = new WordRecognitionNetwork(200, 100, 20)
      wordNetwork.loadDyslexiaWords()

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
      console.log("✅ Red de palabras inicializada")
    }

    // Verificar si el módulo 1 tiene pesos
    const module1Available = await checkModule1WeightsAvailable()
    if (module1Available) {
      markModule1Available()
      console.log("✅ Módulo 1 marcado como disponible")
    }

    console.log("🎉 Redes básicas inicializadas correctamente")
  } catch (error) {
    console.error("❌ Error inicializando redes básicas:", error)
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
