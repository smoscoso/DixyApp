"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Grid3X3, RotateCcw } from "lucide-react"
import confetti from "canvas-confetti"
import { useRouter } from "next/navigation"
import { saveProgress } from "@/lib/actions"

interface PatternCell {
  id: string
  filled: boolean
  isUserFilled: boolean
}

export default function Modulo6Page() {
  const [currentLevel, setCurrentLevel] = useState(1)
  const [pattern, setPattern] = useState<PatternCell[][]>([])
  const [userPattern, setUserPattern] = useState<PatternCell[][]>([])
  const [showPattern, setShowPattern] = useState(true)
  const [message, setMessage] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)
  const [studyTime, setStudyTime] = useState(5)
  const router = useRouter()

  // Verificar usuario
  useEffect(() => {
    const id = localStorage.getItem("userId")
    if (!id) {
      router.push("/")
      return
    }
    setUserId(id)
  }, [router])

  // Configurar el nivel actual
  useEffect(() => {
    generatePatternForLevel(currentLevel)
    setMessage("")
    setShowSuccess(false)
    setAttempts(0)
    setShowPattern(true)
    setStudyTime(Math.max(3, 8 - currentLevel)) // Menos tiempo conforme avanza
  }, [currentLevel])

  // Timer para ocultar el patrón
  useEffect(() => {
    if (showPattern && studyTime > 0) {
      const timer = setTimeout(() => {
        setStudyTime(studyTime - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (studyTime === 0) {
      setShowPattern(false)
    }
  }, [showPattern, studyTime])

  const generatePatternForLevel = (level: number) => {
    const gridSize = Math.min(3 + Math.floor(level / 3), 6) // Aumenta el tamaño gradualmente
    const complexity = Math.min(level * 2, (gridSize * gridSize) / 2) // Más celdas llenas conforme avanza

    const newPattern: PatternCell[][] = []
    const newUserPattern: PatternCell[][] = []

    // Crear grid vacío
    for (let i = 0; i < gridSize; i++) {
      newPattern[i] = []
      newUserPattern[i] = []
      for (let j = 0; j < gridSize; j++) {
        newPattern[i][j] = {
          id: `${i}-${j}`,
          filled: false,
          isUserFilled: false,
        }
        newUserPattern[i][j] = {
          id: `${i}-${j}`,
          filled: false,
          isUserFilled: false,
        }
      }
    }

    // Generar patrones según el nivel
    if (level <= 3) {
      // Patrones simples: líneas y formas básicas
      generateSimplePattern(newPattern, gridSize)
    } else if (level <= 6) {
      // Patrones geométricos
      generateGeometricPattern(newPattern, gridSize)
    } else {
      // Patrones complejos y simétricos
      generateComplexPattern(newPattern, gridSize)
    }

    setPattern(newPattern)
    setUserPattern(newUserPattern)
  }

  const generateSimplePattern = (grid: PatternCell[][], size: number) => {
    // Generar un patrón completamente aleatorio
    const numCells = Math.floor(size * size * (0.2 + Math.random() * 0.3)) // 20-50% de celdas llenas

    for (let i = 0; i < numCells; i++) {
      let row, col
      do {
        row = Math.floor(Math.random() * size)
        col = Math.floor(Math.random() * size)
      } while (grid[row][col].filled) // Evitar duplicados

      grid[row][col].filled = true
    }
  }

  const generateGeometricPattern = (grid: PatternCell[][], size: number) => {
    // Generar patrones geométricos con posiciones aleatorias
    const patterns = [
      // Líneas aleatorias
      () => {
        const isHorizontal = Math.random() > 0.5
        const linePosition = Math.floor(Math.random() * size)

        if (isHorizontal) {
          for (let j = 0; j < size; j++) {
            grid[linePosition][j].filled = true
          }
        } else {
          for (let i = 0; i < size; i++) {
            grid[i][linePosition].filled = true
          }
        }
      },
      // Puntos aleatorios en esquinas
      () => {
        const corners = [
          [0, 0],
          [0, size - 1],
          [size - 1, 0],
          [size - 1, size - 1],
        ]
        const numCorners = 2 + Math.floor(Math.random() * 3)

        for (let i = 0; i < numCorners; i++) {
          const [row, col] = corners[Math.floor(Math.random() * corners.length)]
          grid[row][col].filled = true
        }
      },
    ]

    const randomPattern = patterns[Math.floor(Math.random() * patterns.length)]
    randomPattern()
  }

  const generateComplexPattern = (grid: PatternCell[][], size: number) => {
    // Patrones complejos completamente aleatorios
    const numCells = Math.floor(size * size * (0.3 + Math.random() * 0.4)) // 30-70% de celdas

    for (let i = 0; i < numCells; i++) {
      let row, col
      do {
        row = Math.floor(Math.random() * size)
        col = Math.floor(Math.random() * size)
      } while (grid[row][col].filled)

      grid[row][col].filled = true
    }
  }

  const toggleUserCell = (rowIndex: number, colIndex: number) => {
    if (showPattern) return

    const newUserPattern = [...userPattern]
    newUserPattern[rowIndex][colIndex].isUserFilled = !newUserPattern[rowIndex][colIndex].isUserFilled
    setUserPattern(newUserPattern)
  }

  const resetUserPattern = () => {
    const newUserPattern = userPattern.map((row) => row.map((cell) => ({ ...cell, isUserFilled: false })))
    setUserPattern(newUserPattern)
    setMessage("")
    setShowSuccess(false)
  }

  const checkPattern = async () => {
    if (!userId) return

    setAttempts(attempts + 1)

    // Comparar el patrón del usuario con el patrón original
    let correctCells = 0
    let totalCells = 0

    for (let i = 0; i < pattern.length; i++) {
      for (let j = 0; j < pattern[i].length; j++) {
        totalCells++
        if (pattern[i][j].filled === userPattern[i][j].isUserFilled) {
          correctCells++
        }
      }
    }

    const accuracy = (correctCells / totalCells) * 100
    const success = accuracy >= 80

    try {
      await saveProgress(userId, 6, currentLevel, success)
    } catch (error) {
      console.error("Error al guardar el progreso:", error)
    }

    if (success) {
      setMessage(`¡Excelente! 🎉 Has recreado el patrón con ${Math.round(accuracy)}% de precisión`)
      setShowSuccess(true)

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
    } else {
      if (attempts < 2) {
        setMessage(`¡Muy cerca! Precisión: ${Math.round(accuracy)}%. Observa bien las posiciones.`)
      } else if (attempts < 4) {
        setMessage("Intenta recordar dónde estaban las celdas llenas. ¡Puedes volver a ver el patrón!")
      } else {
        setMessage("¡Sigue intentando! La práctica hace al maestro.")
      }
    }
  }

  const showPatternAgain = () => {
    setShowPattern(true)
    setStudyTime(3) // Menos tiempo en la segunda oportunidad
  }

  const goToNextLevel = () => {
    if (currentLevel < 10) {
      setCurrentLevel(currentLevel + 1)
      confetti({
        particleCount: 200,
        spread: 160,
        origin: { y: 0.6 },
      })
    } else {
      confetti({
        particleCount: 300,
        spread: 180,
        origin: { y: 0.6 },
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-200 to-blue-200 py-8 bg-[url('/placeholder.svg?height=200&width=200')] bg-repeat">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <Link href="/modules">
            <Button variant="outline" className="flex items-center gap-2 bg-white rounded-full p-6 shadow-md">
              <ArrowLeft className="h-6 w-6" />
              <span className="text-lg">Volver a los módulos</span>
            </Button>
          </Link>
          <div className="text-center bg-white p-4 rounded-2xl shadow-lg border-4 border-indigo-400">
            <h1 className="text-3xl font-bold text-indigo-600">Módulo 6: ¡Patrones Espaciales!</h1>
            <p className="text-xl text-blue-500">Nivel {currentLevel} de 10</p>
          </div>
          <div className="w-[140px]"></div>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Patrón de referencia o área de práctica */}
          <Card className="rounded-3xl overflow-hidden border-4 border-indigo-400 shadow-xl">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-center mb-6 text-indigo-600 flex items-center justify-center gap-2">
                <Grid3X3 className="h-8 w-8" />
                {showPattern ? "¡Memoriza este patrón!" : "¡Recrea el patrón!"}
              </h2>

              {showPattern && (
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-red-600">{studyTime}</div>
                  <p className="text-lg text-gray-600">segundos restantes</p>
                </div>
              )}

              <div className="flex justify-center mb-6">
                <div
                  className="grid gap-2 p-4 bg-white rounded-xl border-2 border-indigo-300"
                  style={{
                    gridTemplateColumns: `repeat(${pattern.length}, 1fr)`,
                    maxWidth: "300px",
                  }}
                >
                  {(showPattern ? pattern : userPattern).map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        onClick={() => !showPattern && toggleUserCell(rowIndex, colIndex)}
                        className={`w-10 h-10 border-2 rounded-md cursor-pointer transition-all duration-200 ${
                          showPattern
                            ? cell.filled
                              ? "bg-indigo-500 border-indigo-600"
                              : "bg-gray-100 border-gray-300"
                            : cell.isUserFilled
                              ? "bg-blue-500 border-blue-600 hover:bg-blue-600"
                              : "bg-gray-100 border-gray-300 hover:bg-gray-200"
                        }`}
                      />
                    )),
                  )}
                </div>
              </div>

              {!showPattern && (
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={resetUserPattern}
                    variant="outline"
                    className="bg-white text-indigo-600 border-2 border-indigo-300 rounded-xl px-6 py-3 flex items-center gap-2"
                  >
                    <RotateCcw className="h-5 w-5" />
                    Limpiar
                  </Button>
                  <Button
                    onClick={showPatternAgain}
                    variant="outline"
                    className="bg-white text-blue-600 border-2 border-blue-300 rounded-xl px-6 py-3"
                  >
                    Ver patrón
                  </Button>
                  <Button
                    onClick={checkPattern}
                    className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 rounded-xl px-8 py-3 text-lg shadow-lg"
                  >
                    ¡Comprobar!
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instrucciones */}
          <Card className="rounded-3xl overflow-hidden border-4 border-indigo-400 shadow-xl">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-center mb-6 text-indigo-600">¡Instrucciones!</h2>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2 bg-white p-3 rounded-lg shadow">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <span className="text-lg">Observa el patrón durante unos segundos</span>
                </li>
                <li className="flex items-start gap-2 bg-white p-3 rounded-lg shadow">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <span className="text-lg">Memoriza las posiciones de las celdas llenas</span>
                </li>
                <li className="flex items-start gap-2 bg-white p-3 rounded-lg shadow">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <span className="text-lg">Haz clic en las celdas para recrear el patrón</span>
                </li>
                <li className="flex items-start gap-2 bg-white p-3 rounded-lg shadow">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <span className="text-lg">¡Necesitas 80% de precisión para avanzar!</span>
                </li>
              </ul>

              <div className="bg-yellow-100 p-4 rounded-xl border-2 border-yellow-300 mb-6">
                <h3 className="text-lg font-bold text-yellow-800 mb-2">💡 Consejos:</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Busca patrones: líneas, formas, simetrías</li>
                  <li>• Cuenta las celdas llenas</li>
                  <li>• Usa puntos de referencia (esquinas, centro)</li>
                  <li>• Si olvidas algo, puedes ver el patrón otra vez</li>
                </ul>
              </div>

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
                      className="mt-6 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 w-full rounded-full py-4 text-xl shadow-lg"
                    >
                      {currentLevel < 10 ? "¡Siguiente nivel! 🚀" : "¡Has completado todos los niveles! 🏆"}
                    </Button>
                  )}
                </div>
              )}

              <div className="mt-6 text-center text-sm text-gray-600">
                <p className="mb-2">
                  🎯 Nivel de dificultad: {currentLevel <= 3 ? "Básico" : currentLevel <= 6 ? "Intermedio" : "Avanzado"}
                </p>
                <p>🧠 Ejercita tu memoria visual y percepción espacial</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Elementos decorativos */}
        <div className="fixed bottom-4 left-4 animate-bounce text-5xl">🧩</div>
        <div className="fixed bottom-4 right-4 animate-bounce text-5xl">🎯</div>
      </div>
    </div>
  )
}
