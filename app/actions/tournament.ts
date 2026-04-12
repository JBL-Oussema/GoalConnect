'use server'
// Actions serveur pour la gestion d'un tournoi (mise à jour des scores, avancée du bracket et annulation)

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const prisma = new PrismaClient()

async function getCurrentUserId() {
  const session = await getServerSession(authOptions)
  return session?.user ? Number((session.user as any).id) : null
}

export async function updateMatchScore(
  matchId: number, 
  team1Score: number, 
  team2Score: number,
  team1Penalties?: number | null,
  team2Penalties?: number | null
) {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('Unauthorized')

  const match = await prisma.gcTournamentMatch.findUnique({
    where: { id: matchId },
    include: { tournament: true }
  })

  if (!match || match.tournament.organizer_id !== userId) {
    throw new Error('Action non autorisée ou match introuvable')
  }

  if (match.team1_id == null || match.team2_id == null) {
    throw new Error('Le match n\'a pas encore ses deux équipes.')
  }

  // Déterminer le vainqueur
  let winnerId: number | null = null
  if (team1Score > team2Score) {
    winnerId = match.team1_id
  } else if (team2Score > team1Score) {
    winnerId = match.team2_id
  } else {
    // Déterminer par des penaltys
    if (team1Penalties != null && team2Penalties != null) {
      if (team1Penalties > team2Penalties) winnerId = match.team1_id
      else if (team2Penalties > team1Penalties) winnerId = match.team2_id
    }
  }

  if (!winnerId) {
    throw new Error('Impossible de déterminer le vainqueur. Veuillez saisir un score de tirs au but.')
  }

  await prisma.$transaction(async (tx) => {
    
    await tx.gcTournamentMatch.update({
      where: { id: matchId },
      data: {
        team1_score: team1Score,
        team2_score: team2Score,
        team1_penalties: team1Penalties,
        team2_penalties: team2Penalties,
        winner_id: winnerId
      }
    })

    
    if (match.next_match_id) {
       
       const nextMatch = await tx.gcTournamentMatch.findUnique({
         where: { id: match.next_match_id }
       })
       if (nextMatch) {
         
         const isTeam1 = match.match_order % 2 !== 0
         
         if (isTeam1) {
           await tx.gcTournamentMatch.update({
             where: { id: nextMatch.id },
             data: { team1_id: winnerId }
           })
         } else {
           await tx.gcTournamentMatch.update({
             where: { id: nextMatch.id },
             data: { team2_id: winnerId }
           })
         }
       }
    } else {
      
      await tx.gcTournament.update({
        where: { id: match.tournament_id },
        data: { status: 'completed' }
      })
    }
  })

  revalidatePath('/configuration')
  return { success: true, message: 'Score enregistré et vainqueur avancé !' }
}
// Finliser le tournoi
export async function cancelTournament(tournamentId: number) {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('Unauthorized')

  const tournament = await prisma.gcTournament.findUnique({
    where: { id: tournamentId }
  })

  if (!tournament || tournament.organizer_id !== userId) {
    throw new Error('Action non autorisée')
  }

  await prisma.$transaction(async (tx) => {
    
    await tx.reservation.deleteMany({
      where: {
        pitch_id: tournament.pitch_id,
        user_id: userId,
        start_date: tournament.booking_date,
        start_time: tournament.booking_time
      }
    })

  
    await tx.gcTournament.delete({
      where: { id: tournamentId }
    })
  })

  revalidatePath('/dashboard')
  revalidatePath('/configuration')
  return { success: true, message: 'Tournoi annulé et plans supprimés avec succès.' }
}
