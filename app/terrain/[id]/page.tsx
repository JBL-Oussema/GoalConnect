// Page dynamique affichant les détails d'un terrain spécifique et son formulaire de réservation
import { PrismaClient } from '@prisma/client'
import { notFound, redirect } from 'next/navigation'
import ReservationForm from '@/components/ReservationForm'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const prisma = new PrismaClient()

export default async function TerrainPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const pitch = await prisma.stade.findUnique({
    where: { id: parseInt(params.id) }
  })

  if (!pitch) {
    notFound()
  }

  return <ReservationForm pitch={pitch as any} />
}

