'use client'
// Composant fournissant le contexte de session NextAuth à l'ensemble de l'application
import { SessionProvider } from 'next-auth/react'

export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
