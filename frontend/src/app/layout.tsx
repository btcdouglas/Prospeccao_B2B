import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'

export const metadata: Metadata = {
  title: 'SDR AI-Augmented',
  description: 'Prospecção B2B inteligente',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-gray-950 text-white antialiased">
        <Nav />
        {children}
      </body>
    </html>
  )
}
