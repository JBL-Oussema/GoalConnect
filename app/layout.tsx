import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Navigation from '@/components/Navigation'
import Providers from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GoalConnect - Réservez Votre Terrain',
  description: 'Le meilleur système de réservation de terrains de football et gestion de tournois.',
  icons: {
    icon: '/icone.png',
    apple: '/icone.png',
  },
}

// Composant principal de la mise en page
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Providers>
          <Navigation />
          {/* Contenu principal de l'application */}
          <main className="bg-slate-50 min-h-[calc(100vh-80px)]">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
