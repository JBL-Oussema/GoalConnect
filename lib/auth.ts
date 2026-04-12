import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

// Configuration des options NextAuth pour le système d'authentification
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text", placeholder: "admin" },
        password: { label: "Password", type: "password" }
      },
      // Fonction pour vérifier et valider les identifiants de l'utilisateur
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;
        
        // Recherche de l'utilisateur dans la base de données
        const user = await prisma.user.findUnique({
          where: { username: credentials.username }
        })
        
        if (user) {
          // Vérification du mot de passe avec le hash stocké
          const isValid = await bcrypt.compare(credentials.password, user.password)
          if (isValid) {
            return { id: user.id.toString(), name: user.username }
          }
        }
        return null
      }
    })

  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        // Exposer l'ID (entier) pour correspondre à nos 'Server Actions' simulées de NextAuth
        (session.user as any).id = Number(token.sub)
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  }
}
