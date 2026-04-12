import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text", placeholder: "admin" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;
        
        const user = await prisma.user.findUnique({
          where: { username: credentials.username }
        })
        
        if (user) {
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
        // Expose the integer ID to match our NextAuth mocked server actions
        (session.user as any).id = Number(token.sub)
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  }
}
