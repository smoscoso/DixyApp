import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Users, Brain, Target, Award, Shield, Sparkles, Zap, Heart } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Brain className="h-10 w-10 text-indigo-600" />
                <Sparkles className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  DislexiaApp
                </h1>
                <p className="text-xs text-gray-500">Educación Inteligente</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-indigo-600 hover:bg-indigo-50 font-medium">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg">
                  Registrarse
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10"></div>
        <div className="container mx-auto text-center relative">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-indigo-200 mb-6">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-indigo-700">Tecnología de Vanguardia</span>
            </div>

            <h2 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Transformando la
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent block">
                Educación Especial
              </span>
            </h2>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              Una plataforma revolucionaria que utiliza inteligencia artificial y redes neuronales para ayudar a niños
              con dislexia a desarrollar sus habilidades de lectura y escritura de manera personalizada y divertida.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <Link href="/auth/register">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-lg px-8 py-4 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
                >
                  <Heart className="mr-2 h-5 w-5" />
                  Comenzar Ahora
                </Button>
              </Link>
              <Link href="#features">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-4 border-2 border-indigo-200 hover:bg-indigo-50"
                >
                  Conocer Más
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">6</div>
                <div className="text-sm text-gray-600">Módulos Especializados</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">AI</div>
                <div className="text-sm text-gray-600">Inteligencia Artificial</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">100%</div>
                <div className="text-sm text-gray-600">Personalizado</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-indigo-100 px-4 py-2 rounded-full mb-4">
              <Target className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-700">Características Principales</span>
            </div>
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Tecnología que Marca la Diferencia</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Nuestra plataforma está diseñada específicamente para abordar las necesidades únicas de cada tipo y nivel
              de dislexia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Brain className="h-8 w-8 text-indigo-600" />}
              title="Inteligencia Artificial"
              description="Redes neuronales especializadas que se adaptan al nivel y tipo de dislexia de cada estudiante."
              gradient="from-indigo-500 to-blue-500"
            />
            <FeatureCard
              icon={<Target className="h-8 w-8 text-green-600" />}
              title="Módulos Especializados"
              description="Seis módulos diseñados para diferentes aspectos: reconocimiento, formación, movimiento y patrones."
              gradient="from-green-500 to-teal-500"
            />
            <FeatureCard
              icon={<Users className="h-8 w-8 text-blue-600" />}
              title="Gestión Inteligente"
              description="Los docentes pueden crear y gestionar perfiles de estudiantes con asignación automática de módulos."
              gradient="from-blue-500 to-cyan-500"
            />
            <FeatureCard
              icon={<BookOpen className="h-8 w-8 text-purple-600" />}
              title="Seguimiento Avanzado"
              description="Monitoreo detallado del progreso con estadísticas en tiempo real y reportes visuales."
              gradient="from-purple-500 to-pink-500"
            />
            <FeatureCard
              icon={<Award className="h-8 w-8 text-yellow-600" />}
              title="Gamificación"
              description="Experiencia de aprendizaje divertida con elementos de juego, recompensas y celebraciones."
              gradient="from-yellow-500 to-orange-500"
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8 text-red-600" />}
              title="Seguridad Total"
              description="Protección de datos con encriptación avanzada y gestión segura de información estudiantil."
              gradient="from-red-500 to-pink-500"
            />
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Dos Roles, Una Misión</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Nuestra plataforma está diseñada para docentes y estudiantes, cada uno con herramientas específicas para
              sus necesidades.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Docente */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-2xl font-bold text-blue-900">Para Docentes</h4>
                  <p className="text-blue-600">Herramientas profesionales de gestión</p>
                </div>
                <ul className="space-y-4 text-blue-800 mb-6">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-3 mt-1">✓</span>
                    <span>Crear y gestionar perfiles de estudiantes</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-3 mt-1">✓</span>
                    <span>Asignación automática según tipo y nivel de dislexia</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-3 mt-1">✓</span>
                    <span>Monitoreo de progreso en tiempo real</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-3 mt-1">✓</span>
                    <span>Reportes detallados y exportación de datos</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-3 mt-1">✓</span>
                    <span>Panel de Control administrativo completo</span>
                  </li>
                </ul>
                <Link href="/auth/register">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg">
                    Registrarse como Docente
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Estudiante */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 overflow-hidden">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4">
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-2xl font-bold text-green-900">Para Estudiantes</h4>
                  <p className="text-green-600">Experiencia de aprendizaje personalizada</p>
                </div>
                <ul className="space-y-4 text-green-800 mb-6">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-3 mt-1">✓</span>
                    <span>Módulos adaptativos personalizados</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-3 mt-1">✓</span>
                    <span>Interfaz intuitiva y colorida</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-3 mt-1">✓</span>
                    <span>Seguimiento de progreso personal</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-3 mt-1">✓</span>
                    <span>Ejercicios interactivos y divertidos</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-3 mt-1">✓</span>
                    <span>Recompensas y celebraciones</span>
                  </li>
                </ul>
                <Link href="/auth/student-login">
                  <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg">
                    Acceso para Estudiantes
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <Brain className="h-8 w-8 text-indigo-400" />
                <div>
                  <h5 className="text-xl font-bold">DislexiaApp</h5>
                  <p className="text-sm text-gray-400">Educación Inteligente</p>
                </div>
              </div>
              <p className="text-gray-400 max-w-md">
                Transformando la educación para niños con dislexia a través de la tecnología de inteligencia artificial
                más avanzada.
              </p>
            </div>
            <div>
              <h6 className="font-semibold mb-4">Enlaces Rápidos</h6>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/auth/register" className="hover:text-white transition-colors">
                    Registro
                  </Link>
                </li>
                <li>
                  <Link href="/auth/login" className="hover:text-white transition-colors">
                    Iniciar Sesión
                  </Link>
                </li>
                <li>
                  <Link href="/auth/student-login" className="hover:text-white transition-colors">
                    Acceso Estudiantes
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h6 className="font-semibold mb-4">Soporte</h6>
              <ul className="space-y-2 text-gray-400">
                <li>Ayuda y Documentación</li>
                <li>Contacto</li>
                <li>Términos de Uso</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 DislexiaApp. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  gradient,
}: {
  icon: React.ReactNode
  title: string
  description: string
  gradient: string
}) {
  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
      <CardContent className="p-6 text-center">
        <div
          className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}
        >
          <div className="text-white">{icon}</div>
        </div>
        <h4 className="text-xl font-semibold mb-3 text-gray-900">{title}</h4>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  )
}
