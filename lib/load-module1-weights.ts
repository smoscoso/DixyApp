import NeuralNetworkCompatible from "./neural-network-compatible"

/**
 * Carga automáticamente los pesos pre-entrenados para el Módulo 1
 * desde un archivo JSON en la carpeta lib
 */
export async function loadModule1Weights(): Promise<NeuralNetworkCompatible | null> {
  try {
    // Importar el archivo JSON directamente desde la carpeta lib
    const weightsData = await import("./module1-weights.json")

    // Crear una nueva instancia de la red neuronal
    const neuralNetwork = new NeuralNetworkCompatible()

    // Cargar los pesos
    const loaded = neuralNetwork.loadWeights(weightsData.default || weightsData)

    if (loaded) {
      console.log("✅ Pesos del Módulo 1 cargados automáticamente desde lib/module1-weights.json")
      return neuralNetwork
    } else {
      console.error("❌ Error al cargar los pesos del Módulo 1")
      return null
    }
  } catch (error) {
    console.error("❌ Error al importar el archivo de pesos del Módulo 1:", error)
    console.log("📝 Asegúrate de que el archivo 'lib/module1-weights.json' existe y tiene el formato correcto")
    return null
  }
}

/**
 * Verifica si los pesos del Módulo 1 están disponibles
 */
export async function checkModule1WeightsAvailable(): Promise<boolean> {
  try {
    await import("./module1-weights.json")
    return true
  } catch {
    return false
  }
}

/**
 * Marca que el módulo 1 está disponible en localStorage
 */
export function markModule1Available(): void {
  localStorage.setItem("module1WeightsAvailable", "true")
}

/**
 * Obtiene información sobre el estado de los pesos del Módulo 1
 */
export async function getModule1WeightsInfo(): Promise<{
  available: boolean
  error?: string
  info?: any
}> {
  try {
    const weightsData = await import("./module1-weights.json")
    const data = weightsData.default || weightsData

    return {
      available: true,
      info: {
        hasWeights: !!(data.W_h && data.W_o),
        hasBias: !!(data.Th && data.To),
        config: data.config || {},
        dimensions: {
          input: data.config?.capa_entrada || data.W_h?.[0]?.length || "unknown",
          hidden: data.config?.capa_oculta || data.W_h?.length || "unknown",
          output: data.config?.capa_salida || data.W_o?.length || "unknown",
        },
      },
    }
  } catch (error) {
    return {
      available: false,
      error: `No se pudo cargar el archivo de pesos: ${error}`,
    }
  }
}
