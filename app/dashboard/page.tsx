import { getAllUsersStats } from "@/lib/db-utils"
import ProtectedDashboard from "./protected-dashboard"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function DashboardPage() {
  try {
    const stats = await getAllUsersStats()
    return <ProtectedDashboard initialStats={stats} />
  } catch (error) {
    console.error("Error al cargar estadísticas:", error)
    return <ProtectedDashboard initialStats={[]} />
  }
}
