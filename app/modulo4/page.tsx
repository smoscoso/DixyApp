"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, RotateCcw, CheckCircle } from "lucide-react"
import confetti from "canvas-confetti"
import { useRouter } from "next/navigation"
import { saveProgress } from "@/lib/actions"

export default function Modulo4Page() {
  const [currentLevel, setCurrentLevel] = useState(1)
  const [currentLetter, setCurrentLetter] = useState("")
  const [isDrawing, setIsDrawing] = useState(false)
  const [tracePoints, setTracePoints] = useState<{ x: number; y: number }[]>([])
  const [message, setMessage] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)
  const [hasFinishedDrawing, setHasFinishedDrawing] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [targetTrace, setTargetTrace] = useState<{ x: number; y: number }[]>([])
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
    const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]
    setCurrentLetter(letters[currentLevel - 1])
    setTracePoints([])
    setMessage("")
    setShowSuccess(false)
    setAttempts(0)
    setHasFinishedDrawing(false)
    generateTargetTrace(letters[currentLevel - 1])
  }, [currentLevel])

  // Configurar canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Dibujar guías para la letra
    drawLetterGuide(ctx, currentLetter)

    // Dibujar el trazo del usuario
    if (tracePoints.length > 1) {
      ctx.strokeStyle = "#3B82F6"
      ctx.lineWidth = 4
      ctx.lineCap = "round"
      ctx.beginPath()
      ctx.moveTo(tracePoints[0].x, tracePoints[0].y)
      for (let i = 1; i < tracePoints.length; i++) {
        ctx.lineTo(tracePoints[i].x, tracePoints[i].y)
      }
      ctx.stroke()
    }

    // Dibujar puntos de inicio y fin
    if (targetTrace.length > 0) {
      // Punto de inicio (verde)
      ctx.fillStyle = "#10B981"
      ctx.beginPath()
      ctx.arc(targetTrace[0].x, targetTrace[0].y, 8, 0, 2 * Math.PI)
      ctx.fill()

      // Punto final (rojo)
      ctx.fillStyle = "#EF4444"
      ctx.beginPath()
      ctx.arc(targetTrace[targetTrace.length - 1].x, targetTrace[targetTrace.length - 1].y, 8, 0, 2 * Math.PI)
      ctx.fill()
    }
  }, [tracePoints, currentLetter, targetTrace])

  const generateTargetTrace = (letter: string) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const width = 400
    const height = 300

    // Generar posiciones completamente aleatorias para cada letra
    const numPoints = 4 + Math.floor(Math.random() * 3) // Entre 4 y 6 puntos
    const randomTrace: { x: number; y: number }[] = []

    for (let i = 0; i < numPoints; i++) {
      // Generar posiciones aleatorias dentro de márgenes seguros
      const x = 50 + Math.random() * (width - 100)
      const y = 50 + Math.random() * (height - 100)
      randomTrace.push({ x, y })
    }

    setTargetTrace(randomTrace)
  }

  const drawLetterGuide = (ctx: CanvasRenderingContext2D, letter: string) => {
    if (targetTrace.length === 0) return

    // Dibujar línea guía punteada
    ctx.setLineDash([5, 5])
    ctx.strokeStyle = "#D1D5DB"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(targetTrace[0].x, targetTrace[0].y)
    for (let i = 1; i < targetTrace.length; i++) {
      ctx.lineTo(targetTrace[i].x, targetTrace[i].y)
    }
    ctx.stroke()
    ctx.setLineDash([])
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0) {
      // Click izquierdo
      setIsDrawing(true)
      setTracePoints([])
      setHasFinishedDrawing(false)
      setMessage("¡Dibujando! Mantén presionado y sigue la línea punteada...")

      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      setTracePoints([{ x, y }])
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setTracePoints((prev) => [...prev, { x, y }])
  }

  const handleMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false)
      setHasFinishedDrawing(true)
      setMessage("¡Dibujo completado! Ahora haz clic en 'Terminar' para verificar tu trazo.")
    }
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    setIsDrawing(true)
    setTracePoints([])
    setHasFinishedDrawing(false)
    setMessage("¡Dibujando! Mantén presionado y sigue la línea punteada...")

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const touch = e.touches[0]
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top

    setTracePoints([{ x, y }])
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const touch = e.touches[0]
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top

    setTracePoints((prev) => [...prev, { x, y }])
  }

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (isDrawing) {
      setIsDrawing(false)
      setHasFinishedDrawing(true)
      setMessage("¡Dibujo completado! Ahora haz clic en 'Terminar' para verificar tu trazo.")
    }
  }

  const finishDrawing = async () => {
    if (!userId || !hasFinishedDrawing) return

    setAttempts(attempts + 1)

    // Analizar la precisión del trazo
    const accuracy = calculateTraceAccuracy()
    const success = accuracy > 70

    try {
      await saveProgress(userId, 4, currentLevel, success)
    } catch (error) {
      console.error("Error al guardar el progreso:", error)
    }

    if (success) {
      setMessage(`¡Excelente trazo! 🎉 Precisión: ${Math.round(accuracy)}%`)
      setShowSuccess(true)

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
    } else {
      if (attempts < 2) {
        setMessage(`¡Casi perfecto! Precisión: ${Math.round(accuracy)}%. Intenta seguir mejor la línea guía.`)
      } else {
        setMessage(`Sigue practicando. Usa tu dedo para trazar la letra ${currentLetter}.`)
      }
    }
  }

  const calculateTraceAccuracy = (): number => {
    if (tracePoints.length === 0 || targetTrace.length === 0) return 0

    let minDistanceSum = 0

    for (const userPoint of tracePoints) {
      let minDistance = Number.POSITIVE_INFINITY
      for (const targetPoint of targetTrace) {
        const distance = Math.sqrt(Math.pow(userPoint.x - targetPoint.x, 2) + Math.pow(userPoint.y - targetPoint.y, 2))
        minDistance = Math.min(minDistance, distance)
      }
      minDistanceSum += minDistance
    }

    const averageDistance = minDistanceSum / tracePoints.length
    const maxAllowedDistance = 50
    const accuracy = Math.max(0, ((maxAllowedDistance - averageDistance) / maxAllowedDistance) * 100)

    return accuracy
  }

  const resetTrace = () => {
    setTracePoints([])
    setMessage("")
    setShowSuccess(false)
    setHasFinishedDrawing(false)
    setIsDrawing(false)
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
    <div className="min-h-screen bg-gradient-to-b from-orange-200 to-red-200 py-8 bg-[url('/placeholder.svg?height=200&width=200')] bg-repeat">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <Link href="/modules">
            <Button variant="outline" className="flex items-center gap-2 bg-white rounded-full p-6 shadow-md">
              <ArrowLeft className="h-6 w-6" />
              <span className="text-lg">Volver a los módulos</span>
            </Button>
          </Link>
          <div className="text-center bg-white p-4 rounded-2xl shadow-lg border-4 border-orange-400">
            <h1 className="text-3xl font-bold text-orange-600">Módulo 4: ¡Movimiento y Escritura!</h1>
            <p className="text-xl text-red-500">Nivel {currentLevel} de 10</p>
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
          {/* Área de trazado */}
          <Card className="rounded-3xl overflow-hidden border-4 border-orange-400 shadow-xl">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-center mb-6 text-orange-600">
                ¡Traza la letra: <span className="text-6xl text-red-600 animate-pulse">{currentLetter}</span>!
              </h2>

              <div className="mb-6">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={300}
                  className="border-4 border-orange-300 rounded-xl bg-white cursor-crosshair w-full max-w-md mx-auto block"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  style={{ touchAction: "none" }}
                />
              </div>

              <div className="flex justify-center gap-4">
                <Button
                  onClick={resetTrace}
                  variant="outline"
                  className="bg-white text-orange-600 border-2 border-orange-300 rounded-xl px-6 py-3 flex items-center gap-2"
                >
                  <RotateCcw className="h-5 w-5" />
                  Limpiar
                </Button>

                <Button
                  onClick={finishDrawing}
                  disabled={!hasFinishedDrawing}
                  className={`rounded-xl px-8 py-3 text-lg shadow-lg flex items-center gap-2 ${
                    hasFinishedDrawing
                      ? "bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  <CheckCircle className="h-5 w-5" />
                  Terminar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Instrucciones */}
          <Card className="rounded-3xl overflow-hidden border-4 border-orange-400 shadow-xl">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-center mb-6 text-orange-600">¡Instrucciones!</h2>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-md">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-lg">Punto verde = ¡Empezar aquí!</span>
                </div>
                <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-md">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-lg">Punto rojo = ¡Terminar aquí!</span>
                </div>
                <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-md">
                  <div className="w-4 h-4 border-2 border-gray-400 border-dashed"></div>
                  <span className="text-lg">Línea punteada = ¡Sigue esta guía!</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2 bg-white p-3 rounded-lg shadow">
                  <span className="text-green-500 text-xl mt-1">1️⃣</span>
                  <span className="text-lg">Haz clic izquierdo y mantén presionado</span>
                </li>
                <li className="flex items-start gap-2 bg-white p-3 rounded-lg shadow">
                  <span className="text-green-500 text-xl mt-1">2️⃣</span>
                  <span className="text-lg">Arrastra siguiendo la línea punteada</span>
                </li>
                <li className="flex items-start gap-2 bg-white p-3 rounded-lg shadow">
                  <span className="text-green-500 text-xl mt-1">3️⃣</span>
                  <span className="text-lg">Suelta el botón al terminar</span>
                </li>
                <li className="flex items-start gap-2 bg-white p-3 rounded-lg shadow">
                  <span className="text-green-500 text-xl mt-1">4️⃣</span>
                  <span className="text-lg">¡Haz clic en "Terminar" para verificar!</span>
                </li>
              </ul>

              {message && (
                <div
                  className={`p-6 rounded-xl text-center text-lg ${
                    showSuccess
                      ? "bg-green-100 text-green-800 border-4 border-green-400"
                      : hasFinishedDrawing
                        ? "bg-blue-100 text-blue-800 border-4 border-blue-400"
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
        <div className="fixed bottom-4 left-4 animate-bounce text-5xl">🤸</div>
        <div className="fixed bottom-4 right-4 animate-bounce text-5xl">✨</div>
      </div>
    </div>
  )
}
