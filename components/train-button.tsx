"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import confetti from "canvas-confetti"
import { trainAllNetworks } from "@/lib/train-networks"

export default function TrainButton() {
  const [isTraining, setIsTraining] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState("")
  const [isComplete, setIsComplete] = useState(false)

  const handleTrain = async () => {
    if (isTraining) return

    setIsTraining(true)
    setProgress(0)
    setStatus("Preparando el entrenamiento...")
    setIsComplete(false)

    try {
      // Iniciar el entrenamiento
      await trainAllNetworks({
        onProgress: (percent, message) => {
          setProgress(percent)
          setStatus(message)
        },
      })

      // Entrenamiento completado
      setProgress(100)
      setStatus("¡Todas las redes neuronales han sido entrenadas con éxito!")
      setIsComplete(true)

      // Lanzar confeti para celebrar
      confetti({
        particleCount: 200,
        spread: 160,
        origin: { y: 0.6 },
      })
    } catch (error) {
      console.error("Error en el entrenamiento:", error)
      setStatus("Ocurrió un error durante el entrenamiento. Por favor, intenta de nuevo.")
    } finally {
      setIsTraining(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      {!isTraining && !isComplete ? (
        <Button
          onClick={handleTrain}
          className="w-full py-8 text-2xl rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg transform transition-transform hover:scale-105"
        >
          ¡Entrenar Todas las Redes Neuronales! 🧠
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <Progress value={progress} className="h-8 rounded-xl" />
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
              <span className="text-white font-bold drop-shadow-md">{progress}%</span>
            </div>
          </div>
          <p className="text-center text-lg font-medium">{status}</p>

          {isComplete && (
            <Button
              onClick={() => setIsComplete(false)}
              className="w-full py-4 text-xl rounded-xl bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 shadow-lg"
            >
              ¡Listo para Jugar! 🎮
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
