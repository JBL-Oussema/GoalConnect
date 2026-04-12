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

  // Next.js serializes props, so we need to ensure they match the interface roughly
  return <ReservationForm pitch={pitch as any} />
}

