"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { hasModuleAccess, getAssignedModules, isStudent, getStudentInfo } from "@/lib/module-access-control"

interface ModuleProtectionProps {
  moduleId: number
  children: React.ReactNode
}

export default function ModuleProtection({ moduleId, children }: ModuleProtectionProps) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAccess = () => {
      console.log(`🔒 Verificando acceso al Módulo ${moduleId}`)

      const studentInfo = getStudentInfo()

      if (!studentInfo || !studentInfo.userId) {
        console.log("❌ Usuario no autenticado")
        router.push("/")
        return
      }

      // Si es docente, permitir acceso a todos los módulos
      if (studentInfo.userRole === "teacher") {
        console.log("✅ Acceso de docente autorizado")
        setHasAccess(true)
        setIsLoading(false)
        return
      }

      // Si es estudiante, verificar módulos asignados
      if (isStudent()) {
        const assignedModules = getAssignedModules()
        const access = hasModuleAccess(assignedModules, moduleId)

        console.log(`📚 Módulos asignados:`, assignedModules)
        console.log(`🎯 Acceso al Módulo ${moduleId}:`, access)

        if (!access) {
          console.log(`❌ Acceso denegado al Módulo ${moduleId}`)
          alert(`No tienes acceso al Módulo ${moduleId}. Este módulo no está asignado para tu tipo de dislexia.`)
          router.push("/modules")
          return
        }

        console.log(`✅ Acceso autorizado al Módulo ${moduleId}`)
        setHasAccess(true)
      } else {
        // Usuario legacy o sin rol específico
        setHasAccess(true)
      }

      setIsLoading(false)
    }

    checkAccess()
  }, [moduleId, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-200 to-blue-200">
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">🔒</div>
          <div className="text-3xl text-purple-600 animate-pulse">Verificando acceso...</div>
          <div className="text-lg text-gray-600 mt-2">Módulo {moduleId}</div>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-200 to-pink-200">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg border-4 border-red-400">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-3xl font-bold text-red-600 mb-4">Acceso Denegado</h1>
          <p className="text-lg text-gray-700 mb-6">
            No tienes acceso al Módulo {moduleId}. Este módulo no está asignado para tu configuración de dislexia.
          </p>
          <button
            onClick={() => router.push("/modules")}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
          >
            Volver a Mis Módulos
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
