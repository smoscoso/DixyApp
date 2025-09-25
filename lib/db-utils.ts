import clientPromise from "./mongodb"
import { ObjectId } from "mongodb"
import type { User, Progress, UserStats, ModuleStats, DyslexiaConfig } from "./models"
import { hashPassword } from "./crypto-utils"
import crypto from "crypto"

// Colecciones
const DB_NAME = "dislexia_app"
const USERS_COLLECTION = "users"
const PROGRESS_COLLECTION = "progress"

// Configuración de dislexia y módulos actualizada
export const DYSLEXIA_CONFIGS: Record<string, DyslexiaConfig> = {
  "leve-fonologica": {
    level: "leve",
    type: "fonologica",
    assignedModules: [1, 2],
    description: "Dificultades leves en el procesamiento fonológico",
  },
  "leve-superficial": {
    level: "leve",
    type: "superficial",
    assignedModules: [1, 3, 5],
    description: "Dificultades leves en el reconocimiento visual de palabras",
  },
  "leve-mixta": {
    level: "leve",
    type: "mixta",
    assignedModules: [1, 2, 3],
    description: "Dificultades leves mixtas",
  },
  "leve-kinestesica": {
    level: "leve",
    type: "kinestesica",
    assignedModules: [4, 5],
    description: "Dificultades leves en la coordinación motriz y percepción espacial",
  },
  "moderado-fonologica": {
    level: "moderado",
    type: "fonologica",
    assignedModules: [1, 2],
    description: "Dificultades moderadas en el procesamiento fonológico",
  },
  "moderado-superficial": {
    level: "moderado",
    type: "superficial",
    assignedModules: [1, 3, 5, 6],
    description: "Dificultades moderadas en el reconocimiento visual de palabras",
  },
  "moderado-mixta": {
    level: "moderado",
    type: "mixta",
    assignedModules: [1, 2, 3, 6],
    description: "Dificultades moderadas mixtas",
  },
  "moderado-kinestesica": {
    level: "moderado",
    type: "kinestesica",
    assignedModules: [4, 5, 6],
    description: "Dificultades moderadas en la coordinación motriz y percepción espacial",
  },
  "severo-fonologica": {
    level: "severo",
    type: "fonologica",
    assignedModules: [1, 2],
    description: "Dificultades severas en el procesamiento fonológico",
  },
  "severo-superficial": {
    level: "severo",
    type: "superficial",
    assignedModules: [1, 3, 5, 6],
    description: "Dificultades severas en el reconocimiento visual de palabras",
  },
  "severo-mixta": {
    level: "severo",
    type: "mixta",
    assignedModules: [1, 2, 3, 4, 5, 6],
    description: "Dificultades severas mixtas - programa completo",
  },
  "severo-kinestesica": {
    level: "severo",
    type: "kinestesica",
    assignedModules: [4, 5, 6],
    description: "Dificultades severas en la coordinación motriz y percepción espacial",
  },
}

// Configuraciones especiales para estudiantes con dislexia kinestésica adicional
export const KINESTHETIC_ADDITIONAL_MODULES = [4, 5, 6]

// Función para generar nombre de usuario único
async function generateUniqueUsername(firstName: string, lastName: string): Promise<string> {
  const client = await clientPromise
  const db = client.db(DB_NAME)

  // Limpiar y formatear nombres
  const cleanFirstName = firstName.trim().split(" ")[0]
  const cleanLastName = lastName.trim().split(" ")[0]

  // Formato base: PrimerNombre.PrimerApellido
  const baseUsername = `${cleanFirstName}.${cleanLastName}`.toLowerCase()

  // Verificar si el nombre de usuario ya existe
  let username = baseUsername
  let counter = 1

  while (true) {
    const existingUser = await db.collection(USERS_COLLECTION).findOne({ username })
    if (!existingUser) {
      break
    }
    counter++
    username = `${baseUsername}${counter}`
  }

  return username
}

// Funciones para usuarios
export async function createTeacher(name: string, email: string, password: string): Promise<User> {
  const client = await clientPromise
  const db = client.db(DB_NAME)

  // Verificar si el email ya existe
  const existingUser = await db.collection(USERS_COLLECTION).findOne({ email })
  if (existingUser) {
    throw new Error("El email ya está registrado")
  }

  const hashedPassword = hashPassword(password)

  const newUser: User = {
    name,
    email,
    password: hashedPassword,
    role: "teacher",
    createdAt: new Date(),
    lastLogin: new Date(),
  }

  const result = await db.collection(USERS_COLLECTION).insertOne(newUser)
  return { ...newUser, _id: result.insertedId }
}

// Función legacy para compatibilidad
export async function createUser(name: string, age: number): Promise<User> {
  // Esta función ya no se usa en el nuevo sistema
  // Los estudiantes se crean desde el dashboard del docente
  throw new Error("Esta función ya no se usa. Los estudiantes se crean desde el panel de control del docente.")
}

