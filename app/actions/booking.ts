'use server'

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


// ----------------------------------------------------------------------
// 1. CREATE BOOKING (Handles both single match and tournament draft)
//    Replaces: `if($_POST['booking_type'] === 'single')` logic in PHP
// ----------------------------------------------------------------------
export async function createBooking(formData: FormData) {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('Unauthorized')

  const pitchId = Number(formData.get('pitch_id'))
  const bookingType = formData.get('booking_type') as string // 'single' | 'tournament'
  const startDateStr = formData.get('booking_date') as string
  const startTimeStr = formData.get('booking_time') as string

  // Form payload date handling
  const startDate = new Date(startDateStr)
  const startTime = new Date(`1970-01-01T${startTimeStr}:00Z`)

  // Ensure security: NEVER trust the client-side price. Calculate on Server.
  const pitch = await prisma.stade.findUnique({ where: { id: pitchId } })
  if (!pitch) throw new Error('Pitch not found')

  // Parse string price to float (e.g., '108DT' -> 108.00)
  const basePriceMatch = pitch.prix?.match(/\d+(\.\d+)?/)
  const basePrice = basePriceMatch ? parseFloat(basePriceMatch[0]) : 100

  // ---------- OVERLAP CHECK ----------
  const reqStart = startDate.getTime()
  const days = bookingType === 'tournament' ? Number(formData.get('team_count')) - 1 : 1
  const reqEnd = reqStart + ((days - 1) * 86400000)

  // 1. Check existing reservations
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

  // 2. Check existing setup tournaments (active ones already have reservations)
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
  // -----------------------------------

  if (bookingType === 'single') {
    // ----------------------------------------------------------
    // SINGLE BOOKING
    // ----------------------------------------------------------
    await prisma.reservation.create({
      data: {
        pitch_id: pitchId,
        user_id: userId,
        booking_type: 'single',
        start_date: startDate,
        start_time: startTime,
        total_days: 1,
        total_price: basePrice,
        status: 'pending' // As per your PHP logic
      }
    })

    revalidatePath('/terrain')
    return { success: true, message: '⚽ Match réservé !' }

  } else if (bookingType === 'tournament') {
    // ----------------------------------------------------------
    // TOURNAMENT DRAFT
    // ----------------------------------------------------------
    const teamCount = Number(formData.get('team_count'))
    const days = teamCount - 1 // 4 teams=3 days, 8 teams=7 days, 16 teams=15 days
    const tournoiPrice = (basePrice * days) * 0.70 // Server-side implementation of the 30% discount

    const tournament = await prisma.gcTournament.create({
      data: {
        organizer_id: userId,
        pitch_id: pitchId,
        tournament_name: 'Nouveau Tournoi',
        team_count: teamCount,
        booking_date: startDate,
        booking_time: startTime,
        total_price: tournoiPrice,
        status: 'setup' // As per your PHP logic
      }
    })

    // Once in draft state, redirect user to insert teams
    redirect(`/configuration?tournament_id=${tournament.id}`)
  } else {
    throw new Error('Invalid booking type')
  }
}

// ----------------------------------------------------------------------
// 2. FINALIZE TOURNAMENT (Teams configuration & Confirmation)
//    Replaces: `gc_manage_tournament_dashboard` submit logic in PHP
// ----------------------------------------------------------------------
export async function finalizeTournament(tournamentId: number, teamNames: string[]) {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('Unauthorized')

  const tournament = await prisma.gcTournament.findUnique({
    where: { id: tournamentId }
  })

  // Prevent illegal states
  if (!tournament || tournament.organizer_id !== userId || tournament.status !== 'setup') {
    throw new Error('Invalid tournament or unauthorized access')
  }

  // Use a Prisma Transaction to ensure everything passes or fails together safely
  await prisma.$transaction(async (tx) => {

    // 1. Insert into reservations (converting from draft tournament into a real reservation mapping)
    // Matches logic: ($tournament->team_count == 4) ? 3 : (($tournament->team_count == 8) ? 7 : 15)
    // which simplifies to team_count - 1
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

    // 2. Insert Teams
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

    // 3. Generate Bracket Matches
    const totalRounds = Math.log2(tournament.team_count)

    // Create matches round by round, storing them so we can link them.
    // For n=8, Round 1 has 4 matches, Round 2 has 2, Round 3 has 1 (Final).
    // Let's build from final to first round so we always have the next_match_id available.

    // Arrays to keep track of matches in the previous created round (which is the next logical round)
    let nextRoundMatchIds: number[] = []

    for (let currentRound = totalRounds; currentRound >= 1; currentRound--) {
      const matchCountInRound = Math.pow(2, totalRounds - currentRound)
      const currentRoundMatchIds: number[] = []

      for (let i = 0; i < matchCountInRound; i++) {
        // Find which match this feeds into. 
        // 2 matches feed into 1 next match. So match i feeds into nextRoundMatchIds[Math.floor(i / 2)]
        const feedsIntoId = currentRound < totalRounds ? nextRoundMatchIds[Math.floor(i / 2)] : null

        // If it's the very first round (currentRound === 1), we populate the actual teams
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

    // 4. Mark the Tournament Setup as Complete (Active)
    await tx.gcTournament.update({
      where: { id: tournament.id },
      data: { status: 'active' }
    })
  })

  // Optionally revalidate any needed routes
  revalidatePath('/configuration')
  return { success: true, message: '✅ Réservation confirmée et Bracket généré !' }
}

// ----------------------------------------------------------------------
// 3. CANCEL RESERVATION
// ----------------------------------------------------------------------
export async function cancelReservation(reservationId: number) {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('Unauthorized')

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId }
  })

  // Ensure user owns this reservation
  if (!reservation || reservation.user_id !== userId) {
    throw new Error('Action non autorisée ou réservation introuvable')
  }

  // Drop reservation from database exactly as asked
  await prisma.reservation.delete({
    where: { id: reservationId }
  })

  revalidatePath('/dashboard')
  return { success: true, message: 'Réservation annulée avec succès.' }
}

