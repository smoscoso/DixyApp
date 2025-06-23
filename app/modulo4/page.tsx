"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, RotateCcw, CheckCircle } from "lucide-react"
import confetti from "canvas-confetti"
import { useRouter } from "next/navigation"
import { saveProgress } from "@/lib/actions"

interface Point {
  x: number
  y: number
}

interface LetterPath {
  points: Point[]
  letter: string
}

export default function Modulo4Page() {
  const [currentLevel, setCurrentLevel] = useState<number>(1)
  const [currentLetter, setCurrentLetter] = useState<string>("")
  const [isDrawing, setIsDrawing] = useState<boolean>(false)
  const [userPath, setUserPath] = useState<Point[]>([])
  const [message, setMessage] = useState<string>("")
  const [showSuccess, setShowSuccess] = useState<boolean>(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [hasFinishedDrawing, setHasFinishedDrawing] = useState<boolean>(false)
  const [selectedLetters, setSelectedLetters] = useState<string[]>([])
  const [completedLevels, setCompletedLevels] = useState<number>(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const router = useRouter()

  // Alfabeto completo
  const alphabet: string[] = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
  ]

  // Verificar usuario
  useEffect(() => {
    const id = localStorage.getItem("userId")
    if (!id) {
      router.push("/")
      return
    }
    setUserId(id)
  }, [router])

  // Seleccionar 10 letras aleatorias al inicio
  useEffect(() => {
    const shuffled = [...alphabet].sort(() => 0.5 - Math.random())
    const selected = shuffled.slice(0, 10)
    setSelectedLetters(selected)
    setCurrentLetter(selected[0])
  }, [])

  // Obtener plantilla de letra con líneas entrecortadas
  const getLetterTemplate = useCallback((letter: string): Point[] => {
    const centerX = 200
    const centerY = 150
    const scale = 1.5

    switch (letter) {
      case "A": {
        return [
          // Línea izquierda
          { x: centerX - 40 * scale, y: centerY + 60 * scale },
          { x: centerX - 35 * scale, y: centerY + 45 * scale },
          { x: centerX - 30 * scale, y: centerY + 30 * scale },
          { x: centerX - 25 * scale, y: centerY + 15 * scale },
          { x: centerX - 20 * scale, y: centerY },
          { x: centerX - 15 * scale, y: centerY - 15 * scale },
          { x: centerX - 10 * scale, y: centerY - 30 * scale },
          { x: centerX - 5 * scale, y: centerY - 45 * scale },
          { x: centerX, y: centerY - 60 * scale },
          // Línea derecha
          { x: centerX + 5 * scale, y: centerY - 45 * scale },
          { x: centerX + 10 * scale, y: centerY - 30 * scale },
          { x: centerX + 15 * scale, y: centerY - 15 * scale },
          { x: centerX + 20 * scale, y: centerY },
          { x: centerX + 25 * scale, y: centerY + 15 * scale },
          { x: centerX + 30 * scale, y: centerY + 30 * scale },
          { x: centerX + 35 * scale, y: centerY + 45 * scale },
          { x: centerX + 40 * scale, y: centerY + 60 * scale },
          // Barra horizontal
          { x: centerX - 20 * scale, y: centerY },
          { x: centerX - 10 * scale, y: centerY },
          { x: centerX, y: centerY },
          { x: centerX + 10 * scale, y: centerY },
          { x: centerX + 20 * scale, y: centerY },
        ]
      }
      case "B": {
        return [
          // Línea vertical
          { x: centerX - 30 * scale, y: centerY - 60 * scale },
          { x: centerX - 30 * scale, y: centerY - 45 * scale },
          { x: centerX - 30 * scale, y: centerY - 30 * scale },
          { x: centerX - 30 * scale, y: centerY - 15 * scale },
          { x: centerX - 30 * scale, y: centerY },
          { x: centerX - 30 * scale, y: centerY + 15 * scale },
          { x: centerX - 30 * scale, y: centerY + 30 * scale },
          { x: centerX - 30 * scale, y: centerY + 45 * scale },
          { x: centerX - 30 * scale, y: centerY + 60 * scale },
          // Curva superior
          { x: centerX - 20 * scale, y: centerY - 60 * scale },
          { x: centerX - 10 * scale, y: centerY - 60 * scale },
          { x: centerX, y: centerY - 60 * scale },
          { x: centerX + 10 * scale, y: centerY - 55 * scale },
          { x: centerX + 15 * scale, y: centerY - 45 * scale },
          { x: centerX + 15 * scale, y: centerY - 35 * scale },
          { x: centerX + 10 * scale, y: centerY - 25 * scale },
          { x: centerX, y: centerY - 20 * scale },
          { x: centerX - 10 * scale, y: centerY - 15 * scale },
          { x: centerX - 20 * scale, y: centerY - 10 * scale },
          { x: centerX - 30 * scale, y: centerY },
          // Curva inferior
          { x: centerX - 20 * scale, y: centerY },
          { x: centerX - 10 * scale, y: centerY + 5 * scale },
          { x: centerX, y: centerY + 10 * scale },
          { x: centerX + 10 * scale, y: centerY + 15 * scale },
          { x: centerX + 20 * scale, y: centerY + 25 * scale },
          { x: centerX + 25 * scale, y: centerY + 35 * scale },
          { x: centerX + 25 * scale, y: centerY + 45 * scale },
          { x: centerX + 20 * scale, y: centerY + 55 * scale },
          { x: centerX + 10 * scale, y: centerY + 60 * scale },
          { x: centerX, y: centerY + 60 * scale },
          { x: centerX - 10 * scale, y: centerY + 60 * scale },
          { x: centerX - 20 * scale, y: centerY + 60 * scale },
          { x: centerX - 30 * scale, y: centerY + 60 * scale },
        ]
      }
      case "C": {
        return [
          { x: centerX + 25 * scale, y: centerY - 45 * scale },
          { x: centerX + 15 * scale, y: centerY - 55 * scale },
          { x: centerX + 5 * scale, y: centerY - 60 * scale },
          { x: centerX - 5 * scale, y: centerY - 60 * scale },
          { x: centerX - 15 * scale, y: centerY - 55 * scale },
          { x: centerX - 25 * scale, y: centerY - 45 * scale },
          { x: centerX - 30 * scale, y: centerY - 35 * scale },
          { x: centerX - 35 * scale, y: centerY - 25 * scale },
          { x: centerX - 35 * scale, y: centerY - 15 * scale },
          { x: centerX - 35 * scale, y: centerY - 5 * scale },
          { x: centerX - 35 * scale, y: centerY + 5 * scale },
          { x: centerX - 35 * scale, y: centerY + 15 * scale },
          { x: centerX - 35 * scale, y: centerY + 25 * scale },
          { x: centerX - 30 * scale, y: centerY + 35 * scale },
          { x: centerX - 25 * scale, y: centerY + 45 * scale },
          { x: centerX - 15 * scale, y: centerY + 55 * scale },
          { x: centerX - 5 * scale, y: centerY + 60 * scale },
          { x: centerX + 5 * scale, y: centerY + 60 * scale },
          { x: centerX + 15 * scale, y: centerY + 55 * scale },
          { x: centerX + 25 * scale, y: centerY + 45 * scale },
        ]
      }
      case "D": {
        return [
          // Línea vertical
          { x: centerX - 30 * scale, y: centerY - 60 * scale },
          { x: centerX - 30 * scale, y: centerY - 45 * scale },
          { x: centerX - 30 * scale, y: centerY - 30 * scale },
          { x: centerX - 30 * scale, y: centerY - 15 * scale },
          { x: centerX - 30 * scale, y: centerY },
          { x: centerX - 30 * scale, y: centerY + 15 * scale },
          { x: centerX - 30 * scale, y: centerY + 30 * scale },
          { x: centerX - 30 * scale, y: centerY + 45 * scale },
          { x: centerX - 30 * scale, y: centerY + 60 * scale },
          // Curva derecha
          { x: centerX - 20 * scale, y: centerY - 60 * scale },
          { x: centerX - 10 * scale, y: centerY - 60 * scale },
          { x: centerX, y: centerY - 60 * scale },
          { x: centerX + 10 * scale, y: centerY - 55 * scale },
          { x: centerX + 20 * scale, y: centerY - 45 * scale },
          { x: centerX + 25 * scale, y: centerY - 35 * scale },
          { x: centerX + 30 * scale, y: centerY - 20 * scale },
          { x: centerX + 30 * scale, y: centerY - 5 * scale },
          { x: centerX + 30 * scale, y: centerY + 5 * scale },
          { x: centerX + 30 * scale, y: centerY + 20 * scale },
          { x: centerX + 25 * scale, y: centerY + 35 * scale },
          { x: centerX + 20 * scale, y: centerY + 45 * scale },
          { x: centerX + 10 * scale, y: centerY + 55 * scale },
          { x: centerX, y: centerY + 60 * scale },
          { x: centerX - 10 * scale, y: centerY + 60 * scale },
          { x: centerX - 20 * scale, y: centerY + 60 * scale },
          { x: centerX - 30 * scale, y: centerY + 60 * scale },
        ]
      }
      case "E": {
        return [
          // Línea vertical
          { x: centerX - 30 * scale, y: centerY - 60 * scale },
          { x: centerX - 30 * scale, y: centerY - 45 * scale },
          { x: centerX - 30 * scale, y: centerY - 30 * scale },
          { x: centerX - 30 * scale, y: centerY - 15 * scale },
          { x: centerX - 30 * scale, y: centerY },
          { x: centerX - 30 * scale, y: centerY + 15 * scale },
          { x: centerX - 30 * scale, y: centerY + 30 * scale },
          { x: centerX - 30 * scale, y: centerY + 45 * scale },
          { x: centerX - 30 * scale, y: centerY + 60 * scale },
          // Línea horizontal superior
          { x: centerX - 20 * scale, y: centerY - 60 * scale },
          { x: centerX - 10 * scale, y: centerY - 60 * scale },
          { x: centerX, y: centerY - 60 * scale },
          { x: centerX + 10 * scale, y: centerY - 60 * scale },
          { x: centerX + 20 * scale, y: centerY - 60 * scale },
          // Línea horizontal media
          { x: centerX - 20 * scale, y: centerY },
          { x: centerX - 10 * scale, y: centerY },
          { x: centerX, y: centerY },
          { x: centerX + 10 * scale, y: centerY },
          // Línea horizontal inferior
          { x: centerX - 20 * scale, y: centerY + 60 * scale },
          { x: centerX - 10 * scale, y: centerY + 60 * scale },
          { x: centerX, y: centerY + 60 * scale },
          { x: centerX + 10 * scale, y: centerY + 60 * scale },
          { x: centerX + 20 * scale, y: centerY + 60 * scale },
        ]
      }
      case "F": {
        return [
          // Línea vertical
          { x: centerX - 30 * scale, y: centerY - 60 * scale },
          { x: centerX - 30 * scale, y: centerY - 45 * scale },
          { x: centerX - 30 * scale, y: centerY - 30 * scale },
          { x: centerX - 30 * scale, y: centerY - 15 * scale },
          { x: centerX - 30 * scale, y: centerY },
          { x: centerX - 30 * scale, y: centerY + 15 * scale },
          { x: centerX - 30 * scale, y: centerY + 30 * scale },
          { x: centerX - 30 * scale, y: centerY + 45 * scale },
          { x: centerX - 30 * scale, y: centerY + 60 * scale },
          // Línea horizontal superior
          { x: centerX - 20 * scale, y: centerY - 60 * scale },
          { x: centerX - 10 * scale, y: centerY - 60 * scale },
          { x: centerX, y: centerY - 60 * scale },
          { x: centerX + 10 * scale, y: centerY - 60 * scale },
          { x: centerX + 20 * scale, y: centerY - 60 * scale },
          // Línea horizontal media
          { x: centerX - 20 * scale, y: centerY },
          { x: centerX - 10 * scale, y: centerY },
          { x: centerX, y: centerY },
          { x: centerX + 10 * scale, y: centerY },
        ]
      }
      case "G": {
        return [
          { x: centerX + 25 * scale, y: centerY - 45 * scale },
          { x: centerX + 15 * scale, y: centerY - 55 * scale },
          { x: centerX + 5 * scale, y: centerY - 60 * scale },
          { x: centerX - 5 * scale, y: centerY - 60 * scale },
          { x: centerX - 15 * scale, y: centerY - 55 * scale },
          { x: centerX - 25 * scale, y: centerY - 45 * scale },
          { x: centerX - 30 * scale, y: centerY - 35 * scale },
          { x: centerX - 35 * scale, y: centerY - 25 * scale },
          { x: centerX - 35 * scale, y: centerY - 15 * scale },
          { x: centerX - 35 * scale, y: centerY - 5 * scale },
          { x: centerX - 35 * scale, y: centerY + 5 * scale },
          { x: centerX - 35 * scale, y: centerY + 15 * scale },
          { x: centerX - 35 * scale, y: centerY + 25 * scale },
          { x: centerX - 30 * scale, y: centerY + 35 * scale },
          { x: centerX - 25 * scale, y: centerY + 45 * scale },
          { x: centerX - 15 * scale, y: centerY + 55 * scale },
          { x: centerX - 5 * scale, y: centerY + 60 * scale },
          { x: centerX + 5 * scale, y: centerY + 60 * scale },
          { x: centerX + 15 * scale, y: centerY + 55 * scale },
          { x: centerX + 25 * scale, y: centerY + 45 * scale },
          { x: centerX + 30 * scale, y: centerY + 35 * scale },
          { x: centerX + 30 * scale, y: centerY + 25 * scale },
          { x: centerX + 30 * scale, y: centerY + 15 * scale },
          { x: centerX + 30 * scale, y: centerY + 5 * scale },
          // Línea horizontal interna
          { x: centerX + 20 * scale, y: centerY + 5 * scale },
          { x: centerX + 10 * scale, y: centerY + 5 * scale },
          { x: centerX, y: centerY + 5 * scale },
        ]
      }
      case "H": {
        return [
          // Línea vertical izquierda
          { x: centerX - 30 * scale, y: centerY - 60 * scale },
          { x: centerX - 30 * scale, y: centerY - 45 * scale },
          { x: centerX - 30 * scale, y: centerY - 30 * scale },
          { x: centerX - 30 * scale, y: centerY - 15 * scale },
          { x: centerX - 30 * scale, y: centerY },
          { x: centerX - 30 * scale, y: centerY + 15 * scale },
          { x: centerX - 30 * scale, y: centerY + 30 * scale },
          { x: centerX - 30 * scale, y: centerY + 45 * scale },
          { x: centerX - 30 * scale, y: centerY + 60 * scale },
          // Línea horizontal
          { x: centerX - 20 * scale, y: centerY },
          { x: centerX - 10 * scale, y: centerY },
          { x: centerX, y: centerY },
          { x: centerX + 10 * scale, y: centerY },
          { x: centerX + 20 * scale, y: centerY },
          { x: centerX + 30 * scale, y: centerY },
          // Línea vertical derecha
          { x: centerX + 30 * scale, y: centerY - 60 * scale },
          { x: centerX + 30 * scale, y: centerY - 45 * scale },
          { x: centerX + 30 * scale, y: centerY - 30 * scale },
          { x: centerX + 30 * scale, y: centerY - 15 * scale },
          { x: centerX + 30 * scale, y: centerY + 15 * scale },
          { x: centerX + 30 * scale, y: centerY + 30 * scale },
          { x: centerX + 30 * scale, y: centerY + 45 * scale },
          { x: centerX + 30 * scale, y: centerY + 60 * scale },
        ]
      }
      case "I": {
        return [
          // Línea horizontal superior
          { x: centerX - 30 * scale, y: centerY - 60 * scale },
          { x: centerX - 20 * scale, y: centerY - 60 * scale },
          { x: centerX - 10 * scale, y: centerY - 60 * scale },
          { x: centerX, y: centerY - 60 * scale },
          { x: centerX + 10 * scale, y: centerY - 60 * scale },
          { x: centerX + 20 * scale, y: centerY - 60 * scale },
          { x: centerX + 30 * scale, y: centerY - 60 * scale },
          // Línea vertical central
          { x: centerX, y: centerY - 45 * scale },
          { x: centerX, y: centerY - 30 * scale },
          { x: centerX, y: centerY - 15 * scale },
          { x: centerX, y: centerY },
          { x: centerX, y: centerY + 15 * scale },
          { x: centerX, y: centerY + 30 * scale },
          { x: centerX, y: centerY + 45 * scale },
          // Línea horizontal inferior
          { x: centerX - 30 * scale, y: centerY + 60 * scale },
          { x: centerX - 20 * scale, y: centerY + 60 * scale },
          { x: centerX - 10 * scale, y: centerY + 60 * scale },
          { x: centerX, y: centerY + 60 * scale },
          { x: centerX + 10 * scale, y: centerY + 60 * scale },
          { x: centerX + 20 * scale, y: centerY + 60 * scale },
          { x: centerX + 30 * scale, y: centerY + 60 * scale },
        ]
      }
      case "J": {
        return [
          // Línea horizontal superior
          { x: centerX - 20 * scale, y: centerY - 60 * scale },
          { x: centerX - 10 * scale, y: centerY - 60 * scale },
          { x: centerX, y: centerY - 60 * scale },
          { x: centerX + 10 * scale, y: centerY - 60 * scale },
          { x: centerX + 20 * scale, y: centerY - 60 * scale },
          { x: centerX + 30 * scale, y: centerY - 60 * scale },
          // Línea vertical derecha
          { x: centerX + 15 * scale, y: centerY - 45 * scale },
          { x: centerX + 15 * scale, y: centerY - 30 * scale },
          { x: centerX + 15 * scale, y: centerY - 15 * scale },
          { x: centerX + 15 * scale, y: centerY },
          { x: centerX + 15 * scale, y: centerY + 15 * scale },
          { x: centerX + 15 * scale, y: centerY + 30 * scale },
          { x: centerX + 15 * scale, y: centerY + 45 * scale },
          // Curva inferior
          { x: centerX + 10 * scale, y: centerY + 55 * scale },
          { x: centerX + 5 * scale, y: centerY + 60 * scale },
          { x: centerX - 5 * scale, y: centerY + 60 * scale },
          { x: centerX - 15 * scale, y: centerY + 55 * scale },
          { x: centerX - 25 * scale, y: centerY + 45 * scale },
          { x: centerX - 30 * scale, y: centerY + 35 * scale },
        ]
      }
      case "K": {
        return [
          // Línea vertical izquierda
          { x: centerX - 30 * scale, y: centerY - 60 * scale },
          { x: centerX - 30 * scale, y: centerY - 45 * scale },
          { x: centerX - 30 * scale, y: centerY - 30 * scale },
          { x: centerX - 30 * scale, y: centerY - 15 * scale },
          { x: centerX - 30 * scale, y: centerY },
          { x: centerX - 30 * scale, y: centerY + 15 * scale },
          { x: centerX - 30 * scale, y: centerY + 30 * scale },
          { x: centerX - 30 * scale, y: centerY + 45 * scale },
          { x: centerX - 30 * scale, y: centerY + 60 * scale },
          // Línea diagonal superior
          { x: centerX + 30 * scale, y: centerY - 60 * scale },
          { x: centerX + 20 * scale, y: centerY - 45 * scale },
          { x: centerX + 10 * scale, y: centerY - 30 * scale },
          { x: centerX, y: centerY - 15 * scale },
          { x: centerX - 10 * scale, y: centerY },
          { x: centerX - 20 * scale, y: centerY + 5 * scale },
          { x: centerX - 30 * scale, y: centerY + 10 * scale },
          // Línea diagonal inferior
          { x: centerX - 10 * scale, y: centerY },
          { x: centerX, y: centerY + 15 * scale },
          { x: centerX + 10 * scale, y: centerY + 30 * scale },
          { x: centerX + 20 * scale, y: centerY + 45 * scale },
          { x: centerX + 30 * scale, y: centerY + 60 * scale },
        ]
      }
      case "L": {
        return [
          // Línea vertical
          { x: centerX - 30 * scale, y: centerY - 60 * scale },
          { x: centerX - 30 * scale, y: centerY - 45 * scale },
          { x: centerX - 30 * scale, y: centerY - 30 * scale },
          { x: centerX - 30 * scale, y: centerY - 15 * scale },
          { x: centerX - 30 * scale, y: centerY },
          { x: centerX - 30 * scale, y: centerY + 15 * scale },
          { x: centerX - 30 * scale, y: centerY + 30 * scale },
          { x: centerX - 30 * scale, y: centerY + 45 * scale },
          { x: centerX - 30 * scale, y: centerY + 60 * scale },
          // Línea horizontal
          { x: centerX - 20 * scale, y: centerY + 60 * scale },
          { x: centerX - 10 * scale, y: centerY + 60 * scale },
          { x: centerX, y: centerY + 60 * scale },
          { x: centerX + 10 * scale, y: centerY + 60 * scale },
          { x: centerX + 20 * scale, y: centerY + 60 * scale },
          { x: centerX + 30 * scale, y: centerY + 60 * scale },
        ]
      }
      case "M": {
        return [
          // Línea vertical izquierda
          { x: centerX - 40 * scale, y: centerY + 60 * scale },
          { x: centerX - 40 * scale, y: centerY + 45 * scale },
          { x: centerX - 40 * scale, y: centerY + 30 * scale },
          { x: centerX - 40 * scale, y: centerY + 15 * scale },
          { x: centerX - 40 * scale, y: centerY },
          { x: centerX - 40 * scale, y: centerY - 15 * scale },
          { x: centerX - 40 * scale, y: centerY - 30 * scale },
          { x: centerX - 40 * scale, y: centerY - 45 * scale },
          { x: centerX - 40 * scale, y: centerY - 60 * scale },
          // Línea diagonal izquierda
          { x: centerX - 30 * scale, y: centerY - 45 * scale },
          { x: centerX - 20 * scale, y: centerY - 30 * scale },
          { x: centerX - 10 * scale, y: centerY - 15 * scale },
          { x: centerX, y: centerY },
          // Línea diagonal derecha
          { x: centerX + 10 * scale, y: centerY - 15 * scale },
          { x: centerX + 20 * scale, y: centerY - 30 * scale },
          { x: centerX + 30 * scale, y: centerY - 45 * scale },
          { x: centerX + 40 * scale, y: centerY - 60 * scale },
          // Línea vertical derecha
          { x: centerX + 40 * scale, y: centerY - 45 * scale },
          { x: centerX + 40 * scale, y: centerY - 30 * scale },
          { x: centerX + 40 * scale, y: centerY - 15 * scale },
          { x: centerX + 40 * scale, y: centerY },
          { x: centerX + 40 * scale, y: centerY + 15 * scale },
          { x: centerX + 40 * scale, y: centerY + 30 * scale },
          { x: centerX + 40 * scale, y: centerY + 45 * scale },
          { x: centerX + 40 * scale, y: centerY + 60 * scale },
        ]
      }
      case "N": {
        return [
          // Línea vertical izquierda
          { x: centerX - 30 * scale, y: centerY + 60 * scale },
          { x: centerX - 30 * scale, y: centerY + 45 * scale },
          { x: centerX - 30 * scale, y: centerY + 30 * scale },
          { x: centerX - 30 * scale, y: centerY + 15 * scale },
          { x: centerX - 30 * scale, y: centerY },
          { x: centerX - 30 * scale, y: centerY - 15 * scale },
          { x: centerX - 30 * scale, y: centerY - 30 * scale },
          { x: centerX - 30 * scale, y: centerY - 45 * scale },
          { x: centerX - 30 * scale, y: centerY - 60 * scale },
          // Línea diagonal
          { x: centerX - 20 * scale, y: centerY - 45 * scale },
          { x: centerX - 10 * scale, y: centerY - 30 * scale },
          { x: centerX, y: centerY - 15 * scale },
          { x: centerX + 10 * scale, y: centerY },
          { x: centerX + 20 * scale, y: centerY + 15 * scale },
          { x: centerX + 30 * scale, y: centerY + 30 * scale },
          { x: centerX + 30 * scale, y: centerY + 45 * scale },
          { x: centerX + 30 * scale, y: centerY + 60 * scale },
          // Línea vertical derecha
          { x: centerX + 30 * scale, y: centerY + 45 * scale },
          { x: centerX + 30 * scale, y: centerY + 30 * scale },
          { x: centerX + 30 * scale, y: centerY + 15 * scale },
          { x: centerX + 30 * scale, y: centerY },
          { x: centerX + 30 * scale, y: centerY - 15 * scale },
          { x: centerX + 30 * scale, y: centerY - 30 * scale },
          { x: centerX + 30 * scale, y: centerY - 45 * scale },
          { x: centerX + 30 * scale, y: centerY - 60 * scale },
        ]
      }
      case "O": {
        return [
          { x: centerX, y: centerY - 60 * scale },
          { x: centerX + 10 * scale, y: centerY - 58 * scale },
          { x: centerX + 20 * scale, y: centerY - 52 * scale },
          { x: centerX + 28 * scale, y: centerY - 42 * scale },
          { x: centerX + 34 * scale, y: centerY - 30 * scale },
          { x: centerX + 36 * scale, y: centerY - 15 * scale },
          { x: centerX + 36 * scale, y: centerY },
          { x: centerX + 36 * scale, y: centerY + 15 * scale },
          { x: centerX + 34 * scale, y: centerY + 30 * scale },
          { x: centerX + 28 * scale, y: centerY + 42 * scale },
          { x: centerX + 20 * scale, y: centerY + 52 * scale },
          { x: centerX + 10 * scale, y: centerY + 58 * scale },
          { x: centerX, y: centerY + 60 * scale },
          { x: centerX - 10 * scale, y: centerY + 58 * scale },
          { x: centerX - 20 * scale, y: centerY + 52 * scale },
          { x: centerX - 28 * scale, y: centerY + 42 * scale },
          { x: centerX - 34 * scale, y: centerY + 30 * scale },
          { x: centerX - 36 * scale, y: centerY + 15 * scale },
          { x: centerX - 36 * scale, y: centerY },
          { x: centerX - 36 * scale, y: centerY - 15 * scale },
          { x: centerX - 34 * scale, y: centerY - 30 * scale },
          { x: centerX - 28 * scale, y: centerY - 42 * scale },
          { x: centerX - 20 * scale, y: centerY - 52 * scale },
          { x: centerX - 10 * scale, y: centerY - 58 * scale },
          { x: centerX, y: centerY - 60 * scale },
        ]
      }
      case "P": {
        return [
          // Línea vertical
          { x: centerX - 30 * scale, y: centerY + 60 * scale },
          { x: centerX - 30 * scale, y: centerY + 45 * scale },
          { x: centerX - 30 * scale, y: centerY + 30 * scale },
          { x: centerX - 30 * scale, y: centerY + 15 * scale },
          { x: centerX - 30 * scale, y: centerY },
          { x: centerX - 30 * scale, y: centerY - 15 * scale },
          { x: centerX - 30 * scale, y: centerY - 30 * scale },
          { x: centerX - 30 * scale, y: centerY - 45 * scale },
          { x: centerX - 30 * scale, y: centerY - 60 * scale },
          // Curva superior
          { x: centerX - 20 * scale, y: centerY - 60 * scale },
          { x: centerX - 10 * scale, y: centerY - 60 * scale },
          { x: centerX, y: centerY - 60 * scale },
          { x: centerX + 10 * scale, y: centerY - 55 * scale },
          { x: centerX + 20 * scale, y: centerY - 45 * scale },
          { x: centerX + 25 * scale, y: centerY - 35 * scale },
          { x: centerX + 25 * scale, y: centerY - 25 * scale },
          { x: centerX + 20 * scale, y: centerY - 15 * scale },
          { x: centerX + 10 * scale, y: centerY - 5 * scale },
          { x: centerX, y: centerY },
          { x: centerX - 10 * scale, y: centerY },
          { x: centerX - 20 * scale, y: centerY },
          { x: centerX - 30 * scale, y: centerY },
        ]
      }
      case "Q": {
        return [
          // Círculo principal (igual que O)
          { x: centerX, y: centerY - 60 * scale },
          { x: centerX + 10 * scale, y: centerY - 58 * scale },
          { x: centerX + 20 * scale, y: centerY - 52 * scale },
          { x: centerX + 28 * scale, y: centerY - 42 * scale },
          { x: centerX + 34 * scale, y: centerY - 30 * scale },
          { x: centerX + 36 * scale, y: centerY - 15 * scale },
          { x: centerX + 36 * scale, y: centerY },
          { x: centerX + 36 * scale, y: centerY + 15 * scale },
          { x: centerX + 34 * scale, y: centerY + 30 * scale },
          { x: centerX + 28 * scale, y: centerY + 42 * scale },
          { x: centerX + 20 * scale, y: centerY + 52 * scale },
          { x: centerX + 10 * scale, y: centerY + 58 * scale },
          { x: centerX, y: centerY + 60 * scale },
          { x: centerX - 10 * scale, y: centerY + 58 * scale },
          { x: centerX - 20 * scale, y: centerY + 52 * scale },
          { x: centerX - 28 * scale, y: centerY + 42 * scale },
          { x: centerX - 34 * scale, y: centerY + 30 * scale },
          { x: centerX - 36 * scale, y: centerY + 15 * scale },
          { x: centerX - 36 * scale, y: centerY },
          { x: centerX - 36 * scale, y: centerY - 15 * scale },
          { x: centerX - 34 * scale, y: centerY - 30 * scale },
          { x: centerX - 28 * scale, y: centerY - 42 * scale },
          { x: centerX - 20 * scale, y: centerY - 52 * scale },
          { x: centerX - 10 * scale, y: centerY - 58 * scale },
          { x: centerX, y: centerY - 60 * scale },
          // Cola diagonal
          { x: centerX + 15 * scale, y: centerY + 15 * scale },
          { x: centerX + 25 * scale, y: centerY + 25 * scale },
          { x: centerX + 35 * scale, y: centerY + 35 * scale },
          { x: centerX + 45 * scale, y: centerY + 45 * scale },
        ]
      }
      case "R": {
        return [
          // Línea vertical
          { x: centerX - 30 * scale, y: centerY + 60 * scale },
          { x: centerX - 30 * scale, y: centerY + 45 * scale },
          { x: centerX - 30 * scale, y: centerY + 30 * scale },
          { x: centerX - 30 * scale, y: centerY + 15 * scale },
          { x: centerX - 30 * scale, y: centerY },
          { x: centerX - 30 * scale, y: centerY - 15 * scale },
          { x: centerX - 30 * scale, y: centerY - 30 * scale },
          { x: centerX - 30 * scale, y: centerY - 45 * scale },
          { x: centerX - 30 * scale, y: centerY - 60 * scale },
          // Curva superior
          { x: centerX - 20 * scale, y: centerY - 60 * scale },
          { x: centerX - 10 * scale, y: centerY - 60 * scale },
          { x: centerX, y: centerY - 60 * scale },
          { x: centerX + 10 * scale, y: centerY - 55 * scale },
          { x: centerX + 20 * scale, y: centerY - 45 * scale },
          { x: centerX + 25 * scale, y: centerY - 35 * scale },
          { x: centerX + 25 * scale, y: centerY - 25 * scale },
          { x: centerX + 20 * scale, y: centerY - 15 * scale },
          { x: centerX + 10 * scale, y: centerY - 5 * scale },
          { x: centerX, y: centerY },
          { x: centerX - 10 * scale, y: centerY },
          { x: centerX - 20 * scale, y: centerY },
          { x: centerX - 30 * scale, y: centerY },
          // Línea diagonal
          { x: centerX - 10 * scale, y: centerY },
          { x: centerX, y: centerY + 15 * scale },
          { x: centerX + 10 * scale, y: centerY + 30 * scale },
          { x: centerX + 20 * scale, y: centerY + 45 * scale },
          { x: centerX + 30 * scale, y: centerY + 60 * scale },
        ]
      }
      case "S": {
        return [
          { x: centerX + 25 * scale, y: centerY - 45 * scale },
          { x: centerX + 15 * scale, y: centerY - 55 * scale },
          { x: centerX + 5 * scale, y: centerY - 60 * scale },
          { x: centerX - 5 * scale, y: centerY - 60 * scale },
          { x: centerX - 15 * scale, y: centerY - 55 * scale },
          { x: centerX - 25 * scale, y: centerY - 45 * scale },
          { x: centerX - 30 * scale, y: centerY - 35 * scale },
          { x: centerX - 30 * scale, y: centerY - 25 * scale },
          { x: centerX - 25 * scale, y: centerY - 15 * scale },
          { x: centerX - 15 * scale, y: centerY - 5 * scale },
          { x: centerX - 5 * scale, y: centerY },
          { x: centerX + 5 * scale, y: centerY },
          { x: centerX + 15 * scale, y: centerY + 5 * scale },
          { x: centerX + 25 * scale, y: centerY + 15 * scale },
          { x: centerX + 30 * scale, y: centerY + 25 * scale },
          { x: centerX + 30 * scale, y: centerY + 35 * scale },
          { x: centerX + 25 * scale, y: centerY + 45 * scale },
          { x: centerX + 15 * scale, y: centerY + 55 * scale },
          { x: centerX + 5 * scale, y: centerY + 60 * scale },
          { x: centerX - 5 * scale, y: centerY + 60 * scale },
          { x: centerX - 15 * scale, y: centerY + 55 * scale },
          { x: centerX - 25 * scale, y: centerY + 45 * scale },
        ]
      }
      case "T": {
        return [
          // Línea horizontal superior
          { x: centerX - 40 * scale, y: centerY - 60 * scale },
          { x: centerX - 30 * scale, y: centerY - 60 * scale },
          { x: centerX - 20 * scale, y: centerY - 60 * scale },
          { x: centerX - 10 * scale, y: centerY - 60 * scale },
          { x: centerX, y: centerY - 60 * scale },
          { x: centerX + 10 * scale, y: centerY - 60 * scale },
          { x: centerX + 20 * scale, y: centerY - 60 * scale },
          { x: centerX + 30 * scale, y: centerY - 60 * scale },
          { x: centerX + 40 * scale, y: centerY - 60 * scale },
          // Línea vertical central
          { x: centerX, y: centerY - 45 * scale },
          { x: centerX, y: centerY - 30 * scale },
          { x: centerX, y: centerY - 15 * scale },
          { x: centerX, y: centerY },
          { x: centerX, y: centerY + 15 * scale },
          { x: centerX, y: centerY + 30 * scale },
          { x: centerX, y: centerY + 45 * scale },
          { x: centerX, y: centerY + 60 * scale },
        ]
      }
      case "U": {
        return [
          // Línea vertical izquierda
          { x: centerX - 30 * scale, y: centerY - 60 * scale },
          { x: centerX - 30 * scale, y: centerY - 45 * scale },
          { x: centerX - 30 * scale, y: centerY - 30 * scale },
          { x: centerX - 30 * scale, y: centerY - 15 * scale },
          { x: centerX - 30 * scale, y: centerY },
          { x: centerX - 30 * scale, y: centerY + 15 * scale },
          { x: centerX - 30 * scale, y: centerY + 30 * scale },
          { x: centerX - 30 * scale, y: centerY + 45 * scale },
          // Curva inferior
          { x: centerX - 25 * scale, y: centerY + 55 * scale },
          { x: centerX - 15 * scale, y: centerY + 60 * scale },
          { x: centerX - 5 * scale, y: centerY + 60 * scale },
          { x: centerX + 5 * scale, y: centerY + 60 * scale },
          { x: centerX + 15 * scale, y: centerY + 60 * scale },
          { x: centerX + 25 * scale, y: centerY + 55 * scale },
          // Línea vertical derecha
          { x: centerX + 30 * scale, y: centerY + 45 * scale },
          { x: centerX + 30 * scale, y: centerY + 30 * scale },
          { x: centerX + 30 * scale, y: centerY + 15 * scale },
          { x: centerX + 30 * scale, y: centerY },
          { x: centerX + 30 * scale, y: centerY - 15 * scale },
          { x: centerX + 30 * scale, y: centerY - 30 * scale },
          { x: centerX + 30 * scale, y: centerY - 45 * scale },
          { x: centerX + 30 * scale, y: centerY - 60 * scale },
        ]
      }
      case "V": {
        return [
          // Línea diagonal izquierda
          { x: centerX - 40 * scale, y: centerY - 60 * scale },
          { x: centerX - 35 * scale, y: centerY - 40 * scale },
          { x: centerX - 30 * scale, y: centerY - 20 * scale },
          { x: centerX - 25 * scale, y: centerY },
          { x: centerX - 20 * scale, y: centerY + 20 * scale },
          { x: centerX - 15 * scale, y: centerY + 40 * scale },
          { x: centerX - 10 * scale, y: centerY + 50 * scale },
          { x: centerX - 5 * scale, y: centerY + 55 * scale },
          { x: centerX, y: centerY + 60 * scale },
          // Línea diagonal derecha
          { x: centerX + 5 * scale, y: centerY + 55 * scale },
          { x: centerX + 10 * scale, y: centerY + 50 * scale },
          { x: centerX + 15 * scale, y: centerY + 40 * scale },
          { x: centerX + 20 * scale, y: centerY + 20 * scale },
          { x: centerX + 25 * scale, y: centerY },
          { x: centerX + 30 * scale, y: centerY - 20 * scale },
          { x: centerX + 35 * scale, y: centerY - 40 * scale },
          { x: centerX + 40 * scale, y: centerY - 60 * scale },
        ]
      }
      case "W": {
        return [
          // Primera línea diagonal izquierda
          { x: centerX - 50 * scale, y: centerY - 60 * scale },
          { x: centerX - 45 * scale, y: centerY - 40 * scale },
          { x: centerX - 40 * scale, y: centerY - 20 * scale },
          { x: centerX - 35 * scale, y: centerY },
          { x: centerX - 30 * scale, y: centerY + 20 * scale },
          { x: centerX - 25 * scale, y: centerY + 40 * scale },
          { x: centerX - 20 * scale, y: centerY + 50 * scale },
          { x: centerX - 15 * scale, y: centerY + 55 * scale },
          { x: centerX - 10 * scale, y: centerY + 60 * scale },
          // Pico central
          { x: centerX - 5 * scale, y: centerY + 50 * scale },
          { x: centerX, y: centerY + 40 * scale },
          { x: centerX + 5 * scale, y: centerY + 50 * scale },
          { x: centerX + 10 * scale, y: centerY + 60 * scale },
          // Segunda línea diagonal derecha
          { x: centerX + 15 * scale, y: centerY + 55 * scale },
          { x: centerX + 20 * scale, y: centerY + 50 * scale },
          { x: centerX + 25 * scale, y: centerY + 40 * scale },
          { x: centerX + 30 * scale, y: centerY + 20 * scale },
          { x: centerX + 35 * scale, y: centerY },
          { x: centerX + 40 * scale, y: centerY - 20 * scale },
          { x: centerX + 45 * scale, y: centerY - 40 * scale },
          { x: centerX + 50 * scale, y: centerY - 60 * scale },
        ]
      }
      case "X": {
        return [
          // Línea diagonal de arriba-izquierda a abajo-derecha
          { x: centerX - 40 * scale, y: centerY - 60 * scale },
          { x: centerX - 30 * scale, y: centerY - 45 * scale },
          { x: centerX - 20 * scale, y: centerY - 30 * scale },
          { x: centerX - 10 * scale, y: centerY - 15 * scale },
          { x: centerX, y: centerY },
          { x: centerX + 10 * scale, y: centerY + 15 * scale },
          { x: centerX + 20 * scale, y: centerY + 30 * scale },
          { x: centerX + 30 * scale, y: centerY + 45 * scale },
          { x: centerX + 40 * scale, y: centerY + 60 * scale },
          // Línea diagonal de arriba-derecha a abajo-izquierda
          { x: centerX + 40 * scale, y: centerY - 60 * scale },
          { x: centerX + 30 * scale, y: centerY - 45 * scale },
          { x: centerX + 20 * scale, y: centerY - 30 * scale },
          { x: centerX + 10 * scale, y: centerY - 15 * scale },
          { x: centerX, y: centerY },
          { x: centerX - 10 * scale, y: centerY + 15 * scale },
          { x: centerX - 20 * scale, y: centerY + 30 * scale },
          { x: centerX - 30 * scale, y: centerY + 45 * scale },
          { x: centerX - 40 * scale, y: centerY + 60 * scale },
        ]
      }
      case "Y": {
        return [
          // Línea diagonal izquierda
          { x: centerX - 40 * scale, y: centerY - 60 * scale },
          { x: centerX - 30 * scale, y: centerY - 45 * scale },
          { x: centerX - 20 * scale, y: centerY - 30 * scale },
          { x: centerX - 10 * scale, y: centerY - 15 * scale },
          { x: centerX, y: centerY },
          // Línea diagonal derecha
          { x: centerX + 40 * scale, y: centerY - 60 * scale },
          { x: centerX + 30 * scale, y: centerY - 45 * scale },
          { x: centerX + 20 * scale, y: centerY - 30 * scale },
          { x: centerX + 10 * scale, y: centerY - 15 * scale },
          { x: centerX, y: centerY },
          // Línea vertical central
          { x: centerX, y: centerY + 15 * scale },
          { x: centerX, y: centerY + 30 * scale },
          { x: centerX, y: centerY + 45 * scale },
          { x: centerX, y: centerY + 60 * scale },
        ]
      }
      case "Z": {
        return [
          // Línea horizontal superior
          { x: centerX - 30 * scale, y: centerY - 60 * scale },
          { x: centerX - 20 * scale, y: centerY - 60 * scale },
          { x: centerX - 10 * scale, y: centerY - 60 * scale },
          { x: centerX, y: centerY - 60 * scale },
          { x: centerX + 10 * scale, y: centerY - 60 * scale },
          { x: centerX + 20 * scale, y: centerY - 60 * scale },
          { x: centerX + 30 * scale, y: centerY - 60 * scale },
          // Línea diagonal
          { x: centerX + 20 * scale, y: centerY - 45 * scale },
          { x: centerX + 10 * scale, y: centerY - 30 * scale },
          { x: centerX, y: centerY - 15 * scale },
          { x: centerX - 10 * scale, y: centerY },
          { x: centerX - 20 * scale, y: centerY + 15 * scale },
          { x: centerX - 30 * scale, y: centerY + 30 * scale },
          { x: centerX - 20 * scale, y: centerY + 45 * scale },
          // Línea horizontal inferior
          { x: centerX - 30 * scale, y: centerY + 60 * scale },
          { x: centerX - 20 * scale, y: centerY + 60 * scale },
          { x: centerX - 10 * scale, y: centerY + 60 * scale },
          { x: centerX, y: centerY + 60 * scale },
          { x: centerX + 10 * scale, y: centerY + 60 * scale },
          { x: centerX + 20 * scale, y: centerY + 60 * scale },
          { x: centerX + 30 * scale, y: centerY + 60 * scale },
        ]
      }
      default: {
        // Plantilla simple para casos no implementados
        return [
          { x: centerX - 30 * scale, y: centerY - 30 * scale },
          { x: centerX - 20 * scale, y: centerY - 40 * scale },
          { x: centerX - 10 * scale, y: centerY - 45 * scale },
          { x: centerX, y: centerY - 50 * scale },
          { x: centerX + 10 * scale, y: centerY - 45 * scale },
          { x: centerX + 20 * scale, y: centerY - 40 * scale },
          { x: centerX + 30 * scale, y: centerY - 30 * scale },
          { x: centerX + 25 * scale, y: centerY - 15 * scale },
          { x: centerX + 20 * scale, y: centerY },
          { x: centerX + 15 * scale, y: centerY + 15 * scale },
          { x: centerX + 10 * scale, y: centerY + 30 * scale },
          { x: centerX, y: centerY + 40 * scale },
          { x: centerX - 10 * scale, y: centerY + 30 * scale },
          { x: centerX - 15 * scale, y: centerY + 15 * scale },
          { x: centerX - 20 * scale, y: centerY },
          { x: centerX - 25 * scale, y: centerY - 15 * scale },
        ]
      }
    }
  }, [])

  // Dibujar plantilla con líneas entrecortadas
  const drawTemplate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !currentLetter) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const template = getLetterTemplate(currentLetter)

    // Configurar estilo de línea entrecortada
    ctx.strokeStyle = "#94A3B8"
    ctx.lineWidth = 3
    ctx.setLineDash([10, 5]) // Línea entrecortada
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    // Dibujar la plantilla
    if (template.length > 0) {
      ctx.beginPath()
      ctx.moveTo(template[0].x, template[0].y)

      for (let i = 1; i < template.length; i++) {
        ctx.lineTo(template[i].x, template[i].y)
      }

      ctx.stroke()
    }

    // Dibujar puntos de inicio y fin
    ctx.setLineDash([]) // Línea sólida para los puntos
    ctx.fillStyle = "#10B981"
    ctx.beginPath()
    ctx.arc(template[0].x, template[0].y, 8, 0, 2 * Math.PI)
    ctx.fill()

    // Punto de inicio
    ctx.fillStyle = "#FFFFFF"
    ctx.font = "bold 12px Arial"
    ctx.textAlign = "center"
    ctx.fillText("INICIO", template[0].x, template[0].y + 4)

    // Punto final
    if (template.length > 1) {
      ctx.fillStyle = "#EF4444"
      ctx.beginPath()
      ctx.arc(template[template.length - 1].x, template[template.length - 1].y, 8, 0, 2 * Math.PI)
      ctx.fill()

      ctx.fillStyle = "#FFFFFF"
      ctx.fillText("FIN", template[template.length - 1].x, template[template.length - 1].y + 4)
    }
  }, [currentLetter, getLetterTemplate])

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

    // Dibujar plantilla
    drawTemplate()

    // Dibujar trazo del usuario
    if (userPath.length > 1) {
      ctx.strokeStyle = "#3B82F6"
      ctx.lineWidth = 4
      ctx.setLineDash([]) // Línea sólida para el trazo del usuario
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      ctx.beginPath()
      ctx.moveTo(userPath[0].x, userPath[0].y)

      for (let i = 1; i < userPath.length; i++) {
        ctx.lineTo(userPath[i].x, userPath[i].y)
      }

      ctx.stroke()
    }
  }, [currentLetter, userPath, drawTemplate])

  // Manejar eventos del mouse
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setIsDrawing(true)
    setUserPath([{ x, y }])
    setMessage("¡Sigue la línea entrecortada para dibujar la letra!")
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return

      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      setUserPath((prev) => [...prev, { x, y }])
    },
    [isDrawing],
  )

  const handleMouseUp = useCallback(() => {
    if (!isDrawing) return

    setIsDrawing(false)
    setHasFinishedDrawing(true)
    setMessage("¡Buen trabajo! Haz clic en 'Verificar' para comprobar tu dibujo.")
  }, [isDrawing])

  // Verificar si el dibujo es correcto (simplificado)
  const verifyDrawing = useCallback(async () => {
    if (!userId || userPath.length < 10) {
      setMessage("¡Intenta dibujar más de la letra!")
      return
    }

    // Simulación de verificación (en una implementación real, aquí iría un algoritmo más sofisticado)
    const isCorrect = userPath.length > 20 // Criterio simple: debe haber suficientes puntos

    try {
      await saveProgress(userId, 4, currentLevel, isCorrect)
    } catch (error) {
      console.error("Error al guardar el progreso:", error)
    }

    if (isCorrect) {
      setMessage(`¡Excelente! Has dibujado la letra ${currentLetter} correctamente! 🎉`)
      setShowSuccess(true)
      setCompletedLevels((prev) => prev + 1)

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
    } else {
      setMessage("¡Buen intento! Trata de seguir más de cerca la línea entrecortada.")
    }
  }, [userId, userPath, currentLevel, currentLetter])

  const resetDrawing = useCallback(() => {
    setUserPath([])
    setMessage("Haz clic y arrastra el mouse para dibujar la letra siguiendo la guía")
    setShowSuccess(false)
    setHasFinishedDrawing(false)
    setIsDrawing(false)
  }, [])

  const goToNextLevel = useCallback(() => {
    if (currentLevel < 10 && currentLevel < selectedLetters.length) {
      const nextLevel = currentLevel + 1
      setCurrentLevel(nextLevel)
      setCurrentLetter(selectedLetters[nextLevel - 1])
      resetDrawing()

      confetti({
        particleCount: 200,
        spread: 160,
        origin: { y: 0.6 },
      })
    } else {
      setMessage("¡Felicitaciones! Has completado todos los niveles del módulo 4! 🏆")
      confetti({
        particleCount: 300,
        spread: 180,
        origin: { y: 0.6 },
      })
    }
  }, [currentLevel, selectedLetters, resetDrawing])

  const progressPercentage = (currentLevel / 10) * 100

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-200 to-pink-200 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <Link href="/modules">
            <Button variant="outline" className="flex items-center gap-2 bg-white rounded-full p-6 shadow-md">
              <ArrowLeft className="h-6 w-6" />
              <span className="text-lg">Volver a los módulos</span>
            </Button>
          </Link>
          <div className="text-center bg-white p-4 rounded-2xl shadow-lg border-4 border-purple-400">
            <h1 className="text-3xl font-bold text-purple-600">Módulo 4: ¡Dibuja las Letras!</h1>
            <p className="text-xl text-pink-500">
              Letra {currentLetter} - Nivel {currentLevel} de 10
            </p>
          </div>
          <div className="w-[140px]"></div>
        </div>

        <div className="relative mb-8">
          <Progress value={progressPercentage} className="h-6 rounded-full bg-gray-200" />
          <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center">
            <span className="text-sm font-bold text-white bg-purple-500 px-3 py-1 rounded-full">
              {Math.round(progressPercentage)}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Área de dibujo */}
          <Card className="rounded-3xl overflow-hidden border-4 border-purple-400 shadow-xl">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-center mb-6 text-purple-600">
                ¡Dibuja la letra: <span className="text-6xl text-pink-600 animate-pulse">{currentLetter}</span>!
              </h2>

              <div className="mb-6">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={300}
                  className="border-4 border-purple-300 rounded-xl bg-white cursor-crosshair w-full max-w-md mx-auto block"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                />
              </div>

              <div className="flex justify-center gap-4">
                <Button
                  onClick={resetDrawing}
                  variant="outline"
                  className="bg-white text-purple-600 border-2 border-purple-300 rounded-xl px-6 py-3 flex items-center gap-2"
                >
                  <RotateCcw className="h-5 w-5" />
                  Borrar
                </Button>

                <Button
                  onClick={verifyDrawing}
                  disabled={!hasFinishedDrawing}
                  className={`rounded-xl px-8 py-3 text-lg shadow-lg flex items-center gap-2 ${
                    hasFinishedDrawing
                      ? "bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  <CheckCircle className="h-5 w-5" />
                  Verificar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Instrucciones */}
          <Card className="rounded-3xl overflow-hidden border-4 border-purple-400 shadow-xl">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-center mb-6 text-purple-600">¡Instrucciones!</h2>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-md">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    ●
                  </div>
                  <span className="text-lg">Punto verde = ¡Empieza aquí!</span>
                </div>
                <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-md">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    ●
                  </div>
                  <span className="text-lg">Punto rojo = ¡Termina aquí!</span>
                </div>
                <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-md">
                  <div className="w-6 h-6 bg-gray-400 rounded-full"></div>
                  <span className="text-lg">Línea gris = ¡Guía a seguir!</span>
                </div>
                <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-md">
                  <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                  <span className="text-lg">Línea azul = ¡Tu dibujo!</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2 bg-white p-3 rounded-lg shadow">
                  <span className="text-purple-500 text-xl mt-1">1️⃣</span>
                  <span className="text-lg">Haz clic en el punto verde para empezar</span>
                </li>
                <li className="flex items-start gap-2 bg-white p-3 rounded-lg shadow">
                  <span className="text-purple-500 text-xl mt-1">2️⃣</span>
                  <span className="text-lg">Arrastra el mouse siguiendo la línea gris</span>
                </li>
                <li className="flex items-start gap-2 bg-white p-3 rounded-lg shadow">
                  <span className="text-purple-500 text-xl mt-1">3️⃣</span>
                  <span className="text-lg">Termina en el punto rojo</span>
                </li>
                <li className="flex items-start gap-2 bg-white p-3 rounded-lg shadow">
                  <span className="text-purple-500 text-xl mt-1">4️⃣</span>
                  <span className="text-lg">¡Haz clic en "Verificar" al terminar!</span>
                </li>
              </ul>

              <div className="bg-purple-100 p-4 rounded-xl border-2 border-purple-300 mb-4">
                <p className="text-center text-purple-800 font-semibold">Letras completadas: {completedLevels} de 10</p>
                <div className="w-full bg-purple-200 rounded-full h-3 mt-2">
                  <div
                    className="bg-purple-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${(completedLevels / 10) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Mostrar letras seleccionadas */}
              {selectedLetters.length > 0 && (
                <div className="bg-pink-100 p-4 rounded-xl border-2 border-pink-300 mb-4">
                  <p className="text-center text-pink-800 font-semibold mb-2">Letras de este nivel:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {selectedLetters.map((letter, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-full text-sm font-bold ${
                          index < currentLevel - 1
                            ? "bg-green-500 text-white"
                            : index === currentLevel - 1
                              ? "bg-purple-500 text-white animate-pulse"
                              : "bg-gray-300 text-gray-600"
                        }`}
                      >
                        {letter}
                      </span>
                    ))}
                  </div>
                </div>
              )}

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

                  {showSuccess && currentLevel < 10 && (
                    <Button
                      onClick={goToNextLevel}
                      className="mt-6 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 w-full rounded-full py-4 text-xl shadow-lg"
                    >
                      ¡Siguiente letra! 🚀
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Elementos decorativos */}
        <div className="fixed bottom-4 left-4 animate-bounce text-5xl">🎨</div>
        <div className="fixed bottom-4 right-4 animate-bounce text-5xl">✏️</div>
      </div>
    </div>
  )
}
