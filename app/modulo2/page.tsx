"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Volume2, RotateCcw } from "lucide-react"
import confetti from "canvas-confetti"
import { useRouter } from "next/navigation"
import { saveProgress } from "@/lib/actions"

export default function Modulo2Page() {
  const [currentLevel, setCurrentLevel] = useState(1)
  const [targetWord, setTargetWord] = useState("")
  const [targetImage, setTargetImage] = useState("")
  const [availableLetters, setAvailableLetters] = useState<string[]>([])
  const [selectedLetters, setSelectedLetters] = useState<string[]>([])
  const [message, setMessage] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [attempts, setAttempts] = useState(0)
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
    // Lista de palabras para formar con sus imágenes correspondientes
    const wordList = [
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

    // Generar niveles aleatorios
    const generateRandomLevels = () => {
      const shuffled = [...wordList].sort(() => 0.5 - Math.random())
      return shuffled.slice(0, 10)
    }

    // Obtener niveles del localStorage o generar nuevos
    let levelWords = JSON.parse(localStorage.getItem("module2Words") || "null")

    if (!levelWords) {
      levelWords = generateRandomLevels()
      localStorage.setItem("module2Words", JSON.stringify(levelWords))
    }

    if (currentLevel <= levelWords.length) {
      const wordData = levelWords[currentLevel - 1]
      setTargetWord(wordData.word)
      setTargetImage(wordData.image)

      // Crear letras disponibles (letras de la palabra + algunas adicionales)
      const wordLetters = wordData.word.split("")
      const extraLetters = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ"
        .split("")
        .filter((letter) => !wordLetters.includes(letter))
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.max(3, 8 - wordLetters.length))

      const allLetters = [...wordLetters, ...extraLetters].sort(() => 0.5 - Math.random())
      setAvailableLetters(allLetters)
      setSelectedLetters([])
      setMessage("")
      setShowSuccess(false)
      setAttempts(0)
    }
  }, [currentLevel])

  const playSound = () => {
    setIsPlaying(true)

    const utterance = new SpeechSynthesisUtterance(targetWord)
    utterance.lang = "es-ES"
    utterance.rate = 0.8

    window.speechSynthesis.speak(utterance)

    setTimeout(() => {
      setIsPlaying(false)
    }, 2000)
  }

  const selectLetter = (letter: string, index: number) => {
    if (selectedLetters.length < targetWord.length) {
      setSelectedLetters([...selectedLetters, letter])
      setAvailableLetters(availableLetters.filter((_, i) => i !== index))
    }
  }

  const removeLetter = (index: number) => {
    const letter = selectedLetters[index]
    setSelectedLetters(selectedLetters.filter((_, i) => i !== index))
    setAvailableLetters([...availableLetters, letter])
  }

  const resetLetters = () => {
    const wordData = JSON.parse(localStorage.getItem("module2Words") || "[]")[currentLevel - 1]
    if (wordData) {
      const wordLetters = wordData.word.split("")
      const extraLetters = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ"
        .split("")
        .filter((letter) => !wordLetters.includes(letter))
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.max(3, 8 - wordLetters.length))

      const allLetters = [...wordLetters, ...extraLetters].sort(() => 0.5 - Math.random())
      setAvailableLetters(allLetters)
      setSelectedLetters([])
    }
  }

  const checkWord = async () => {
    if (!userId) return

    setAttempts(attempts + 1)
    const formedWord = selectedLetters.join("")
    const success = formedWord === targetWord

    try {
      await saveProgress(userId, 2, currentLevel, success)
    } catch (error) {
      console.error("Error al guardar el progreso:", error)
    }

    if (success) {
      setMessage(`¡Excelente! 🎉 Has formado correctamente la palabra "${targetWord}"`)
      setShowSuccess(true)

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
    } else {
      if (attempts < 2) {
        setMessage(`¡Casi lo tienes! La palabra que formaste es "${formedWord}". Intenta de nuevo.`)
      } else if (attempts < 4) {
        setMessage(`¡Sigue intentando! Escucha bien la palabra y ordena las letras.`)
      } else {
        setMessage(`La palabra correcta es "${targetWord}". ¡Inténtalo de nuevo!`)
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
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-cyan-200 py-8 bg-[url('/placeholder.svg?height=200&width=200')] bg-repeat">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <Link href="/modules">
            <Button variant="outline" className="flex items-center gap-2 bg-white rounded-full p-6 shadow-md">
              <ArrowLeft className="h-6 w-6" />
              <span className="text-lg">Volver a los módulos</span>
            </Button>
          </Link>
          <div className="text-center bg-white p-4 rounded-2xl shadow-lg border-4 border-blue-400">
            <h1 className="text-3xl font-bold text-blue-600">Módulo 2: ¡Forma la Palabra!</h1>
            <p className="text-xl text-cyan-500">Nivel {currentLevel} de 10</p>
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
          <Card className="rounded-3xl overflow-hidden border-4 border-blue-400 shadow-xl">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">¡Escucha y observa!</h2>

              <div className="flex justify-center mb-8">
                <Button
                  onClick={playSound}
                  className={`w-32 h-32 rounded-full flex items-center justify-center shadow-lg transform transition-all duration-300 hover:scale-110 ${
                    isPlaying
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 animate-pulse"
                      : "bg-gradient-to-r from-blue-500 to-cyan-500"
                  }`}
                >
                  <Volume2 className={`h-16 w-16 ${isPlaying ? "animate-bounce" : ""}`} />
                </Button>
              </div>

              {/* Imagen de referencia */}
              <div className="bg-white p-6 rounded-2xl border-4 border-cyan-300 shadow-lg">
                <h3 className="text-lg font-bold text-center mb-4 text-blue-600">Imagen de ayuda:</h3>
                <div className="flex justify-center">
                  <img
                    src={targetImage || "/placeholder.svg"}
                    alt={`Imagen de ${targetWord}`}
                    className="w-48 h-48 object-cover rounded-xl border-2 border-blue-300 bg-gray-100"
                    onError={(e) => {
                      // Si la imagen falla al cargar, usar una imagen de respaldo
                      const target = e.target as HTMLImageElement
                      target.src = `/placeholder.svg?height=200&width=200&text=${encodeURIComponent(targetWord)}`
                      console.log(`Error cargando imagen: ${targetImage}, usando respaldo`)
                    }}
                    onLoad={() => {
                      console.log(`Imagen cargada exitosamente: ${targetImage}`)
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

          {/* Columna derecha - Formación de palabras */}
          <Card className="rounded-3xl overflow-hidden border-4 border-blue-400 shadow-xl">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-center mb-8 text-blue-600">
                ¡Escucha la palabra y forma las letras!
              </h2>

              {/* Área para formar la palabra */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-center mb-4 text-blue-600">Forma la palabra aquí:</h3>
                <div className="flex justify-center gap-2 mb-4 min-h-[80px] items-center">
                  {Array.from({ length: targetWord.length }).map((_, index) => (
                    <div
                      key={index}
                      className="w-16 h-16 border-4 border-blue-300 rounded-xl bg-white flex items-center justify-center text-2xl font-bold cursor-pointer hover:bg-blue-50"
                      onClick={() => selectedLetters[index] && removeLetter(index)}
                    >
                      {selectedLetters[index] || ""}
                    </div>
                  ))}
                </div>
              </div>

              {/* Letras disponibles */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-center mb-4 text-blue-600">Letras disponibles:</h3>
                <div className="flex flex-wrap justify-center gap-3">
                  {availableLetters.map((letter, index) => (
                    <Button
                      key={index}
                      onClick={() => selectLetter(letter, index)}
                      className="w-14 h-14 text-xl font-bold bg-white text-blue-600 hover:bg-blue-100 border-2 border-blue-300 rounded-xl shadow-md transform transition-all duration-200 hover:scale-110"
                      variant="outline"
                    >
                      {letter}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-center gap-4 mb-8">
                <Button
                  onClick={resetLetters}
                  variant="outline"
                  className="flex items-center gap-2 bg-white text-blue-600 border-2 border-blue-300 rounded-xl px-6 py-3"
                >
                  <RotateCcw className="h-5 w-5" />
                  Reiniciar
                </Button>
                <Button
                  onClick={checkWord}
                  disabled={selectedLetters.length !== targetWord.length}
                  className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 rounded-xl px-8 py-3 text-lg shadow-lg"
                >
                  ¡Comprobar!
                </Button>
                <Button
                  onClick={playSound}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 rounded-xl px-6 py-3 flex items-center gap-2"
                >
                  <Volume2 className="h-5 w-5" />
                  Escuchar
                </Button>
              </div>

              {message && (
                <div
                  className={`p-6 rounded-xl text-center text-xl ${
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
        <div className="fixed bottom-4 left-4 animate-bounce text-5xl">🧩</div>
        <div className="fixed bottom-4 right-4 animate-bounce text-5xl">🔤</div>
      </div>
    </div>
  )
}
