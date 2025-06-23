"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { User } from "@/lib/models"
import { BarChart3, PieChart, TrendingUp, Users, Clock, Target } from "lucide-react"

interface DashboardChartsProps {
  students: User[]
}

export default function DashboardCharts({ students }: DashboardChartsProps) {
  // Calcular estadísticas para las gráficas
  const getModuleCompletionStats = () => {
    const moduleStats = [
      { module: "Módulo 1", completed: 0, total: students.length },
      { module: "Módulo 2", completed: 0, total: students.length },
      { module: "Módulo 3", completed: 0, total: students.length },
      { module: "Módulo 4", completed: 0, total: students.length },
      { module: "Módulo 5", completed: 0, total: students.length },
      { module: "Módulo 6", completed: 0, total: students.length },
    ]

    students.forEach((student) => {
      // Simular datos de progreso por módulo (en una implementación real, esto vendría de la base de datos)
      const progress = student.progress || 0
      if (progress > 16) moduleStats[0].completed++
      if (progress > 33) moduleStats[1].completed++
      if (progress > 50) moduleStats[2].completed++
      if (progress > 66) moduleStats[3].completed++
      if (progress > 83) moduleStats[4].completed++
      if (progress === 100) moduleStats[5].completed++
    })

    return moduleStats
  }

  const getDyslexiaTypeDistribution = () => {
    const distribution = {
      fonologica: 0,
      superficial: 0,
      mixta: 0,
      kinestesica: 0,
    }

    students.forEach((student) => {
      if (student.dyslexiaType) {
        distribution[student.dyslexiaType as keyof typeof distribution]++
      }
    })

    return Object.entries(distribution).map(([type, count]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count,
      percentage: students.length > 0 ? (count / students.length) * 100 : 0,
    }))
  }

  const getProgressDistribution = () => {
    const ranges = [
      { label: "0-20%", min: 0, max: 20, count: 0, color: "bg-red-500" },
      { label: "21-40%", min: 21, max: 40, count: 0, color: "bg-orange-500" },
      { label: "41-60%", min: 41, max: 60, count: 0, color: "bg-yellow-500" },
      { label: "61-80%", min: 61, max: 80, count: 0, color: "bg-blue-500" },
      { label: "81-100%", min: 81, max: 100, count: 0, color: "bg-green-500" },
    ]

    students.forEach((student) => {
      const progress = student.progress || 0
      ranges.forEach((range) => {
        if (progress >= range.min && progress <= range.max) {
          range.count++
        }
      })
    })

    return ranges
  }

  const getAgeDistribution = () => {
    const ageGroups = {
      "5-7 años": 0,
      "8-10 años": 0,
      "11-13 años": 0,
      "14-16 años": 0,
      "17-18 años": 0,
    }

    students.forEach((student) => {
      const age = student.age || 0
      if (age >= 5 && age <= 7) ageGroups["5-7 años"]++
      else if (age >= 8 && age <= 10) ageGroups["8-10 años"]++
      else if (age >= 11 && age <= 13) ageGroups["11-13 años"]++
      else if (age >= 14 && age <= 16) ageGroups["14-16 años"]++
      else if (age >= 17 && age <= 18) ageGroups["17-18 años"]++
    })

    return Object.entries(ageGroups).map(([group, count]) => ({
      group,
      count,
      percentage: students.length > 0 ? (count / students.length) * 100 : 0,
    }))
  }

  const moduleStats = getModuleCompletionStats()
  const dyslexiaDistribution = getDyslexiaTypeDistribution()
  const progressDistribution = getProgressDistribution()
  const ageDistribution = getAgeDistribution()

  return (
    <div className="space-y-8">
      {/* Gráfica de Completación por Módulos */}
      <Card className="border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="text-xl text-blue-900 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Completación por Módulos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {moduleStats.map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">{stat.module}</span>
                  <span className="text-sm text-gray-500">
                    {stat.completed}/{stat.total} estudiantes
                  </span>
                </div>
                <div className="relative">
                  <Progress value={stat.total > 0 ? (stat.completed / stat.total) * 100 : 0} className="h-3" />
                  <span className="absolute right-2 top-0 text-xs font-medium text-white">
                    {stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Distribución por Tipo de Dislexia */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
            <CardTitle className="text-xl text-purple-900 flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Tipos de Dislexia
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {dyslexiaDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full ${
                        index === 0
                          ? "bg-purple-500"
                          : index === 1
                            ? "bg-pink-500"
                            : index === 2
                              ? "bg-indigo-500"
                              : "bg-cyan-500"
                      }`}
                    ></div>
                    <span className="font-medium text-gray-700">{item.type}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{item.count}</div>
                    <div className="text-sm text-gray-500">{Math.round(item.percentage)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Distribución de Progreso */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
            <CardTitle className="text-xl text-green-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Distribución de Progreso
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {progressDistribution.map((range, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">{range.label}</span>
                    <span className="text-sm text-gray-500">{range.count} estudiantes</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${range.color} transition-all duration-300`}
                      style={{
                        width: `${students.length > 0 ? (range.count / students.length) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Distribución por Edad */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50 border-b">
            <CardTitle className="text-xl text-orange-900 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Distribución por Edad
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {ageDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full ${
                        index === 0
                          ? "bg-red-500"
                          : index === 1
                            ? "bg-orange-500"
                            : index === 2
                              ? "bg-yellow-500"
                              : index === 3
                                ? "bg-green-500"
                                : "bg-blue-500"
                      }`}
                    ></div>
                    <span className="font-medium text-gray-700">{item.group}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{item.count}</div>
                    <div className="text-sm text-gray-500">{Math.round(item.percentage)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas de Actividad */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b">
            <CardTitle className="text-xl text-teal-900 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-600 mb-2">
                  {
                    students.filter((s) => {
                      const lastLogin = new Date(s.lastLogin)
                      const today = new Date()
                      return lastLogin.toDateString() === today.toDateString()
                    }).length
                  }
                </div>
                <div className="text-sm text-gray-600">Estudiantes activos hoy</div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-600 mb-2">
                  {
                    students.filter((s) => {
                      const lastLogin = new Date(s.lastLogin)
                      const weekAgo = new Date()
                      weekAgo.setDate(weekAgo.getDate() - 7)
                      return lastLogin >= weekAgo
                    }).length
                  }
                </div>
                <div className="text-sm text-gray-600">Estudiantes activos esta semana</div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-2">
                  {students.filter((s) => (s.progress || 0) > 50).length}
                </div>
                <div className="text-sm text-gray-600">Estudiantes con más del 50% de progreso</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumen de Rendimiento */}
      <Card className="border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b">
          <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Resumen de Rendimiento
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {students.length > 0
                  ? Math.round(students.reduce((sum, s) => sum + (s.progress || 0), 0) / students.length)
                  : 0}
                %
              </div>
              <div className="text-sm text-blue-800">Progreso Promedio</div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {students.filter((s) => (s.progress || 0) >= 80).length}
              </div>
              <div className="text-sm text-green-800">Estudiantes Avanzados</div>
            </div>

            <div className="text-center p-4 bg-yellow-50 rounded-xl">
              <div className="text-2xl font-bold text-yellow-600 mb-2">
                {students.filter((s) => (s.progress || 0) >= 20 && (s.progress || 0) < 80).length}
              </div>
              <div className="text-sm text-yellow-800">En Progreso</div>
            </div>

            <div className="text-center p-4 bg-red-50 rounded-xl">
              <div className="text-2xl font-bold text-red-600 mb-2">
                {students.filter((s) => (s.progress || 0) < 20).length}
              </div>
              <div className="text-sm text-red-800">Necesitan Apoyo</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
