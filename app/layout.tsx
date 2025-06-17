import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DixyApp',
  description: 'Una herramienta innovadora que utiliza inteligencia artificial y redes neuronales para ayudar a niños con dislexia a mejorar sus habilidades de lectura y escritura de manera divertida e interactiva.',
  keywords: 'dislexia, lectura, escritura, niños, inteligencia artificial, redes neuronales, educación',
  authors: [
    {
      name: 'Sergio Leonardo Moscoso Ramirez y Daniel Esteban Orozco Casas',
    }
  ]
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
