import { type NextRequest, NextResponse } from "next/server"
import { getAllUsersStats } from "@/lib/db-utils"

export async function GET(request: NextRequest) {
  try {
    const stats = await getAllUsersStats()

    // Preparar datos para exportación
    const exportData = {
      exportDate: new Date().toISOString(),
      totalUsers: stats.length,
      users: stats.map((userStat) => ({
        name: userStat.user.name,
        age: userStat.user.age,
        createdAt: userStat.user.createdAt,
        lastLogin: userStat.user.lastLogin,
        totalProgress: userStat.totalProgress,
        modules: userStat.moduleStats.map((module) => ({
          module: module.module,
          totalAttempts: module.totalAttempts,
          totalSuccesses: module.totalSuccesses,
          completedLevels: module.completedLevels,
          accuracy: module.accuracy,
        })),
      })),
    }

    // Crear CSV
    const csvHeaders = [
      "Nombre",
      "Edad",
      "Fecha Registro",
      "Último Acceso",
      "Progreso Total (%)",
      "Módulo 1 - Intentos",
      "Módulo 1 - Aciertos",
      "Módulo 1 - Precisión (%)",
      "Módulo 2 - Intentos",
      "Módulo 2 - Aciertos",
      "Módulo 2 - Precisión (%)",
      "Módulo 3 - Intentos",
      "Módulo 3 - Aciertos",
      "Módulo 3 - Precisión (%)",
    ]

    const csvRows = stats.map((userStat) => {
      const modules = [1, 2, 3].map((moduleNum) => {
        const moduleStat = userStat.moduleStats.find((m) => m.module === moduleNum)
        return moduleStat || { totalAttempts: 0, totalSuccesses: 0, accuracy: 0 }
      })

      return [
        userStat.user.name,
        userStat.user.age,
        new Date(userStat.user.createdAt).toLocaleDateString(),
        new Date(userStat.user.lastLogin).toLocaleDateString(),
        Math.round(userStat.totalProgress),
        modules[0].totalAttempts,
        modules[0].totalSuccesses,
        Math.round(modules[0].accuracy),
        modules[1].totalAttempts,
        modules[1].totalSuccesses,
        Math.round(modules[1].accuracy),
        modules[2].totalAttempts,
        modules[2].totalSuccesses,
        Math.round(modules[2].accuracy),
      ]
    })

    const csvContent = [csvHeaders, ...csvRows].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="dislexia_app_export_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error("Error en exportación:", error)
    return NextResponse.json({ error: "Error al exportar datos" }, { status: 500 })
  }
}
