"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, CheckCircle, AlertCircle } from "lucide-react"

interface WeightLoaderProps {
  onWeightsLoaded: () => void
}

export default function WeightLoader({ onWeightsLoaded }: WeightLoaderProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith(".json")) {
      setError("Por favor, selecciona un archivo JSON válido")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess(false)

    try {
      const text = await file.text()
      const weightsData = JSON.parse(text)

      // Validar estructura básica
      if (!weightsData.W_h || !weightsData.W_o) {
        throw new Error("El archivo no contiene la estructura de pesos correcta (falta W_h o W_o)")
      }

      // Guardar en localStorage
      localStorage.setItem("neuralNetworkWeights", JSON.stringify(weightsData))

      setSuccess(true)
      setTimeout(() => {
        onWeightsLoaded()
      }, 1500)
    } catch (err) {
      console.error("Error al cargar pesos:", err)
      setError(err instanceof Error ? err.message : "Error al procesar el archivo")
    } finally {
      setIsLoading(false)
    }
  }

  const handleManualInput = () => {
    // Para desarrollo: cargar pesos de ejemplo
    const exampleWeights = {
      W_h: Array(30)
        .fill(0)
        .map(() =>
          Array(35)
            .fill(0)
            .map(() => Math.random() * 0.1 - 0.05),
        ),
      W_o: Array(27)
        .fill(0)
        .map(() =>
          Array(30)
            .fill(0)
            .map(() => Math.random() * 0.1 - 0.05),
        ),
      Th: Array(30)
        .fill(0)
        .map(() => [Math.random() * 0.1 - 0.05]),
      To: Array(27)
        .fill(0)
        .map(() => [Math.random() * 0.1 - 0.05]),
      config: {
        capa_entrada: 35,
        capa_oculta: 30,
        capa_salida: 27,
        funciones_activacion: ["sigmoide", "sigmoide"],
        bias: true,
      },
    }

    localStorage.setItem("neuralNetworkWeights", JSON.stringify(exampleWeights))
    setSuccess(true)
    setTimeout(() => {
      onWeightsLoaded()
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-200 to-purple-200 flex items-center justify-center bg-[url('/placeholder.svg?height=200&width=200')] bg-repeat">
      <Card className="w-full max-w-md mx-auto rounded-3xl overflow-hidden border-4 border-purple-400 shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-purple-600">Cargar Pesos de la Red Neuronal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-700 mb-4">
              Para usar el Módulo 1, necesitas cargar los pesos pre-entrenados de la red neuronal.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-500 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>¡Pesos cargados exitosamente! Redirigiendo...</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="weights-file" className="text-lg font-medium">
                Seleccionar archivo de pesos (JSON)
              </Label>
              <Input
                id="weights-file"
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                disabled={isLoading || success}
                className="mt-2"
              />
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">O para pruebas:</p>
              <Button onClick={handleManualInput} disabled={isLoading || success} variant="outline" className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Usar Pesos de Ejemplo
              </Button>
            </div>
          </div>

          {isLoading && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando pesos...</p>
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Formato esperado:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Archivo JSON con pesos entrenados</li>
              <li>• Debe contener: W_h, W_o, Th, To</li>
              <li>• Configuración: 35 entradas, 30 ocultas, 27 salidas</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
