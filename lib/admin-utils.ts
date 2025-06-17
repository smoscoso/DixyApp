import clientPromise from "./mongodb"
import type { ObjectId } from "mongodb"

// Colecciones
const DB_NAME = "dislexia_app"
const ADMIN_COLLECTION = "admin_config"

export interface AdminConfig {
  _id?: ObjectId
  dashboardPassword: string
  createdAt: Date
  updatedAt: Date
}

// Función para verificar la contraseña del dashboard
export async function verifyDashboardPassword(password: string): Promise<boolean> {
  const client = await clientPromise
  const db = client.db(DB_NAME)

  const config = await db.collection(ADMIN_COLLECTION).findOne<AdminConfig>({})

  if (!config) {
    // Si no existe configuración, crear una con contraseña por defecto
    await createDefaultAdminConfig()
    return password === "admin123"
  }

  return config.dashboardPassword === password
}

// Función para crear configuración por defecto
export async function createDefaultAdminConfig(): Promise<void> {
  const client = await clientPromise
  const db = client.db(DB_NAME)

  const defaultConfig: AdminConfig = {
    dashboardPassword: "admin123",
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  await db.collection(ADMIN_COLLECTION).insertOne(defaultConfig)
}

// Función para actualizar la contraseña
export async function updateDashboardPassword(newPassword: string): Promise<void> {
  const client = await clientPromise
  const db = client.db(DB_NAME)

  await db.collection(ADMIN_COLLECTION).updateOne(
    {},
    {
      $set: {
        dashboardPassword: newPassword,
        updatedAt: new Date(),
      },
    },
    { upsert: true },
  )
}
