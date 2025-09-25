"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download } from "lucide-react"
import DashboardStats from "./dashboard-stats"
import DashboardAuth from "@/components/dashboard-auth"
import type { UserStats } from "@/lib/models"

interface ProtectedDashboardProps {
  initialStats: UserStats[]
}

export default function ProtectedDashboard({ initialStats }: ProtectedDashboardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await fetch("/api/export")
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `dislexia_app_export_${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Error al exportar:", error)
    } finally {
      setIsExporting(false)
    }
  }

  if (!isAuthenticated) {
    return <DashboardAuth onAuthenticated={() => setIsAuthenticated(true)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2 bg-white rounded-full p-6 shadow-md">
              <ArrowLeft className="h-6 w-6" />
              <span className="text-lg">Volver al inicio</span>
            </Button>
          </Link>
          <div className="text-center bg-white p-4 rounded-2xl shadow-lg border-4 border-indigo-400">
            <h1 className="text-3xl font-bold text-indigo-600">Panel de Control Administrativo</h1>
            <p className="text-xl text-indigo-500">Estadísticas de usuarios y progreso</p>
          </div>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 rounded-full p-6 shadow-md"
          >
            <Download className="h-6 w-6" />
            <span className="text-lg">{isExporting ? "Exportando..." : "Exportar Datos"}</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-medium">Total de Usuarios</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{initialStats.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-medium">Promedio de Progreso</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">
                {initialStats.length > 0
                  ? Math.round(initialStats.reduce((sum, s) => sum + s.totalProgress, 0) / initialStats.length)
                  : 0}
                %
              </p>
              <Progress
                value={
                  initialStats.length > 0
                    ? Math.round(initialStats.reduce((sum, s) => sum + s.totalProgress, 0) / initialStats.length)
                    : 0
                }
                className="h-2 mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-medium">Módulo más Popular</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">
                {initialStats.length > 0 ? getMostPopularModule(initialStats) : "N/A"}
              </p>
            </CardContent>
          </Card>
        </div>

        <DashboardStats stats={initialStats} />
      </div>
    </div>
  )
}

function getMostPopularModule(stats: any[]) {
  if (stats.length === 0) return "N/A"

  const moduleCounts = [0, 0, 0]

  for (const user of stats) {
    for (const moduleStat of user.moduleStats) {
      moduleCounts[moduleStat.module - 1] += moduleStat.totalAttempts
    }
  }

  const maxIndex = moduleCounts.indexOf(Math.max(...moduleCounts))
  return `Módulo ${maxIndex + 1}`
}
