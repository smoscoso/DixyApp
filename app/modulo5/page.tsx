"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Clock, RotateCcw } from "lucide-react"
import confetti from "canvas-confetti"
import { useRouter } from "next/navigation"
import { saveProgress } from "@/lib/actions"

interface SequenceItem {
  id: string
  description: string
  image: string
  correctOrder: number
}

interface SequenceLevel {
  title: string
  instruction: string
  items: SequenceItem[]
}

export default function Modulo5Page() {
  const [currentLevel, setCurrentLevel] = useState(1)
  const [sequenceItems, setSequenceItems] = useState<SequenceItem[]>([])
  const [userSequence, setUserSequence] = useState<string[]>([])
  const [message, setMessage] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)
  const [currentSequence, setCurrentSequence] = useState<SequenceLevel | null>(null)
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
    generateSequenceForLevel(currentLevel)
    setUserSequence([])
    setMessage("")
    setShowSuccess(false)
    setAttempts(0)
  }, [currentLevel])

  const generateSequenceForLevel = (level: number) => {
    const sequences: SequenceLevel[] = [
      // Nivel 1: Rutina matutina
      {
        title: "Rutina Matutina",
        instruction: "Ordena los pasos para una rutina matutina típica",
        items: [
          {
            id: "1",
            description: "Despertarse",
            image: "/placeholder.svg?height=100&width=100&text=😴",
            correctOrder: 1,
          },
          {
            id: "2",
            description: "Lavarse los dientes",
            image: "/placeholder.svg?height=100&width=100&text=🦷",
            correctOrder: 2,
          },
          {
            id: "3",
            description: "Desayunar",
            image: "/placeholder.svg?height=100&width=100&text=🥞",
            correctOrder: 3,
          },
          {
            id: "4",
            description: "Ir a la escuela",
            image: "/placeholder.svg?height=100&width=100&text=🎒",
            correctOrder: 4,
          },
        ],
      },
      // Nivel 2: Hacer un sándwich
      {
        title: "Preparar un Sándwich",
        instruction: "Ordena los pasos para hacer un delicioso sándwich",
        items: [
          {
            id: "1",
            description: "Sacar el pan",
            image: "/placeholder.svg?height=100&width=100&text=🍞",
            correctOrder: 1,
          },
          {
            id: "2",
            description: "Poner mantequilla",
            image: "/placeholder.svg?height=100&width=100&text=🧈",
            correctOrder: 2,
          },
          {
            id: "3",
            description: "Añadir jamón",
            image: "/placeholder.svg?height=100&width=100&text=🥓",
            correctOrder: 3,
          },
          {
            id: "4",
            description: "Cerrar el sándwich",
            image: "/placeholder.svg?height=100&width=100&text=🥪",
            correctOrder: 4,
          },
        ],
      },
      // Nivel 3: Lavarse las manos
      {
        title: "Lavarse las Manos",
        instruction: "Ordena los pasos para lavarse las manos correctamente",
        items: [
          {
            id: "1",
            description: "Abrir el grifo",
            image: "/placeholder.svg?height=100&width=100&text=🚿",
            correctOrder: 1,
          },
          {
            id: "2",
            description: "Mojar las manos",
            image: "/placeholder.svg?height=100&width=100&text=💧",
            correctOrder: 2,
          },
          {
            id: "3",
            description: "Aplicar jabón",
            image: "/placeholder.svg?height=100&width=100&text=🧼",
            correctOrder: 3,
          },
          {
            id: "4",
            description: "Frotar 20 segundos",
            image: "/placeholder.svg?height=100&width=100&text=👏",
            correctOrder: 4,
          },
          { id: "5", description: "Enjuagar", image: "/placeholder.svg?height=100&width=100&text=💦", correctOrder: 5 },
        ],
      },
      // Nivel 4: Plantar una semilla
      {
        title: "Plantar una Semilla",
        instruction: "Ordena los pasos para plantar y cuidar una semilla",
        items: [
          {
            id: "1",
            description: "Preparar la maceta",
            image: "/placeholder.svg?height=100&width=100&text=🪴",
            correctOrder: 1,
          },
          {
            id: "2",
            description: "Añadir tierra",
            image: "/placeholder.svg?height=100&width=100&text=🌱",
            correctOrder: 2,
          },
          {
            id: "3",
            description: "Plantar la semilla",
            image: "/placeholder.svg?height=100&width=100&text=🌰",
            correctOrder: 3,
          },
          {
            id: "4",
            description: "Regar la planta",
            image: "/placeholder.svg?height=100&width=100&text=💧",
            correctOrder: 4,
          },
          {
            id: "5",
            description: "Poner al sol",
            image: "/placeholder.svg?height=100&width=100&text=☀️",
            correctOrder: 5,
          },
        ],
      },
      // Nivel 5: Cruzar la calle
      {
        title: "Cruzar la Calle Seguro",
        instruction: "Ordena los pasos para cruzar la calle de forma segura",
        items: [
          {
            id: "1",
            description: "Llegar al semáforo",
            image: "/placeholder.svg?height=100&width=100&text=🚦",
            correctOrder: 1,
          },
          {
            id: "2",
            description: "Esperar luz verde",
            image: "/placeholder.svg?height=100&width=100&text=🟢",
            correctOrder: 2,
          },
          {
            id: "3",
            description: "Mirar a ambos lados",
            image: "/placeholder.svg?height=100&width=100&text=👀",
            correctOrder: 3,
          },
          {
            id: "4",
            description: "Cruzar rápido",
            image: "/placeholder.svg?height=100&width=100&text=🚶",
            correctOrder: 4,
          },
        ],
      },
      // Nivel 6: Hacer la cama
      {
        title: "Hacer la Cama",
        instruction: "Ordena los pasos para hacer la cama correctamente",
        items: [
          {
            id: "1",
            description: "Quitar las almohadas",
            image: "/placeholder.svg?height=100&width=100&text=🛏️",
            correctOrder: 1,
          },
          {
            id: "2",
            description: "Estirar las sábanas",
            image: "/placeholder.svg?height=100&width=100&text=📋",
            correctOrder: 2,
          },
          {
            id: "3",
            description: "Poner las almohadas",
            image: "/placeholder.svg?height=100&width=100&text=💤",
            correctOrder: 3,
          },
          {
            id: "4",
            description: "Acomodar la manta",
            image: "/placeholder.svg?height=100&width=100&text=🛌",
            correctOrder: 4,
          },
        ],
      },
      // Nivel 7: Estudiar para un examen
      {
        title: "Estudiar para un Examen",
        instruction: "Ordena los pasos para estudiar efectivamente para un examen",
        items: [
          {
            id: "1",
            description: "Organizar materiales",
            image: "/placeholder.svg?height=100&width=100&text=📚",
            correctOrder: 1,
          },
          {
            id: "2",
            description: "Leer los apuntes",
            image: "/placeholder.svg?height=100&width=100&text=📖",
            correctOrder: 2,
          },
          {
            id: "3",
            description: "Hacer resúmenes",
            image: "/placeholder.svg?height=100&width=100&text=✏️",
            correctOrder: 3,
          },
          {
            id: "4",
            description: "Practicar ejercicios",
            image: "/placeholder.svg?height=100&width=100&text=📝",
            correctOrder: 4,
          },
          {
            id: "5",
            description: "Repasar antes del examen",
            image: "/placeholder.svg?height=100&width=100&text=🔄",
            correctOrder: 5,
          },
        ],
      },
      // Nivel 8: Preparar una ensalada
      {
        title: "Preparar una Ensalada",
        instruction: "Ordena los pasos para preparar una ensalada fresca",
        items: [
          {
            id: "1",
            description: "Lavar las verduras",
            image: "/placeholder.svg?height=100&width=100&text=🥬",
            correctOrder: 1,
          },
          {
            id: "2",
            description: "Cortar en trozos",
            image: "/placeholder.svg?height=100&width=100&text=🔪",
            correctOrder: 2,
          },
          {
            id: "3",
            description: "Mezclar en el bowl",
            image: "/placeholder.svg?height=100&width=100&text=🥗",
            correctOrder: 3,
          },
          {
            id: "4",
            description: "Añadir aderezo",
            image: "/placeholder.svg?height=100&width=100&text=🍯",
            correctOrder: 4,
          },
        ],
      },
      // Nivel 9: Día de lluvia
      {
        title: "Prepararse para la Lluvia",
        instruction: "Ordena los pasos de lo que sucede en un día lluvioso",
        items: [
          {
            id: "1",
            description: "Ver las nubes",
            image: "/placeholder.svg?height=100&width=100&text=☁️",
            correctOrder: 1,
          },
          {
            id: "2",
            description: "Empezar a llover",
            image: "/placeholder.svg?height=100&width=100&text=🌧️",
            correctOrder: 2,
          },
          {
            id: "3",
            description: "Abrir el paraguas",
            image: "/placeholder.svg?height=100&width=100&text=☂️",
            correctOrder: 3,
          },
          {
            id: "4",
            description: "Buscar refugio",
            image: "/placeholder.svg?height=100&width=100&text=🏠",
            correctOrder: 4,
          },
          {
            id: "5",
            description: "Esperar que pare",
            image: "/placeholder.svg?height=100&width=100&text=⏰",
            correctOrder: 5,
          },
        ],
      },
      // Nivel 10: Ciclo del agua
      {
        title: "El Ciclo del Agua",
        instruction: "Ordena las etapas del ciclo natural del agua",
        items: [
          {
            id: "1",
            description: "Evaporación",
            image: "/placeholder.svg?height=100&width=100&text=☀️",
            correctOrder: 1,
          },
          {
            id: "2",
            description: "Condensación",
            image: "/placeholder.svg?height=100&width=100&text=☁️",
            correctOrder: 2,
          },
          {
            id: "3",
            description: "Precipitación",
            image: "/placeholder.svg?height=100&width=100&text=🌧️",
            correctOrder: 3,
          },
          {
            id: "4",
            description: "Acumulación",
            image: "/placeholder.svg?height=100&width=100&text=🌊",
            correctOrder: 4,
          },
        ],
      },
    ]

    // Obtener la secuencia del nivel actual
    const levelSequence = sequences[level - 1]
    setCurrentSequence(levelSequence)

    // Mezclar el orden de los elementos para cada nivel
    const shuffledSequence = [...levelSequence.items].sort(() => Math.random() - 0.5)

    setSequenceItems(shuffledSequence)
  }

  const selectItem = (itemId: string) => {
    if (userSequence.includes(itemId)) return

    setUserSequence([...userSequence, itemId])
  }

  const removeItem = (itemId: string) => {
    setUserSequence(userSequence.filter((id) => id !== itemId))
  }

  const resetSequence = () => {
    setUserSequence([])
    setMessage("")
    setShowSuccess(false)
  }

  const checkSequence = async () => {
    if (!userId) return

    setAttempts(attempts + 1)

    // Verificar si la secuencia está completa
    if (userSequence.length !== sequenceItems.length) {
      setMessage("¡Debes ordenar todos los elementos!")
      return
    }

    // Verificar el orden correcto
    const isCorrect = userSequence.every((itemId, index) => {
      const item = sequenceItems.find((seq) => seq.id === itemId)
      return item && item.correctOrder === index + 1
    })

    try {
      await saveProgress(userId, 5, currentLevel, isCorrect)
    } catch (error) {
      console.error("Error al guardar el progreso:", error)
    }

    if (isCorrect) {
      setMessage("¡Perfecto! 🎉 Has ordenado la secuencia correctamente")
      setShowSuccess(true)

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
    } else {
      if (attempts < 2) {
        setMessage("¡Casi lo tienes! Piensa en el orden lógico de los pasos.")
      } else if (attempts < 4) {
        setMessage("Intenta pensar: ¿qué debe pasar primero? ¿Y después?")
      } else {
        setMessage("¡Sigue intentando! Cada paso debe seguir al anterior.")
      }
    }
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
    <div className="min-h-screen bg-gradient-to-b from-purple-200 to-pink-200 py-8 bg-[url('/placeholder.svg?height=200&width=200')] bg-repeat">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <Link href="/modules">
            <Button variant="outline" className="flex items-center gap-2 bg-white rounded-full p-6 shadow-md">
              <ArrowLeft className="h-6 w-6" />
              <span className="text-lg">Volver a los módulos</span>
            </Button>
          </Link>
          <div className="text-center bg-white p-4 rounded-2xl shadow-lg border-4 border-purple-400">
            <h1 className="text-3xl font-bold text-purple-600">Módulo 5: ¡Secuencias Temporales!</h1>
            <p className="text-xl text-pink-500">Nivel {currentLevel} de 10</p>
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

        {/* Enunciado del nivel actual */}
        {currentSequence && (
          <div className="mb-8 text-center">
            <div className="inline-block bg-white p-6 rounded-2xl shadow-lg border-4 border-purple-400">
              <h2 className="text-2xl font-bold text-purple-600 mb-2">{currentSequence.title}</h2>
              <p className="text-lg text-gray-700">{currentSequence.instruction}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Área de secuencias disponibles */}
          <Card className="rounded-3xl overflow-hidden border-4 border-purple-400 shadow-xl">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-center mb-6 text-purple-600 flex items-center justify-center gap-2">
                <Clock className="h-8 w-8" />
                ¡Ordena los pasos!
              </h2>

              <div className="grid grid-cols-2 gap-4">
                {sequenceItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => selectItem(item.id)}
                    className={`p-4 rounded-xl border-3 cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                      userSequence.includes(item.id)
                        ? "bg-gray-200 border-gray-400 opacity-50 cursor-not-allowed"
                        : "bg-white border-purple-300 hover:border-purple-500 shadow-md"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-2">
                        {item.image.includes("text=") ? item.image.split("text=")[1] : "📝"}
                      </div>
                      <p className="text-sm font-medium text-gray-700">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Área de secuencia del usuario */}
          <Card className="rounded-3xl overflow-hidden border-4 border-purple-400 shadow-xl">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-center mb-6 text-purple-600">Tu secuencia:</h2>

              <div className="space-y-4 mb-6 min-h-[200px]">
                {userSequence.map((itemId, index) => {
                  const item = sequenceItems.find((seq) => seq.id === itemId)
                  if (!item) return null

                  return (
                    <div
                      key={`${itemId}-${index}`}
                      onClick={() => removeItem(itemId)}
                      className="flex items-center gap-4 p-4 bg-white rounded-xl border-2 border-pink-300 shadow-md cursor-pointer hover:bg-pink-50 transition-colors"
                    >
                      <div className="w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="text-3xl">
                        {item.image.includes("text=") ? item.image.split("text=")[1] : "📝"}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-700">{item.description}</p>
                      </div>
                    </div>
                  )
                })}

                {userSequence.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-xl">Selecciona los pasos en orden</p>
                    {currentSequence && <p className="text-sm mt-2 text-purple-600">{currentSequence.instruction}</p>}
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-4">
                <Button
                  onClick={resetSequence}
                  variant="outline"
                  className="bg-white text-purple-600 border-2 border-purple-300 rounded-xl px-6 py-3 flex items-center gap-2"
                >
                  <RotateCcw className="h-5 w-5" />
                  Reiniciar
                </Button>
                <Button
                  onClick={checkSequence}
                  disabled={userSequence.length === 0}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 rounded-xl px-8 py-3 text-lg shadow-lg"
                >
                  ¡Comprobar!
                </Button>
              </div>

              {message && (
                <div
                  className={`p-6 rounded-xl text-center text-lg mt-6 ${
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
            </CardContent>
          </Card>
        </div>

        {/* Elementos decorativos */}
        <div className="fixed bottom-4 left-4 animate-bounce text-5xl">⏰</div>
        <div className="fixed bottom-4 right-4 animate-bounce text-5xl">🔄</div>
      </div>
    </div>
  )
}
