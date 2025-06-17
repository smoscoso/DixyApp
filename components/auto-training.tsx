"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import confetti from "canvas-confetti"
import { trainAllNetworks, areNetworksTrained, clearTrainingState } from "@/lib/train-networks"

interface AutoTrainingProps {
  onTrainingComplete: () => void
  userName: string
}

export default function AutoTraining({ onTrainingComplete, userName }: AutoTrainingProps) {
  const [isTraining, setIsTraining] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState("")
  const [isComplete, setIsComplete] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [error, setError] = useState("")

  // Verificar si ya están entrenadas al cargar el componente
  useEffect(() => {
    console.log("🔍 AutoTraining: Verificando estado inicial de las redes")
    const alreadyTrained = areNetworksTrained()

    if (alreadyTrained) {
      console.log("✅ AutoTraining: Las redes ya están entrenadas")
      setProgress(100)
      setStatus("¡Las redes neuronales ya están entrenadas y listas!")
      setIsComplete(true)
      setHasStarted(true)
    } else {
      console.log("⚠️ AutoTraining: Las redes necesitan ser entrenadas")
    }
  }, [])

  const handleStartTraining = async () => {
    if (isTraining) {
      console.log("⚠️ AutoTraining: Ya está entrenando, ignorando clic")
      return
    }

    console.log("🚀 AutoTraining: Iniciando proceso de entrenamiento")

    setHasStarted(true)
    setIsTraining(true)
    setProgress(0)
    setStatus("Iniciando proceso de entrenamiento...")
    setIsComplete(false)
    setError("")

    try {
      console.log("🧹 AutoTraining: Limpiando estado previo")
      // Limpiar estado previo para asegurar entrenamiento fresco
      clearTrainingState()

      console.log("🎯 AutoTraining: Llamando a trainAllNetworks")

      // Iniciar el entrenamiento
      await trainAllNetworks({
        onProgress: (percent, message) => {
          console.log(`📊 AutoTraining: Progreso ${percent}% - ${message}`)
          setProgress(percent)
          setStatus(message)
        },
      })

      // Entrenamiento completado
      console.log("🎉 AutoTraining: Entrenamiento completado exitosamente")
      setProgress(100)
      setStatus("¡Todas las redes neuronales han sido entrenadas con éxito!")
      setIsComplete(true)

      // Verificar que realmente se completó
      const finalCheck = areNetworksTrained()
      console.log("🔍 AutoTraining: Verificación final de entrenamiento:", finalCheck)

      // Lanzar confeti para celebrar
      confetti({
        particleCount: 200,
        spread: 160,
        origin: { y: 0.6 },
      })
    } catch (error) {
      console.error("❌ AutoTraining: Error en el entrenamiento:", error)
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      setError(errorMessage)
      setStatus(`Error: ${errorMessage}`)
      setProgress(0)
    } finally {
      setIsTraining(false)
    }
  }

  const handleContinue = () => {
    console.log("✅ AutoTraining: Usuario continuando a módulos")
    onTrainingComplete()
  }

  const handleRetry = () => {
    console.log("🔄 AutoTraining: Usuario reintentando entrenamiento")
    setError("")
    setHasStarted(false)
    setProgress(0)
    setStatus("")
    setIsComplete(false)

    // Limpiar estado para forzar re-entrenamiento
    clearTrainingState()
  }

  const handleForceStart = () => {
    console.log("🔧 AutoTraining: Forzando inicio de entrenamiento")
    clearTrainingState()
    setHasStarted(false)
    setIsComplete(false)
    setProgress(0)
    setStatus("")
    setError("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-200 to-blue-200 flex items-center justify-center bg-[url('/placeholder.svg?height=200&width=200')] bg-repeat">
      <Card className="w-full max-w-2xl mx-auto rounded-3xl overflow-hidden border-4 border-purple-400 shadow-xl">
        <CardContent className="p-8">
          {!hasStarted ? (
            <div className="text-center space-y-6">
              <div className="inline-block bg-white p-6 rounded-full shadow-xl border-4 border-yellow-400">
                <h1 className="text-4xl font-bold text-purple-600 mb-4">¡Hola {userName}!</h1>
                <p className="text-2xl text-pink-500">¡Bienvenido a tu aventura de aprendizaje!</p>
              </div>

              <div className="bg-yellow-100 p-6 rounded-2xl border-4 border-yellow-400">
                <h2 className="text-2xl font-bold text-orange-600 mb-4">🧠 ¡Preparemos tu aventura!</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Antes de comenzar, necesitamos entrenar a nuestros amigos mágicos (las redes neuronales) para que
                  puedan ayudarte a aprender de la mejor manera.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h3 className="font-semibold text-blue-800 mb-2">¿Qué vamos a hacer?</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Módulo 1: Cargar pesos pre-entrenados para reconocimiento de letras</li>
                    <li>• Módulo 2: Entrenar red para formación de palabras</li>
                    <li>• Módulo 3: Entrenar red para palabras complejas de dislexia</li>
                  </ul>
                </div>
                <p className="text-lg text-gray-700">
                  ¡Solo tomará unos momentos y después podrás jugar con todos los módulos!
                </p>
              </div>

              <Button
                onClick={handleStartTraining}
                disabled={isTraining}
                className="w-full py-8 text-2xl rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg transform transition-transform hover:scale-105 disabled:opacity-50"
              >
                {isTraining ? "Entrenando..." : "¡Entrenar Redes Neuronales!"} 🧠
              </Button>

              <div className="flex justify-center gap-6">
                <div className="animate-bounce text-5xl">🧠</div>
                <div className="animate-bounce delay-100 text-5xl">✨</div>
                <div className="animate-bounce delay-200 text-5xl">🔮</div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-purple-600 mb-4">
                  {isComplete ? "¡Todo listo!" : error ? "¡Ups! Algo salió mal" : "Entrenando redes neuronales..."}
                </h2>
                <p className="text-xl text-gray-700">
                  {isComplete
                    ? "¡Tus amigos mágicos están listos para ayudarte!"
                    : error
                      ? "Hubo un problema durante el entrenamiento"
                      : "Estamos preparando todo para ti..."}
                </p>
              </div>

              <div className="relative">
                <Progress value={progress} className="h-8 rounded-xl" />
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                  <span className="text-white font-bold drop-shadow-md">{progress}%</span>
                </div>
              </div>

              <div
                className={`p-4 rounded-xl border-2 ${error ? "bg-red-100 border-red-300" : "bg-blue-100 border-blue-300"}`}
              >
                <p className={`text-center text-lg font-medium ${error ? "text-red-800" : "text-blue-800"}`}>
                  {status}
                </p>
              </div>

              {error && (
                <div className="flex gap-4">
                  <Button
                    onClick={handleRetry}
                    className="flex-1 py-4 text-xl rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg"
                  >
                    Intentar de Nuevo 🔄
                  </Button>
                </div>
              )}

              {isComplete && (
                <div className="space-y-4">
                  <Button
                    onClick={handleContinue}
                    className="w-full py-6 text-2xl rounded-xl bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 shadow-lg"
                  >
                    ¡Comenzar a Jugar! 🎮
                  </Button>

                  <Button
                    onClick={handleForceStart}
                    variant="outline"
                    className="w-full py-2 text-sm rounded-xl border-2 border-gray-300"
                  >
                    🔧 Entrenar de Nuevo (Desarrollador)
                  </Button>
                </div>
              )}

              <div className="flex justify-center gap-6">
                <div className={`text-4xl ${isTraining ? "animate-spin" : "animate-bounce"}`}>🧠</div>
                <div className={`text-4xl ${isTraining ? "animate-pulse" : "animate-bounce delay-100"}`}>⚡</div>
                <div className={`text-4xl ${isTraining ? "animate-bounce" : "animate-bounce delay-200"}`}>🎯</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
