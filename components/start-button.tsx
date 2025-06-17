"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import UserForm from "./user-form"
import AutoTraining from "./auto-training"
import { areNetworksTrained } from "@/lib/train-networks"

export default function StartButton() {
  const [showForm, setShowForm] = useState(false)
  const [showTraining, setShowTraining] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState("")
  const router = useRouter()

  useEffect(() => {
    // Verificar si el usuario ya está registrado
    const userId = localStorage.getItem("userId")
    const name = localStorage.getItem("userName")

    if (userId && name) {
      setIsLoggedIn(true)
      setUserName(name)
    }
  }, [])

  const handleStart = () => {
    if (isLoggedIn) {
      // Si el usuario ya está registrado, verificar si las redes están entrenadas
      const networksReady = areNetworksTrained()

      console.log("🔍 Verificando estado de las redes:", networksReady)

      if (networksReady) {
        // Si las redes están entrenadas, ir directamente a los módulos
        console.log("✅ Redes ya entrenadas, yendo a módulos")
        router.push("/modules")
      } else {
        // Si las redes no están entrenadas, mostrar el entrenamiento
        console.log("⚠️ Redes no entrenadas, mostrando entrenamiento")
        setShowTraining(true)
      }
    } else {
      // Si no está registrado, mostrar el formulario
      console.log("👤 Usuario no registrado, mostrando formulario")
      setShowForm(true)
    }
  }

  const handleUserRegistered = (name: string) => {
    console.log("✅ Usuario registrado:", name)
    setUserName(name)
    setIsLoggedIn(true)
    setShowForm(false)

    // Después del registro, SIEMPRE mostrar el entrenamiento
    // porque las redes necesitan ser entrenadas para un nuevo usuario
    console.log("🧠 Mostrando entrenamiento para nuevo usuario")
    setShowTraining(true)
  }

  const handleTrainingComplete = () => {
    console.log("🎉 Entrenamiento completado, yendo a módulos")
    setShowTraining(false)
    router.push("/modules")
  }

  const handleLogout = () => {
    // Eliminar los datos del usuario del localStorage
    localStorage.removeItem("userId")
    localStorage.removeItem("userName")
    localStorage.removeItem("userAge")

    // También limpiar el estado de entrenamiento para forzar re-entrenamiento
    localStorage.removeItem("module1WeightsAvailable")
    localStorage.removeItem("soundNetworkTrained")
    localStorage.removeItem("wordNetworkTrained")
    localStorage.removeItem("networksTrainingComplete")
    localStorage.removeItem("soundNetworkData")
    localStorage.removeItem("wordNetworkData")

    // Actualizar el estado
    setIsLoggedIn(false)
    setUserName("")
    setShowForm(false)
    setShowTraining(false)

    console.log("👋 Usuario deslogueado y estado limpiado")
  }

  // Si está mostrando el entrenamiento
  if (showTraining) {
    return <AutoTraining onTrainingComplete={handleTrainingComplete} userName={userName} />
  }

  // Si está mostrando el formulario
  if (showForm) {
    return <UserForm onUserRegistered={handleUserRegistered} />
  }

  // Pantalla principal
  return (
    <div className="w-full max-w-md">
      <div className="space-y-4">
        {isLoggedIn ? (
          <div className="text-center space-y-4">
            <p className="text-xl text-purple-600">
              ¡Hola <span className="font-bold">{userName}</span>! ¿Listo para continuar tu aventura?
            </p>
            <div className="flex gap-4">
              <Button
                onClick={handleStart}
                className="flex-1 py-6 text-xl rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg"
              >
                ¡Continuar! 🚀
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="py-6 px-4 text-xl rounded-2xl border-2 border-gray-300"
              >
                Cambiar Usuario
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={handleStart}
            className="w-full py-8 text-2xl rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg transform transition-transform hover:scale-105"
          >
            ¡Comenzar Aventura! 🚀
          </Button>
        )}
      </div>
    </div>
  )
}
