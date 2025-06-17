"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { areNetworksTrained } from "@/lib/train-networks"
import { useRouter } from "next/navigation"
import { MODULE_INFO } from "@/lib/module-constants"

export default function ModulesPage() {
  const [userName, setUserName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [networksReady, setNetworksReady] = useState(false)
  const [assignedModules, setAssignedModules] = useState<number[]>([])
  const router = useRouter()

  useEffect(() => {
    console.log("🔍 ModulesPage: Verificando estado inicial")

    // Verificar si el usuario está registrado
    const userId = localStorage.getItem("userId")
    const name = localStorage.getItem("userName")
    const userRole = localStorage.getItem("userRole")

    if (!userId || !name) {
      console.log("❌ ModulesPage: Usuario no registrado, redirigiendo")
      router.push("/")
      return
    }

    console.log("✅ ModulesPage: Usuario registrado:", name)
    setUserName(name)

    // Obtener módulos asignados para estudiantes
    if (userRole === "student") {
      const modules = JSON.parse(localStorage.getItem("assignedModules") || "[1,2,3]")
      setAssignedModules(modules)
    } else {
      // Para docentes y usuarios legacy, mostrar todos los módulos
      setAssignedModules([1, 2, 3, 4, 5, 6])
    }

    // Verificar si las redes neuronales están entrenadas
    const trained = areNetworksTrained()
    console.log("🔍 ModulesPage: Estado de entrenamiento:", trained)

    setNetworksReady(trained)
    setIsLoading(false)

    if (!trained) {
      console.log("⚠️ ModulesPage: Redes no entrenadas, mostrando alerta")
      alert("¡Primero debes entrenar las redes neuronales! Serás redirigido a la página principal.")
      router.push("/")
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-200 to-blue-200">
        <div className="text-3xl text-purple-600 animate-bounce">Cargando...</div>
      </div>
    )
  }

  const getModuleRoute = (moduleId: number): string => {
    return `/modulo${moduleId}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-200 to-blue-200 py-8 bg-[url('/placeholder.svg?height=200&width=200')] bg-repeat">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2 bg-white rounded-full p-6 shadow-md">
              <ArrowLeft className="h-6 w-6" />
              <span className="text-lg">Volver al inicio</span>
            </Button>
          </Link>
          <div className="text-center bg-white p-4 rounded-2xl shadow-lg border-4 border-pink-400">
            <h1 className="text-3xl font-bold text-purple-600">¡Hola {userName}!</h1>
            <p className="text-xl text-pink-500">Elige un módulo para comenzar</p>
            {networksReady && <p className="text-sm text-green-600 mt-2">🧠 Redes neuronales listas</p>}
          </div>
          <div className="w-[140px]"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {MODULE_INFO.filter((module) => assignedModules.includes(module.id)).map((module) => (
            <ModuleCard key={module.id} module={module} href={getModuleRoute(module.id)} active={networksReady} />
          ))}
        </div>

        {assignedModules.length === 0 && (
          <div className="text-center mt-16">
            <div className="inline-block bg-white p-6 rounded-2xl shadow-lg border-4 border-yellow-400">
              <h2 className="text-2xl font-bold text-yellow-600 mb-4">😔 No hay módulos asignados</h2>
              <p className="text-lg text-gray-700">
                Contacta con tu docente para que te asigne módulos específicos según tu tipo de dislexia.
              </p>
            </div>
          </div>
        )}

        <div className="mt-16 text-center">
          <div className="inline-block bg-white p-6 rounded-2xl shadow-lg border-4 border-pink-400">
            <h2 className="text-3xl font-bold text-purple-600 mb-4">¡Elige tu aventura de aprendizaje!</h2>
            <p className="text-xl text-gray-700 mb-4">Cada módulo está diseñado específicamente para ti.</p>
            <div className="flex justify-center gap-4">
              <div className="animate-bounce">🦄</div>
              <div className="animate-bounce delay-100">🌈</div>
              <div className="animate-bounce delay-200">🎨</div>
              <div className="animate-bounce delay-300">🎮</div>
              <div className="animate-bounce delay-400">🎯</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ModuleCard({
  module,
  href,
  active,
}: {
  module: (typeof MODULE_INFO)[0]
  href: string
  active: boolean
}) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "basico":
        return "text-green-600"
      case "intermedio":
        return "text-yellow-600"
      case "avanzado":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <Card
      className={`overflow-hidden transition-all duration-300 hover:scale-105 rounded-3xl shadow-xl ${
        active ? "border-yellow-400 border-4" : "opacity-80"
      }`}
    >
      <CardContent className="p-0">
        <div className={`bg-gradient-to-r ${module.color} p-6 text-white text-center`}>
          <div className="text-6xl mb-4 transform hover:scale-125 transition-transform">{module.icon}</div>
          <h2 className="text-2xl font-bold">{module.title}</h2>
          <div className="mt-2 text-sm opacity-90">
            <span className="bg-white/20 px-2 py-1 rounded-full">
              {module.difficulty.charAt(0).toUpperCase() + module.difficulty.slice(1)}
            </span>
          </div>
        </div>
        <div className="p-6 text-center bg-white">
          <p className="mb-4 text-lg">{module.description}</p>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Recomendado para:</p>
            <div className="flex flex-wrap justify-center gap-1">
              {module.targetDyslexia.map((type, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </span>
              ))}
            </div>
          </div>

          <Link href={href}>
            <Button
              className={`w-full text-lg py-6 rounded-full ${
                active
                  ? "bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 shadow-lg"
                  : "bg-gray-400"
              }`}
              disabled={!active}
            >
              {active ? "¡Comenzar Aventura!" : "Primero entrena las redes"}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
