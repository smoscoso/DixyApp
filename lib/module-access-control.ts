// Utilidad para verificar acceso a módulos
export function hasModuleAccess(assignedModules: number[], moduleId: number): boolean {
  return assignedModules.includes(moduleId)
}

// Obtener módulos asignados desde localStorage
export function getAssignedModules(): number[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem("assignedModules")
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

// Verificar si el usuario es estudiante
export function isStudent(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem("userRole") === "student"
}

// Obtener información del estudiante
export function getStudentInfo() {
  if (typeof window === "undefined") return null

  return {
    userId: localStorage.getItem("userId"),
    userName: localStorage.getItem("userName"),
    userRole: localStorage.getItem("userRole"),
    assignedModules: getAssignedModules(),
    dyslexiaLevel: localStorage.getItem("dyslexiaLevel"),
    dyslexiaType: localStorage.getItem("dyslexiaType"),
    hasKinestheticDyslexia: localStorage.getItem("hasKinestheticDyslexia") === "true",
  }
}
