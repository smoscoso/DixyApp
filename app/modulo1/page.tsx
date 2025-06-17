"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft } from "lucide-react"
import confetti from "canvas-confetti"
import { useRouter } from "next/navigation"
import { saveProgress } from "@/lib/actions"
import type NeuralNetworkCompatible from "@/lib/neural-network-compatible"
import { loadModule1Weights, getModule1WeightsInfo } from "@/lib/load-module1-weights"

export default function Modulo1Page() {
  const [currentLevel, setCurrentLevel] = useState(1)
  const [grid, setGrid] = useState(Array(7).fill(Array(5).fill(false)))
  const [currentLetter, setCurrentLetter] = useState("")
  const [message, setMessage] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [neuralNetwork, setNeuralNetwork] = useState<NeuralNetworkCompatible | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState("Iniciando...")
  const [attempts, setAttempts] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  // Inicializar la red neuronal y verificar usuario
  useEffect(() => {
    const initializeModule = async () => {
      // Verificar si el usuario está registrado
      const id = localStorage.getItem("userId")
      if (!id) {
        router.push("/")
        return
      }
      setUserId(id)

      try {
        setLoadingMessage("Verificando pesos del Módulo 1...")

        // Obtener información sobre los pesos
        const weightsInfo = await getModule1WeightsInfo()

        if (!weightsInfo.available) {
          setLoadingMessage("❌ Error: No se encontraron los pesos del Módulo 1")
          console.error("Error de pesos:", weightsInfo.error)

          // Mostrar error por 3 segundos y luego redirigir
          setTimeout(() => {
            router.push("/")
          }, 3000)
          return
        }

        setLoadingMessage("Cargando red neuronal del Módulo 1...")

        // Cargar los pesos automáticamente
        const nn = await loadModule1Weights()

        if (nn && nn.isReady()) {
          setNeuralNetwork(nn)
          setLoadingMessage("✅ Red neuronal cargada exitosamente")

          // Mostrar información de la red cargada
          const info = nn.getInfo()
          console.log("📊 Información de la red neuronal:", info)

          // Pequeña pausa para mostrar el mensaje de éxito
          setTimeout(() => {
            setIsLoading(false)
          }, 1000)
        } else {
          setLoadingMessage("❌ Error al cargar la red neuronal")
          console.error("Error: No se pudo inicializar la red neuronal")

          setTimeout(() => {
            router.push("/")
          }, 3000)
        }
      } catch (error) {
        console.error("Error al inicializar el módulo:", error)
        setLoadingMessage("❌ Error inesperado al cargar el módulo")

        setTimeout(() => {
          router.push("/")
        }, 3000)
      }
    }

    initializeModule()
  }, [router])

  // Cambiar la letra según el nivel
  useEffect(() => {
    // Todas las letras del alfabeto español
    const allLetters = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("")

    // Seleccionar 10 letras aleatorias para los niveles
    const getRandomLetters = () => {
      const shuffled = [...allLetters].sort(() => 0.5 - Math.random())
      return shuffled.slice(0, 10)
    }

    // Obtener letras aleatorias del localStorage o generar nuevas
    let levelLetters = JSON.parse(localStorage.getItem("module1Letters") || "null")

    if (!levelLetters) {
      levelLetters = getRandomLetters()
      localStorage.setItem("module1Letters", JSON.stringify(levelLetters))
    }

    if (currentLevel <= levelLetters.length) {
      setCurrentLetter(levelLetters[currentLevel - 1])
      setGrid(Array(7).fill(Array(5).fill(false)))
      setMessage("")
      setShowSuccess(false)
      setAttempts(0)
    }
  }, [currentLevel])

  const toggleCell = (rowIndex: number, colIndex: number) => {
    const newGrid = grid.map((row, r) =>
      r === rowIndex ? row.map((cell: boolean, c: number) => (c === colIndex ? !cell : cell)) : row,
    )
    setGrid(newGrid)
  }

  const handleFinish = async () => {
    if (!neuralNetwork || isLoading || !userId) return

    // Verificar que la red esté lista
    if (!neuralNetwork.isReady()) {
      setMessage("Error: La red neuronal no está cargada correctamente")
      return
    }

    // Incrementar intentos
    setAttempts(attempts + 1)

    try {
      // Convertir la cuadrícula a un array plano para la red neuronal
      const input = grid.flat()

      // Evaluar con la red neuronal compatible
      const prediction = neuralNetwork.predictLetter(input)
      const predictedLetter = prediction.letter
      const confidence = prediction.confidence

      const success = predictedLetter === currentLetter

      // Guardar el progreso en la base de datos
      try {
        await saveProgress(userId, 1, currentLevel, success)
      } catch (error) {
        console.error("Error al guardar el progreso:", error)
      }

      if (success) {
        setMessage(
          `¡Fantástico! 🎉 Has dibujado correctamente la letra ${currentLetter} (Confianza: ${Math.round(confidence * 100)}%)`,
        )
        setShowSuccess(true)

        // Lanzar confeti para celebrar
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        })
      } else {
        // Mensajes de ánimo según el número de intentos y confianza
        if (confidence > 0.7) {
          setMessage(
            `¡Muy cerca! La red detectó "${predictedLetter}" con alta confianza (${Math.round(confidence * 100)}%). Intenta ajustar un poco el dibujo de la letra ${currentLetter}.`,
          )
        } else if (attempts < 2) {
          setMessage(
            `¡Casi lo tienes! Intenta dibujar mejor la letra ${currentLetter}. La red detectó la letra ${predictedLetter} (Confianza: ${Math.round(confidence * 100)}%)`,
          )
        } else if (attempts < 4) {
          setMessage(`¡Sigue intentando! Estás mejorando. La red detectó la letra ${predictedLetter}`)
        } else {
          setMessage(`¡No te rindas! Mira el ejemplo y vuelve a intentarlo. La red detectó la letra ${predictedLetter}`)
        }
      }
    } catch (error) {
      console.error("Error en la predicción:", error)
      setMessage("Error al procesar la predicción. Por favor, intenta de nuevo.")
    }
  }

  const goToNextLevel = () => {
    if (currentLevel < 10) {
      setCurrentLevel(currentLevel + 1)

      // Lanzar confeti para celebrar el paso al siguiente nivel
      confetti({
        particleCount: 200,
        spread: 160,
        origin: { y: 0.6 },
      })
    } else {
      // Redirigir al siguiente módulo o mostrar mensaje de finalización
      // Celebración final
      confetti({
        particleCount: 300,
        spread: 180,
        origin: { y: 0.6 },
      })
    }
  }

  const resetGrid = () => {
    setGrid(Array(7).fill(Array(5).fill(false)))
    setMessage("")
    setShowSuccess(false)
  }

  // Ejemplos visuales de letras para ayudar a los niños
  const letterExamples: Record<string, boolean[][]> = {
    A: [
      [false, false, true, false, false],
      [false, true, false, true, false],
      [true, false, false, false, true],
      [true, true, true, true, true],
      [true, false, false, false, true],
      [true, false, false, false, true],
      [true, false, false, false, true],
    ],
    B: [
      [true, true, true, true, false],
      [true, false, false, false, true],
      [true, false, false, false, true],
      [true, true, true, true, false],
      [true, false, false, false, true],
      [true, false, false, false, true],
      [true, true, true, true, false],
    ],
    C: [
      [false, true, true, true, false],
      [true, false, false, false, true],
      [true, false, false, false, false],
      [true, false, false, false, false],
      [true, false, false, false, false],
      [true, false, false, false, true],
      [false, true, true, true, false],
    ],
    D: [
      [true, true, true, true, false],
      [true, false, false, false, true],
      [true, false, false, false, true],
      [true, false, false, false, true],
      [true, false, false, false, true],
      [true, false, false, false, true],
      [true, true, true, true, false],
    ],
    E: [
      [true, true, true, true, true],
      [true, false, false, false, false],
      [true, false, false, false, false],
      [true, true, true, true, false],
      [true, false, false, false, false],
      [true, false, false, false, false],
      [true, true, true, true, true],
    ],
    F: [
      [true, true, true, true, true],
      [true, false, false, false, false],
      [true, false, false, false, false],
      [true, true, true, true, false],
      [true, false, false, false, false],
      [true, false, false, false, false],
      [true, false, false, false, false],
    ],
    G: [
      [false, true, true, true, false],
      [true, false, false, false, true],
      [true, false, false, false, false],
      [true, false, true, true, true],
      [true, false, false, false, true],
      [true, false, false, false, true],
      [false, true, true, true, false],
    ],
    H: [
      [true, false, false, false, true],
      [true, false, false, false, true],
      [true, false, false, false, true],
      [true, true, true, true, true],
      [true, false, false, false, true],
      [true, false, false, false, true],
      [true, false, false, false, true],
    ],
    I: [
      [true, true, true, true, true],
      [false, false, true, false, false],
      [false, false, true, false, false],
      [false, false, true, false, false],
      [false, false, true, false, false],
      [false, false, true, false, false],
      [true, true, true, true, true],
    ],
    J: [
      [false, false, false, false, true],
      [false, false, false, false, true],
      [false, false, false, false, true],
      [false, false, false, false, true],
      [true, false, false, false, true],
      [true, false, false, false, true],
      [false, true, true, true, false],
    ],
    K: [
      [true, false, false, false, true],
      [true, false, false, true, false],
      [true, false, true, false, false],
      [true, true, false, false, false],
      [true, false, true, false, false],
      [true, false, false, true, false],
      [true, false, false, false, true],
    ],
    L: [
      [true, false, false, false, false],
      [true, false, false, false, false],
      [true, false, false, false, false],
      [true, false, false, false, false],
      [true, false, false, false, false],
      [true, false, false, false, false],
      [true, true, true, true, true],
    ],
    M: [
      [true, false, false, false, true],
      [true, true, false, true, true],
      [true, false, true, false, true],
      [true, false, false, false, true],
      [true, false, false, false, true],
      [true, false, false, false, true],
      [true, false, false, false, true],
    ],
    N: [
      [true, false, false, false, true],
      [true, true, false, false, true],
      [true, false, true, false, true],
      [true, false, false, true, true],
      [true, false, false, false, true],
      [true, false, false, false, true],
      [true, false, false, false, true],
    ],
    Ñ: [
      [false, true, true, true, false],
      [false, false, false, false, false],
      [true, false, false, false, true],
      [true, true, false, false, true],
      [true, false, true, false, true],
      [true, false, false, true, true],
      [true, false, false, false, true],
    ],
    O: [
      [false, true, true, true, false],
      [true, false, false, false, true],
      [true, false, false, false, true],
      [true, false, false, false, true],
      [true, false, false, false, true],
      [true, false, false, false, true],
      [false, true, true, true, false],
    ],
    P: [
      [true, true, true, true, false],
      [true, false, false, false, true],
      [true, false, false, false, true],
      [true, true, true, true, false],
      [true, false, false, false, false],
      [true, false, false, false, false],
      [true, false, false, false, false],
    ],
    Q: [
      [false, true, true, true, false],
      [true, false, false, false, true],
      [true, false, false, false, true],
      [true, false, false, false, true],
      [true, false, true, false, true],
      [true, false, false, true, false],
      [false, true, true, false, true],
    ],
    R: [
      [true, true, true, true, false],
      [true, false, false, false, true],
      [true, false, false, false, true],
      [true, true, true, true, false],
      [true, false, true, false, false],
      [true, false, false, true, false],
      [true, false, false, false, true],
    ],
    S: [
      [false, true, true, true, false],
      [true, false, false, false, true],
      [true, false, false, false, false],
      [false, true, true, true, false],
      [false, false, false, false, true],
      [true, false, false, false, true],
      [false, true, true, true, false],
    ],
    T: [
      [true, true, true, true, true],
      [false, false, true, false, false],
      [false, false, true, false, false],
      [false, false, true, false, false],
      [false, false, true, false, false],
      [false, false, true, false, false],
      [false, false, true, false, false],
    ],
    U: [
      [true, false, false, false, true],
      [true, false, false, false, true],
      [true, false, false, false, true],
      [true, false, false, false, true],
      [true, false, false, false, true],
      [true, false, false, false, true],
      [false, true, true, true, false],
    ],
    V: [
      [true, false, false, false, true],
      [true, false, false, false, true],
      [true, false, false, false, true],
      [true, false, false, false, true],
      [true, false, false, false, true],
      [false, true, false, true, false],
      [false, false, true, false, false],
    ],
    W: [
      [true, false, false, false, true],
      [true, false, false, false, true],
      [true, false, false, false, true],
      [true, false, false, false, true],
      [true, false, true, false, true],
      [true, true, false, true, true],
      [true, false, false, false, true],
    ],
    X: [
      [true, false, false, false, true],
      [false, true, false, true, false],
      [false, false, true, false, false],
      [false, false, true, false, false],
      [false, false, true, false, false],
      [false, true, false, true, false],
      [true, false, false, false, true],
    ],
    Y: [
      [true, false, false, false, true],
      [false, true, false, true, false],
      [false, false, true, false, false],
      [false, false, true, false, false],
      [false, false, true, false, false],
      [false, false, true, false, false],
      [false, false, true, false, false],
    ],
    Z: [
      [true, true, true, true, true],
      [false, false, false, false, true],
      [false, false, false, true, false],
      [false, false, true, false, false],
      [false, true, false, false, false],
      [true, false, false, false, false],
      [true, true, true, true, true],
    ],
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-200 to-purple-200 py-8 bg-[url('/placeholder.svg?height=200&width=200')] bg-repeat">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <Link href="/modules">
            <Button variant="outline" className="flex items-center gap-2 bg-white rounded-full p-6 shadow-md">
              <ArrowLeft className="h-6 w-6" />
              <span className="text-lg">Volver a los módulos</span>
            </Button>
          </Link>
          <div className="text-center bg-white p-4 rounded-2xl shadow-lg border-4 border-pink-400">
            <h1 className="text-3xl font-bold text-purple-600">Módulo 1: ¡Dibuja Letras!</h1>
            <p className="text-xl text-pink-500">Nivel {currentLevel} de 10</p>
          </div>
          <div className="w-[140px]"></div> {/* Espacio para equilibrar el flex */}
        </div>

        <div className="relative mb-8">
          <Progress value={(currentLevel / 10) * 100} className="h-6 rounded-full bg-gray-200" />
          <div className="absolute top-0 left-0 w-full h-full flex justify-between px-2 items-center">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
              <div
                key={level}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                  level <= currentLevel ? "bg-green-500" : "bg-gray-400"
                }`}
              >
                {level}
              </div>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-64 space-y-4">
            <div className="text-3xl text-purple-600 animate-bounce">🧠</div>
            <div className="text-2xl text-purple-600 font-bold">{loadingMessage}</div>
            <div className="text-lg text-gray-600">Módulo 1 - Red Neuronal Especializada</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="rounded-3xl overflow-hidden border-4 border-pink-400 shadow-xl">
              <CardContent className="p-6">
                <h2 className="text-3xl font-bold text-center mb-4 text-purple-600">
                  Dibuja la letra: <span className="text-6xl text-pink-600 animate-pulse">{currentLetter}</span>
                </h2>
                <p className="text-center mb-6 text-lg">¡Haz clic en los cuadros para dibujar la letra!</p>

                <div className="grid grid-cols-5 gap-2 max-w-xs mx-auto bg-blue-100 p-4 rounded-xl">
                  {grid.map((row, rowIndex) =>
                    row.map((cell: boolean, colIndex: number) => (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`w-12 h-12 rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-110 ${
                          cell ? "bg-pink-500 border-2 border-pink-600" : "bg-white border-2 border-gray-300"
                        }`}
                        onClick={() => toggleCell(rowIndex, colIndex)}
                      />
                    )),
                  )}
                </div>

                <div className="flex justify-center gap-4 mt-6">
                  <Button
                    onClick={resetGrid}
                    variant="outline"
                    className="bg-white text-purple-600 border-2 border-purple-400 rounded-full px-6 py-2 text-lg"
                  >
                    Borrar Todo
                  </Button>
                  <Button
                    onClick={handleFinish}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-full px-8 py-2 text-lg shadow-lg"
                  >
                    ¡Comprobar!
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl overflow-hidden border-4 border-purple-400 shadow-xl">
              <CardContent className="p-6">
                <h2 className="text-3xl font-bold text-center mb-4 text-purple-600">¡Instrucciones!</h2>

                <div className="bg-yellow-100 p-4 rounded-xl mb-6">
                  <h3 className="text-xl font-bold text-orange-600 mb-2">Ejemplo de la letra {currentLetter}:</h3>
                  <div className="grid grid-cols-5 gap-1 max-w-xs mx-auto bg-white p-2 rounded-lg">
                    {letterExamples[currentLetter]?.map((row, rowIndex) =>
                      row.map((cell: boolean, colIndex: number) => (
                        <div
                          key={`example-${rowIndex}-${colIndex}`}
                          className={`w-8 h-8 rounded-md ${cell ? "bg-orange-500" : "bg-gray-100"}`}
                        />
                      )),
                    ) || <div className="col-span-5 p-4 text-center">No hay ejemplo disponible para esta letra</div>}
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 bg-white p-3 rounded-lg shadow">
                    <span className="text-green-500 text-xl mt-1">✓</span>
                    <span className="text-lg">Dibuja la letra {currentLetter} en la cuadrícula</span>
                  </li>
                  <li className="flex items-start gap-2 bg-white p-3 rounded-lg shadow">
                    <span className="text-green-500 text-xl mt-1">✓</span>
                    <span className="text-lg">Haz clic en los cuadros para colorearlos</span>
                  </li>
                  <li className="flex items-start gap-2 bg-white p-3 rounded-lg shadow">
                    <span className="text-green-500 text-xl mt-1">✓</span>
                    <span className="text-lg">Cuando termines, haz clic en "¡Comprobar!"</span>
                  </li>
                </ul>

                {message && (
                  <div
                    className={`p-6 rounded-xl text-center text-lg ${
                      showSuccess
                        ? "bg-green-100 text-green-800 border-4 border-green-400"
                        : "bg-yellow-100 text-yellow-800 border-4 border-yellow-400"
                    }`}
                  >
                    {message}

                    {showSuccess && (
                      <Button
                        onClick={goToNextLevel}
                        className="mt-4 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 w-full rounded-full py-3 text-lg shadow-lg"
                      >
                        {currentLevel < 10 ? "¡Siguiente nivel! 🚀" : "¡Has completado todos los niveles! 🏆"}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Elementos decorativos */}
        <div className="fixed bottom-4 left-4 animate-bounce text-5xl">🦄</div>
        <div className="fixed bottom-4 right-4 animate-bounce text-5xl">🌈</div>
      </div>
    </div>
  )
}
