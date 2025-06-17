"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createUser } from "@/lib/actions"

interface UserFormProps {
  onUserRegistered: (name: string) => void
}

export default function UserForm({ onUserRegistered }: UserFormProps) {
  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name.trim()) {
      setError("Por favor, ingresa tu nombre")
      return
    }

    const ageNum = Number.parseInt(age)
    if (isNaN(ageNum) || ageNum < 3 || ageNum > 15) {
      setError("Por favor, ingresa una edad válida entre 3 y 15 años")
      return
    }

    try {
      setIsLoading(true)
      const userId = await createUser(name, ageNum)

      // Guardar el ID del usuario en localStorage
      localStorage.setItem("userId", userId)
      localStorage.setItem("userName", name)
      localStorage.setItem("userAge", age)

      // Notificar al componente padre
      onUserRegistered(name)
    } catch (err) {
      console.error("Error al crear usuario:", err)
      setError("Ocurrió un error al registrar el usuario. Por favor, intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto rounded-3xl overflow-hidden border-4 border-purple-400 shadow-xl">
      <CardContent className="p-8">
        <h2 className="text-3xl font-bold text-center mb-6 text-purple-600">¡Regístrate para comenzar!</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-lg font-medium">
              Tu nombre
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 text-lg rounded-xl border-2 border-purple-300"
              placeholder="Escribe tu nombre aquí"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="age" className="text-lg font-medium">
              Tu edad
            </Label>
            <Input
              id="age"
              type="number"
              min="3"
              max="15"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="h-12 text-lg rounded-xl border-2 border-purple-300"
              placeholder="¿Cuántos años tienes?"
            />
          </div>

          {error && (
            <div className="bg-red-100 border-2 border-red-400 text-red-700 p-3 rounded-lg text-center">{error}</div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 text-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl shadow-lg"
          >
            {isLoading ? "Registrando..." : "¡Comenzar mi aventura!"}
          </Button>
        </form>

        <div className="mt-8 flex justify-center gap-4">
          <div className="animate-bounce text-4xl">🦄</div>
          <div className="animate-bounce delay-100 text-4xl">🌈</div>
          <div className="animate-bounce delay-200 text-4xl">✨</div>
        </div>
      </CardContent>
    </Card>
  )
}
