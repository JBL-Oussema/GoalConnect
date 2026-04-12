'use server'
// Fichier d'actions serveur (Server Actions) pour la création et l'annulation des réservations

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const prisma = new PrismaClient()

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

async function getCurrentUserId() {
  const session = await getServerSession(authOptions)
  return session?.user ? Number((session.user as any).id) : null
}

// CRÉER UNE RÉSERVATION (Gère les matchs simples et les brouillons de tournois)
export async function createBooking(formData: FormData) {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('Unauthorized')

  const pitchId = Number(formData.get('pitch_id'))
  const bookingType = formData.get('booking_type') as string
  const startDateStr = formData.get('booking_date') as string
  const startTimeStr = formData.get('booking_time') as string


  const startDate = new Date(startDateStr)
  const startTime = new Date(`1970-01-01T${startTimeStr}:00Z`)

 
  const pitch = await prisma.stade.findUnique({ where: { id: pitchId } })
  if (!pitch) throw new Error('Pitch not found')

 
  const basePriceMatch = pitch.prix?.match(/\d+(\.\d+)?/)
  const basePrice = basePriceMatch ? parseFloat(basePriceMatch[0]) : 100

  const reqStart = startDate.getTime()
  const days = bookingType === 'tournament' ? Number(formData.get('team_count')) - 1 : 1
  const reqEnd = reqStart + ((days - 1) * 86400000)

  // Vérifier les réservations existantes
  const existingReservations = await prisma.reservation.findMany({
    where: {
      pitch_id: pitchId,
      start_time: startTime,
      status: { not: 'cancelled' } 
    }
  })

  for (const res of existingReservations) {
    const resStart = new Date(res.start_date).getTime()
    const resTotalDays = res.total_days || 1
    const resEnd = resStart + ((resTotalDays - 1) * 86400000)

    if (reqStart <= resEnd && resStart <= reqEnd) {
      throw new Error(`Le terrain est déjà réservé à cette heure (chevauchement avec une réservation de ${resTotalDays} jour(s)).`)
    }
  }

  // Vérifier les tournois déjà configurés (ceux actifs ont déjà des réservations)
  const existingTournaments = await prisma.gcTournament.findMany({
    where: {
      pitch_id: pitchId,
      booking_time: startTime,
      status: { in: ['setup', 'active'] }
    }
  })

  for (const t of existingTournaments) {
    const tStart = new Date(t.booking_date).getTime()
    const tDays = t.team_count - 1
    const tEnd = tStart + ((tDays - 1) * 86400000)
    
    if (reqStart <= tEnd && tStart <= reqEnd) {
      throw new Error(`Créneau indisponible : un tournoi est déjà prévu ou en cours de configuration sur ces dates.`)
    }
  }

  if (bookingType === 'single') {
  
   
    await prisma.reservation.create({
      data: {
        pitch_id: pitchId,
        user_id: userId,
        booking_type: 'single',
        start_date: startDate,
        start_time: startTime,
        total_days: 1,
        total_price: basePrice,
        status: 'pending'
      }
    })

    revalidatePath('/terrain')
    return { success: true, message: '⚽ Match réservé !' }



  } else if (bookingType === 'tournament') {
    
    const teamCount = Number(formData.get('team_count'))
    const days = teamCount - 1 
    const tournoiPrice = (basePrice * days) * 0.70 

    const tournament = await prisma.gcTournament.create({
      data: {
        organizer_id: userId,
        pitch_id: pitchId,
        tournament_name: 'Nouveau Tournoi',
        team_count: teamCount,
        booking_date: startDate,
        booking_time: startTime,
        total_price: tournoiPrice,
        status: 'setup' 
      }
    })

    redirect(`/configuration?tournament_id=${tournament.id}`)
  } else {
    throw new Error('Invalid booking type')
  }
}


export async function finalizeTournament(tournamentId: number, teamNames: string[]) {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('Unauthorized')

  const tournament = await prisma.gcTournament.findUnique({
    where: { id: tournamentId }
  })

  if (!tournament || tournament.organizer_id !== userId || tournament.status !== 'setup') {
    throw new Error('Invalid tournament or unauthorized access')
  }

  await prisma.$transaction(async (tx) => {


    const days = tournament.team_count - 1

    await tx.reservation.create({
      data: {
        pitch_id: tournament.pitch_id,
        user_id: userId,
        booking_type: 'Tournoi Knockout',
        start_date: tournament.booking_date,
        start_time: tournament.booking_time,
        total_days: days,
        total_price: tournament.total_price,
        status: 'confirmed'
      }
    })


    const createdTeams = []
    for (const name of teamNames) {
      if (name.trim()) {
        const team = await tx.gcTournamentTeam.create({
          data: {
            tournament_id: tournament.id,
            team_name: name.trim()
          }
        })
        createdTeams.push(team)
      }
    }

  
    const totalRounds = Math.log2(tournament.team_count)

  
    let nextRoundMatchIds: number[] = []

    for (let currentRound = totalRounds; currentRound >= 1; currentRound--) {
      const matchCountInRound = Math.pow(2, totalRounds - currentRound)
      const currentRoundMatchIds: number[] = []

      for (let i = 0; i < matchCountInRound; i++) {
     
        const feedsIntoId = currentRound < totalRounds ? nextRoundMatchIds[Math.floor(i / 2)] : null

        
        const team1 = currentRound === 1 ? createdTeams[i * 2] : null
        const team2 = currentRound === 1 ? createdTeams[(i * 2) + 1] : null

        const match = await tx.gcTournamentMatch.create({
          data: {
            tournament_id: tournament.id,
            round: currentRound,
            match_order: i + 1,
            next_match_id: feedsIntoId,
            team1_id: team1 ? team1.id : null,
            team2_id: team2 ? team2.id : null
          }
        })
        currentRoundMatchIds.push(match.id)
      }
      nextRoundMatchIds = currentRoundMatchIds
    }

    
    await tx.gcTournament.update({
      where: { id: tournament.id },
      data: { status: 'active' }
    })
  })

  revalidatePath('/configuration')
  return { success: true, message: '✅ Réservation confirmée et Bracket généré !' }
}


// Annuller réservation

export async function cancelReservation(reservationId: number) {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('Unauthorized')

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId }
  })

 
  if (!reservation || reservation.user_id !== userId) {
    throw new Error('Action non autorisée ou réservation introuvable')
  }

  
  await prisma.reservation.delete({
    where: { id: reservationId }
  })

  revalidatePath('/dashboard')
  return { success: true, message: 'Réservation annulée avec succès.' }
}

