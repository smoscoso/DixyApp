export interface ModuleInfo {
  id: number
  title: string
  description: string
  icon: string
  color: string
  targetDyslexia: string[]
  difficulty: "basico" | "intermedio" | "avanzado"
}

export interface DyslexiaConfig {
  level: "leve" | "moderado" | "severo"
  type: "fonologica" | "superficial" | "mixta" | "kinestesica"
  assignedModules: number[]
  description: string
}

// Información de módulos disponibles (solo constantes, sin conexión a DB)
export const MODULE_INFO: ModuleInfo[] = [
  {
    id: 1,
    title: "Reconocimiento de Letras",
    description: "Dibuja letras en una cuadrícula mágica",
    icon: "✏️",
    color: "from-pink-400 to-purple-500",
    targetDyslexia: ["fonologica", "mixta"],
    difficulty: "basico",
  },
  {
    id: 2,
    title: "Formación de Palabras",
    description: "Encuentra la letra por su sonido",
    icon: "🔊",
    color: "from-blue-400 to-cyan-500",
    targetDyslexia: ["fonologica", "mixta"],
    difficulty: "basico",
  },
  {
    id: 3,
    title: "Palabras Complejas",
    description: "Escribe palabras por su sonido",
    icon: "📝",
    color: "from-green-400 to-teal-500",
    targetDyslexia: ["superficial", "mixta"],
    difficulty: "intermedio",
  },
  {
    id: 4,
    title: "Movimiento y Escritura",
    description: "Traza letras con movimientos corporales",
    icon: "🤸",
    color: "from-orange-400 to-red-500",
    targetDyslexia: ["kinestesica", "mixta"],
    difficulty: "basico",
  },
  {
    id: 5,
    title: "Secuencias Temporales",
    description: "Organiza eventos en el tiempo correcto",
    icon: "⏰",
    color: "from-purple-400 to-pink-500",
    targetDyslexia: ["kinestesica", "superficial"],
    difficulty: "intermedio",
  },
  {
    id: 6,
    title: "Patrones Espaciales",
    description: "Reconoce y crea patrones visuales",
    icon: "🧩",
    color: "from-indigo-400 to-blue-500",
    targetDyslexia: ["kinestesica", "superficial", "mixta"],
    difficulty: "avanzado",
  },
]

// Configuración de dislexia y módulos (constantes para el cliente)
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
