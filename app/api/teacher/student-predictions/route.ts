import { type NextRequest, NextResponse } from "next/server"
import { getStudentsByTeacher, getUserProgress } from "@/lib/db-utils"
import { PredictionNetwork, preparePredictionData } from "@/lib/prediction-network"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get("teacherId")
    const studentId = searchParams.get("studentId")

    if (!teacherId) {
      return NextResponse.json({ error: "ID de docente requerido" }, { status: 400 })
    }

    // Inicializar la red neuronal de predicción
    const predictionNetwork = new PredictionNetwork()

    if (studentId) {
      // Predicción para un estudiante específico
      const students = await getStudentsByTeacher(teacherId)
      const student = students.find((s) => s._id!.toString() === studentId)

      if (!student) {
        return NextResponse.json({ error: "Estudiante no encontrado" }, { status: 404 })
      }

      const progressHistory = await getUserProgress(studentId)

      if (progressHistory.length < 5) {
        return NextResponse.json({
          success: true,
          prediction: {
            studentId,
            studentName: `${student.name} ${student.lastName}`,
            hasEnoughData: false,
            message: "Se necesitan al menos 5 sesiones de práctica para generar predicciones precisas",
            minimumDataReached: false,
          },
        })
      }

      const predictionInput = preparePredictionData(progressHistory, student)
      const prediction = predictionNetwork.predict(predictionInput)

      return NextResponse.json({
        success: true,
        prediction: {
          studentId,
          studentName: `${student.name} ${student.lastName}`,
          hasEnoughData: true,
          minimumDataReached: true,
          ...prediction,
        },
      })
    } else {
      // Predicciones para todos los estudiantes
      const students = await getStudentsByTeacher(teacherId)

      if (students.length === 0) {
        return NextResponse.json({
          success: true,
          predictions: [],
        })
      }

      const predictions = []

      for (const student of students) {
        try {
          const progressHistory = await getUserProgress(student._id!.toString())

          if (progressHistory.length < 5) {
            predictions.push({
              studentId: student._id!.toString(),
              studentName: `${student.name} ${student.lastName}`,
              hasEnoughData: false,
              message: "Datos insuficientes para predicción",
              minimumDataReached: false,
            })
            continue
          }

          const predictionInput = preparePredictionData(progressHistory, student)
          const prediction = predictionNetwork.predict(predictionInput)

          predictions.push({
            studentId: student._id!.toString(),
            studentName: `${student.name} ${student.lastName}`,
            hasEnoughData: true,
            minimumDataReached: true,
            ...prediction,
          })
        } catch (error) {
          console.error(`Error generando predicción para ${student.name}:`, error)
          predictions.push({
            studentId: student._id!.toString(),
            studentName: `${student.name} ${student.lastName}`,
            hasEnoughData: false,
            message: "Error al generar predicción",
            minimumDataReached: false,
          })
        }
      }

      return NextResponse.json({
        success: true,
        predictions,
      })
    }
  } catch (error) {
    console.error("Error en predicciones:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