export async function createStudent(
  teacherId: string,
  name: string,
  lastName: string,
  age: number,
  course: string,
  dyslexiaLevel: "leve" | "moderado" | "severo",
  dyslexiaType: "fonologica" | "superficial" | "mixta" | "kinestesica",
  hasKinestheticDyslexia?: boolean,
): Promise<User & { username: string; plainPassword: string }> {
  const client = await clientPromise
  const db = client.db(DB_NAME)

  // Generar nombre de usuario único
  const username = await generateUniqueUsername(name, lastName)

  // Generar contraseña automática
  const firstName = name.split(" ")[0]
  const plainPassword = `${firstName}${age}`
  const hashedPassword = hashPassword(plainPassword)

  // Obtener módulos asignados según el tipo y nivel de dislexia
  const configKey = `${dyslexiaLevel}-${dyslexiaType}`
  const config = DYSLEXIA_CONFIGS[configKey]

  if (!config) {
    throw new Error("Configuración de dislexia no válida")
  }

  let assignedModules = [...config.assignedModules]

  // Si tiene dislexia kinestésica adicional, añadir esos módulos
  if (hasKinestheticDyslexia && dyslexiaType !== "kinestesica") {
    assignedModules = [...new Set([...assignedModules, ...KINESTHETIC_ADDITIONAL_MODULES])]
  }

  const newStudent: User = {
    name,
    lastName,
    username,
    age,
    password: hashedPassword,
    role: "student",
    teacherId: new ObjectId(teacherId),
    course,
    dyslexiaLevel,
    dyslexiaType,
    hasKinestheticDyslexia,
    assignedModules,
    createdAt: new Date(),
    lastLogin: new Date(),
  }

  const result = await db.collection(USERS_COLLECTION).insertOne(newStudent)

  return {
    ...newStudent,
    _id: result.insertedId,
    username,
    plainPassword,
  }
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    console.log("=== AUTHENTICATE USER ===")
    console.log("Connecting to database...")

    const client = await clientPromise
    const db = client.db(DB_NAME)

    console.log("Searching for user with email:", email)
    const user = await db.collection(USERS_COLLECTION).findOne<User>({ email })

    if (!user) {
      console.log("User not found in database")
      return null
    }

    console.log("User found:", {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    })

    const hashedPassword = hashPassword(password)
    console.log("Comparing passwords...")
    console.log("Stored password hash:", user.password)
    console.log("Provided password hash:", hashedPassword)

    if (user.password !== hashedPassword) {
      console.log("Password mismatch")
      return null
    }

    console.log("Password match! Updating last login...")

    // Actualizar último login
    await db.collection(USERS_COLLECTION).updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } })

    console.log("Authentication successful!")
    return user
  } catch (error) {
    console.error("Error in authenticateUser:", error)
    return null
  }
}

export async function authenticateStudent(username: string, password: string): Promise<User | null> {
  const client = await clientPromise
  const db = client.db(DB_NAME)

  const user = await db.collection(USERS_COLLECTION).findOne<User>({
    username: username.toLowerCase(),
    role: "student",
  })

  if (!user) {
    return null
  }

  const hashedPassword = hashPassword(password)
  if (user.password !== hashedPassword) {
    return null
  }

  // Actualizar último login
  await db.collection(USERS_COLLECTION).updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } })

  return user
}

// Funciones para reset de contraseña
export async function generateResetToken(email: string): Promise<string | null> {
  const client = await clientPromise
  const db = client.db(DB_NAME)

  const user = await db.collection(USERS_COLLECTION).findOne<User>({ email })
  if (!user) {
    return null
  }

  const resetToken = crypto.randomBytes(32).toString("hex")
  const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hora

  await db.collection(USERS_COLLECTION).updateOne(
    { _id: user._id },
    {
      $set: {
        resetToken,
        resetTokenExpiry,
      },
    },
  )

  return resetToken
}

export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
  const client = await clientPromise
  const db = client.db(DB_NAME)

  const user = await db.collection(USERS_COLLECTION).findOne<User>({
    resetToken: token,
    resetTokenExpiry: { $gt: new Date() },
  })

  if (!user) {
    return false
  }

  const hashedPassword = hashPassword(newPassword)

  await db.collection(USERS_COLLECTION).updateOne(
    { _id: user._id },
    {
      $set: { password: hashedPassword },
      $unset: { resetToken: "", resetTokenExpiry: "" },
    },
  )

  return true
}

export async function getUserById(id: string): Promise<User | null> {
  const client = await clientPromise
  const db = client.db(DB_NAME)

  return db.collection(USERS_COLLECTION).findOne<User>({ _id: new ObjectId(id) })
}

export async function getStudentsByTeacher(teacherId: string): Promise<User[]> {
  const client = await clientPromise
  const db = client.db(DB_NAME)

  console.log("Buscando estudiantes para teacherId:", teacherId)

  const students = await db
    .collection(USERS_COLLECTION)
    .find<User>({
      teacherId: new ObjectId(teacherId),
      role: "student",
    })
    .sort({ name: 1 })
    .toArray()

  console.log("Estudiantes encontrados en DB:", students.length)

  return students
}

