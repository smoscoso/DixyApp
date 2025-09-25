"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { areAssignedModuleNetworksReady, initializeBasicNetworks } from "@/lib/train-networks"
import { useRouter } from "next/navigation"
import { MODULE_INFO } from "@/lib/module-constants"

export default function ModulesPage() {
  const [userName, setUserName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [networksReady, setNetworksReady] = useState(false)
  const [assignedModules, setAssignedModules] = useState<number[]>([])
  const [studentInfo, setStudentInfo] = useState<any>(null)
  const [initializingNetworks, setInitializingNetworks] = useState(false)
  const router = useRouter()

  useEffect(() => {
    console.log("🔍 ModulesPage: Verificando estado inicial")
    initializeStudentSession()
  }, [router])

  const initializeStudentSession = async () => {
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

    // Obtener módulos asignados
    let modules: number[] = []

    if (userRole === "student") {
      // Para estudiantes, obtener módulos desde localStorage
      const storedModules = localStorage.getItem("assignedModules")
      const dyslexiaLevel = localStorage.getItem("dyslexiaLevel")
      const dyslexiaType = localStorage.getItem("dyslexiaType")
      const hasKinestheticDyslexia = localStorage.getItem("hasKinestheticDyslexia") === "true"

      if (storedModules) {
        modules = JSON.parse(storedModules)
        console.log("📚 Módulos asignados desde localStorage:", modules)
      } else {
        // Fallback: obtener desde API
        const apiModules = await fetchStudentModules(userId)
        modules = apiModules
      }

      setStudentInfo({
        dyslexiaLevel,
        dyslexiaType,
        hasKinestheticDyslexia,
      })
    } else {
      // Para docentes, mostrar todos los módulos
      modules = [1, 2, 3, 4, 5, 6]
    }

    setAssignedModules(modules)

    // Inicializar y verificar redes para los módulos asignados
    await initializeAndCheckNetworks(modules)
    setIsLoading(false)
  }

  const initializeAndCheckNetworks = async (modules: number[]) => {
    console.log("🧠 Inicializando redes para módulos:", modules)
    setInitializingNetworks(true)

    try {
      // Inicializar redes básicas automáticamente
      await initializeBasicNetworks()

      // Verificar si las redes de los módulos asignados están listas
      const networksReady = areAssignedModuleNetworksReady(modules)
      console.log("📊 Estado de redes para módulos asignados:", networksReady)

      setNetworksReady(networksReady)

      if (!networksReady) {
        console.log("⚠️ Algunas redes no están listas, pero continuando...")
        // No redirigir, permitir que el usuario vea los módulos disponibles
        setNetworksReady(true) // Forzar como listo para permitir acceso
      }
    } catch (error) {
      console.error("❌ Error inicializando redes:", error)
      // En caso de error, permitir acceso básico
      setNetworksReady(true)
    } finally {
      setInitializingNetworks(false)
    }
  }

  const fetchStudentModules = async (studentId: string): Promise<number[]> => {
    try {
      const response = await fetch(`/api/student/modules?studentId=${studentId}`)
      const data = await response.json()

      if (response.ok && data.assignedModules) {
        console.log("📚 Módulos asignados desde API:", data.assignedModules)

        // Guardar en localStorage para futuras cargas
        localStorage.setItem("assignedModules", JSON.stringify(data.assignedModules))

        if (data.studentInfo) {
          setStudentInfo(data.studentInfo)
        }

        return data.assignedModules
      } else {
        console.error("Error al obtener módulos:", data.error)
        // Fallback a módulos básicos
        return [1, 2, 3]
      }
    } catch (error) {
      console.error("Error al cargar módulos del estudiante:", error)
      // Fallback a módulos básicos
      return [1, 2, 3]
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-200 to-cyan-200">
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">🧠</div>
          <div className="text-3xl text-blue-600 animate-pulse">
            {initializingNetworks ? "Preparando redes neuronales..." : "Cargando tus módulos..."}
          </div>
          <div className="text-lg text-gray-600 mt-2">
            {initializingNetworks
              ? "Configurando tu experiencia personalizada"
              : "Preparando tu experiencia personalizada"}
          </div>
        </div>
      </div>
    )
  }

  const getModuleRoute = (moduleId: number): string => {
    return `/modulo${moduleId}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-cyan-200 py-8 bg-[url('/placeholder.svg?height=200&width=200')] bg-repeat">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2 bg-white rounded-full p-6 shadow-md">
              <ArrowLeft className="h-6 w-6" />
              <span className="text-lg">Salir</span>
            </Button>
          </Link>
          <div className="text-center bg-white p-4 rounded-2xl shadow-lg border-4 border-blue-400">
            <h1 className="text-3xl font-bold text-blue-600">¡Hola {userName}!</h1>
            <p className="text-xl text-cyan-500">Elige un módulo para comenzar</p>
            <p className="text-sm text-green-600 mt-2">🧠 Sistema listo para aprender</p>
            {studentInfo && (
              <div className="mt-2 text-xs text-gray-600">
                <p>
                  📋 Configuración: {studentInfo.dyslexiaLevel} - {studentInfo.dyslexiaType}
                  {studentInfo.hasKinestheticDyslexia && " + kinestésica"}
                </p>
              </div>
            )}
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
          <div className="inline-block bg-white p-6 rounded-2xl shadow-lg border-4 border-blue-400">
            <h2 className="text-3xl font-bold text-blue-600 mb-4">¡Elige tu aventura de aprendizaje!</h2>
            <p className="text-xl text-gray-700 mb-4">
              Cada módulo está diseñado específicamente para tu tipo de dislexia
              {studentInfo?.dyslexiaType && `: ${studentInfo.dyslexiaType}`}
            </p>
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
  return (
    <Card
      className={`overflow-hidden transition-all duration-300 hover:scale-105 rounded-3xl shadow-xl ${
        active ? "border-blue-400 border-4" : "opacity-80"
      }`}
    >
      <CardContent className="p-0">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6 text-white text-center">
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
            <Button className="w-full text-lg py-6 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500 hover:from-blue-500 hover:to-cyan-600 shadow-lg">
              ¡Comenzar Aventura!
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
