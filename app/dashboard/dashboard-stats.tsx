"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import type { UserStats } from "@/lib/models"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function DashboardStats({ stats }: { stats: UserStats[] }) {
  const [activeTab, setActiveTab] = useState("users")

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Estadísticas Detalladas</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="users" onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="modules">Módulos</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Edad</TableHead>
                  <TableHead>Progreso Total</TableHead>
                  <TableHead>Último Acceso</TableHead>
                  <TableHead>Módulos Completados</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.length > 0 ? (
                  stats.map((user) => (
                    <TableRow key={user.user._id?.toString()}>
                      <TableCell className="font-medium">{user.user.name}</TableCell>
                      <TableCell>{user.user.age} años</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={user.totalProgress} className="h-2 w-24" />
                          <span>{Math.round(user.totalProgress)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(user.user.lastLogin).toLocaleString()}</TableCell>
                      <TableCell>{user.moduleStats.filter((m) => m.completedLevels > 0).length} de 3</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No hay datos de usuarios disponibles
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="modules">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((moduleNum) => (
                <Card key={moduleNum}>
                  <CardHeader>
                    <CardTitle>Módulo {moduleNum}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ModuleStats stats={stats} moduleNum={moduleNum} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function ModuleStats({ stats, moduleNum }: { stats: UserStats[]; moduleNum: number }) {
  // Filtrar estadísticas para este módulo
  const moduleStats = stats.map((user) => user.moduleStats.find((m) => m.module === moduleNum)).filter(Boolean)

  if (moduleStats.length === 0) {
    return <p className="text-gray-500">No hay datos disponibles</p>
  }

  // Calcular estadísticas
  const totalAttempts = moduleStats.reduce((sum, stat) => sum + (stat?.totalAttempts || 0), 0)
  const totalSuccesses = moduleStats.reduce((sum, stat) => sum + (stat?.totalSuccesses || 0), 0)
  const avgAccuracy = moduleStats.reduce((sum, stat) => sum + (stat?.accuracy || 0), 0) / moduleStats.length
  const usersStarted = moduleStats.filter((stat) => (stat?.totalAttempts || 0) > 0).length
  const usersCompleted = moduleStats.filter((stat) => (stat?.completedLevels || 0) === 10).length

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-gray-500">Intentos Totales</p>
        <p className="text-2xl font-bold">{totalAttempts}</p>
      </div>

      <div>
        <p className="text-sm text-gray-500">Aciertos Totales</p>
        <p className="text-2xl font-bold">{totalSuccesses}</p>
      </div>

      <div>
        <p className="text-sm text-gray-500">Precisión Promedio</p>
        <div className="flex items-center gap-2">
          <Progress value={avgAccuracy} className="h-2 flex-1" />
          <span>{Math.round(avgAccuracy)}%</span>
        </div>
      </div>

      <div>
        <p className="text-sm text-gray-500">Usuarios que han iniciado</p>
        <p className="text-2xl font-bold">
          {usersStarted} de {stats.length}
        </p>
      </div>

      <div>
        <p className="text-sm text-gray-500">Usuarios que han completado</p>
        <p className="text-2xl font-bold">
          {usersCompleted} de {stats.length}
        </p>
      </div>
    </div>
  )
}