export async function getAllUsers(): Promise<User[]> {
  const client = await clientPromise
  const db = client.db(DB_NAME)

  return db.collection(USERS_COLLECTION).find<User>({}).sort({ lastLogin: -1 }).toArray()
}

export async function updateUserLastLogin(id: string): Promise<void> {
  const client = await clientPromise
  const db = client.db(DB_NAME)

  await db.collection(USERS_COLLECTION).updateOne({ _id: new ObjectId(id) }, { $set: { lastLogin: new Date() } })
}

// Funciones para progreso
export async function saveProgress(userId: string, module: number, level: number, success: boolean): Promise<void> {
  const client = await clientPromise
  const db = client.db(DB_NAME)

  // Buscar si ya existe un registro para este usuario, módulo y nivel
  const existingProgress = await db.collection(PROGRESS_COLLECTION).findOne({
    userId: new ObjectId(userId),
    module,
    level,
  })

  if (existingProgress) {
    // Actualizar el registro existente
    await db.collection(PROGRESS_COLLECTION).updateOne(
      { _id: existingProgress._id },
      {
        $inc: {
          attempts: 1,
          successes: success ? 1 : 0,
        },
        $set: { date: new Date() },
      },
    )
  } else {
    // Crear un nuevo registro
    await db.collection(PROGRESS_COLLECTION).insertOne({
      userId: new ObjectId(userId),
      module,
      level,
      attempts: 1,
      successes: success ? 1 : 0,
      date: new Date(),
    })
  }
}

export async function getUserProgress(userId: string): Promise<Progress[]> {
  const client = await clientPromise
  const db = client.db(DB_NAME)

  return db
    .collection(PROGRESS_COLLECTION)
    .find<Progress>({ userId: new ObjectId(userId) })
    .sort({ module: 1, level: 1 })
    .toArray()
}

export async function getStudentProgress(studentId: string): Promise<{
  totalProgress: number
  moduleProgress: { [key: number]: number }
  assignedModules: number[]
}> {
  const client = await clientPromise
  const db = client.db(DB_NAME)

  const student = await getUserById(studentId)
  if (!student || student.role !== "student") {
    throw new Error("Estudiante no encontrado")
  }

  const progress = await getUserProgress(studentId)
  const assignedModules = student.assignedModules || []

  // Calcular progreso por módulo
  const moduleProgress: { [key: number]: number } = {}
  let totalCompletedLevels = 0
  let totalPossibleLevels = 0

  for (const moduleNum of assignedModules) {
    const moduleProgressData = progress.filter((p) => p.module === moduleNum)
    const completedLevels = moduleProgressData.filter((p) => p.successes > 0).length
    const maxLevel = 10 // Cada módulo tiene 10 niveles

    moduleProgress[moduleNum] = (completedLevels / maxLevel) * 100
    totalCompletedLevels += completedLevels
    totalPossibleLevels += maxLevel
  }

  const totalProgress = totalPossibleLevels > 0 ? (totalCompletedLevels / totalPossibleLevels) * 100 : 0

  return {
    totalProgress,
    moduleProgress,
    assignedModules,
  }
}

// Funciones para estadísticas
export async function getUserStats(userId: string): Promise<UserStats | null> {
  const client = await clientPromise
  const db = client.db(DB_NAME)

  const user = await getUserById(userId)
  if (!user) return null

  const progress = await getUserProgress(userId)

  // Calcular estadísticas por módulo
  const moduleMap = new Map<number, ModuleStats>()

  for (const entry of progress) {
    if (!moduleMap.has(entry.module)) {
      moduleMap.set(entry.module, {
        module: entry.module,
        totalAttempts: 0,
        totalSuccesses: 0,
        completedLevels: 0,
        accuracy: 0,
      })
    }

    const stats = moduleMap.get(entry.module)!
    stats.totalAttempts += entry.attempts
    stats.totalSuccesses += entry.successes

    // Consideramos un nivel completado si hay al menos un éxito
    if (entry.successes > 0) {
      stats.completedLevels += 1
    }
  }

  // Calcular precisión para cada módulo
  for (const stats of moduleMap.values()) {
    stats.accuracy = stats.totalAttempts > 0 ? (stats.totalSuccesses / stats.totalAttempts) * 100 : 0
  }

  // Calcular progreso total basado en módulos asignados
  const assignedModules = user.assignedModules || [1, 2, 3]
  const totalLevels = assignedModules.length * 10 // 10 niveles por módulo
  const completedLevels = Array.from(moduleMap.values()).reduce((sum, stats) => sum + stats.completedLevels, 0)

  const totalProgress = (completedLevels / totalLevels) * 100

  return {
    user,
    totalProgress,
    moduleStats: Array.from(moduleMap.values()),
  }
}

export async function getAllUsersStats(): Promise<UserStats[]> {
  const client = await clientPromise
  const db = client.db(DB_NAME)

  const users = await getAllUsers()
  const stats: UserStats[] = []

  for (const user of users) {
    if (user._id) {
      const userStats = await getUserStats(user._id.toString())
      if (userStats) {
        stats.push(userStats)
      }
    }
  }

  return stats
}
