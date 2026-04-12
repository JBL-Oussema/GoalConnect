// Point d'accès API traitant la requête d'inscription (création d'un nouveau compte)
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json()

    if (!username || !password) {
      return NextResponse.json({ message: 'Le nom d\'utilisateur et le mot de passe sont requis.' }, { status: 400 })
    }

  
    const existingUser = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUser) {
      return NextResponse.json({ message: 'Ce nom d\'utilisateur est déjà pris.' }, { status: 409 })
    }

    
    const hashedPassword = await bcrypt.hash(password, 10)

    
    await prisma.user.create({
      data: {
        username,
        password: hashedPassword
      }
    })

    return NextResponse.json({ message: 'Compte créé avec succès !' }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ message: 'Une erreur est survenue lors de l\'inscription.' }, { status: 500 })
  }
}
