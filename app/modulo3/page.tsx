"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Volume2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import confetti from "canvas-confetti"
import { useRouter } from "next/navigation"
import { saveProgress } from "@/lib/actions"

export default function Modulo3Page() {
  const [currentLevel, setCurrentLevel] = useState(1)
  const [targetWord, setTargetWord] = useState("")
  const [userInput, setUserInput] = useState("")
  const [message, setMessage] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [hint, setHint] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [userId, setUserId] = useState<string | null>(null)
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
    // Palabras que comúnmente causan confusión en niños con dislexia
    const dyslexiaWords = [
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

    // Generar niveles aleatorios
    const generateRandomLevels = () => {
      const shuffled = [...dyslexiaWords].sort(() => 0.5 - Math.random())
      return shuffled.slice(0, 10)
    }

    // Obtener niveles del localStorage o generar nuevos
    let levelData = JSON.parse(localStorage.getItem("module3DyslexiaLevels") || "null")

    if (!levelData) {
      levelData = generateRandomLevels()
      localStorage.setItem("module3DyslexiaLevels", JSON.stringify(levelData))
    }

    if (currentLevel <= levelData.length) {
      const level = levelData[currentLevel - 1]
      setTargetWord(level.word)
      setHint(level.hint)
      setImageUrl(level.image)
      setUserInput("")
      setMessage("")
      setShowSuccess(false)
      setAttempts(0)
    }
  }, [currentLevel])

  const playSound = () => {
    setIsPlaying(true)

    const utterance = new SpeechSynthesisUtterance(targetWord)
    utterance.lang = "es-ES"
    utterance.rate = 0.6 // Más lento para palabras difíciles

    window.speechSynthesis.speak(utterance)

    setTimeout(() => {
      setIsPlaying(false)
    }, 2500)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userId) return

    setAttempts(attempts + 1)
    const success = userInput.toUpperCase() === targetWord

    try {
      await saveProgress(userId, 3, currentLevel, success)
    } catch (error) {
      console.error("Error al guardar el progreso:", error)
    }

    if (success) {
      setMessage(`¡Fantástico! 🎉 Has escrito correctamente la palabra "${targetWord}"`)
      setShowSuccess(true)

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
    } else {
      // Calcular similitud para retroalimentación específica
      let correctChars = 0
      const userUpper = userInput.toUpperCase()

      for (let i = 0; i < Math.min(userUpper.length, targetWord.length); i++) {
        if (userUpper[i] === targetWord[i]) {
          correctChars++
        }
      }

      const similarity = Math.floor((correctChars / targetWord.length) * 100)

      if (similarity > 70) {
        setMessage(`¡Muy cerca! Tu respuesta "${userInput}" es muy similar. Revisa las letras.`)
      } else if (attempts >= 2) {
        setMessage(`Pista: ${hint}. Mira la imagen y escucha de nuevo.`)
      } else {
        setMessage(`Intenta de nuevo. Escucha con atención y mira la imagen.`)
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
    <div className="min-h-screen bg-gradient-to-b from-green-200 to-yellow-200 py-8 bg-[url('/placeholder.svg?height=200&width=200')] bg-repeat">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <Link href="/modules">
            <Button variant="outline" className="flex items-center gap-2 bg-white rounded-full p-6 shadow-md">
              <ArrowLeft className="h-6 w-6" />
              <span className="text-lg">Volver a los módulos</span>
            </Button>
          </Link>
          <div className="text-center bg-white p-4 rounded-2xl shadow-lg border-4 border-green-400">
            <h1 className="text-3xl font-bold text-green-600">Módulo 3: ¡Palabras Especiales!</h1>
            <p className="text-xl text-yellow-600">Nivel {currentLevel} de 10</p>
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
          {/* Columna izquierda - Audio e imagen */}
          <Card className="rounded-3xl overflow-hidden border-4 border-green-400 shadow-xl">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-center mb-6 text-green-600">¡Escucha y observa!</h2>

              <div className="flex justify-center mb-8">
                <Button
                  onClick={playSound}
                  className={`w-32 h-32 rounded-full flex items-center justify-center shadow-lg transform transition-all duration-300 hover:scale-110 ${
                    isPlaying
                      ? "bg-gradient-to-r from-green-600 to-yellow-600 animate-pulse"
                      : "bg-gradient-to-r from-green-500 to-yellow-500"
                  }`}
                >
                  <Volume2 className={`h-16 w-16 ${isPlaying ? "animate-bounce" : ""}`} />
                </Button>
              </div>

              {/* Imagen de referencia */}
              <div className="bg-white p-6 rounded-2xl border-4 border-yellow-300 shadow-lg">
                <h3 className="text-lg font-bold text-center mb-4 text-green-600">Imagen de ayuda:</h3>
                <div className="flex justify-center">
                  <img
                    src={imageUrl || "/placeholder.svg"}
                    alt={`Imagen de ${targetWord}`}
                    className="w-48 h-48 object-cover rounded-xl border-2 border-green-300 bg-gray-100"
                    onError={(e) => {
                      // Si la imagen falla al cargar, usar una imagen de respaldo
                      const target = e.target as HTMLImageElement
                      target.src = `/placeholder.svg?height=200&width=200&text=${encodeURIComponent(targetWord)}`
                      console.log(`Error cargando imagen: ${imageUrl}, usando respaldo`)
                    }}
                    onLoad={() => {
                      console.log(`Imagen cargada exitosamente: ${imageUrl}`)
                    }}
                  />
                </div>
              </div>

              <div className="mt-6 text-center">
                <Button
                  onClick={playSound}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 rounded-full px-6 py-3 text-lg shadow-lg flex items-center gap-2 mx-auto"
                >
                  <Volume2 className="h-5 w-5" />
                  Escuchar de nuevo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Columna derecha - Entrada de texto */}
          <Card className="rounded-3xl overflow-hidden border-4 border-green-400 shadow-xl">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-center mb-6 text-green-600">¡Escribe la palabra!</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <Input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Escribe la palabra aquí..."
                    className="text-3xl p-6 rounded-xl border-4 border-green-300 shadow-md text-center"
                    autoComplete="off"
                  />
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 rounded-xl py-4 text-xl shadow-lg"
                  >
                    ¡Comprobar!
                  </Button>
                </div>
              </form>

              {/* Pista visual */}
              <div className="mt-6 bg-blue-100 p-4 rounded-xl border-2 border-blue-300">
                <h3 className="text-lg font-bold text-blue-600 mb-2">💡 Pista:</h3>
                <p className="text-lg text-blue-800">{hint}</p>
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

              {/* Información adicional */}
              <div className="mt-6 text-center text-sm text-gray-600">
                <p className="mb-2">💡 Estas palabras pueden ser un poco difíciles, ¡pero tú puedes!</p>
                <p>🎯 Intento {attempts + 1} - ¡Sigue intentando!</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Elementos decorativos */}
        <div className="fixed bottom-4 left-4 animate-bounce text-5xl">📚</div>
        <div className="fixed bottom-4 right-4 animate-bounce text-5xl">🌟</div>
      </div>
    </div>
  )
}
