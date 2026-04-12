// Page de gestion et de configuration des tournois (définition des équipes, affichage du bracket)
import { PrismaClient } from '@prisma/client'
import Link from 'next/link'
import TournamentTeamsForm from '@/components/TournamentTeamsForm'
import TournamentBracket from '@/components/TournamentBracket'
import CancelTournamentButton from '@/components/CancelTournamentButton'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export default async function ConfigurationDashboard({ searchParams }: { searchParams: { tournament_id?: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const userId = Number((session.user as any).id)
  if (!userId) redirect('/login')

  // Trouver le tournoi demandé, ou se rabattre sur la dernière configuration
  const tournamentIdFromUrl = searchParams.tournament_id ? Number(searchParams.tournament_id) : null

  let tournamentQuery: any = { organizer_id: userId }
  if (tournamentIdFromUrl) {
    tournamentQuery.id = tournamentIdFromUrl
  } else {
    tournamentQuery.status = 'setup'
  }

  const tournament = await prisma.gcTournament.findFirst({
    where: tournamentQuery,
    orderBy: {
      id: 'desc'
    },
    include: {
      pitch: true,
      teams: true,
      matches: {
        include: {
          team1: true,
          team2: true
        }
      }
    }
  })

  const isSetup = tournament?.status === 'setup'
  const isBracket = tournament?.status === 'active' || tournament?.status === 'completed'

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        <div className="bg-[#0062AF] py-6 px-8 text-center text-white">
          <h1 className="text-3xl font-black mb-2 flex items-center justify-center">
            🏆 Dashboard des Tournois
          </h1>
          {tournament && (
            <p className="text-blue-100 text-lg">{tournament.tournament_name} - {tournament.pitch.nom}</p>
          )}
        </div>

        <div className="p-8">
          {!tournament ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-6">⚽</div>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">
                Aucun tournoi trouvé
              </h2>
              <p className="text-slate-500 mb-8 max-w-md mx-auto">
                Vous n'avez pas de tournoi en attente ou le tournoi demandé est introuvable.
              </p>
              <Link 
                href="/dashboard"
                className="bg-[#0062AF] hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold transition-all shadow-md inline-block uppercase tracking-wide"
              >
                Retour à Mon Espace
              </Link>
            </div>
          ) : isSetup ? (
            <div className="animate-in fade-in duration-500">
              <div className="bg-blue-50 border-l-4 border-[#0062AF] p-6 rounded-r-lg mb-8 relative">
                <div className="absolute top-4 right-4">
                  <CancelTournamentButton tournamentId={tournament.id} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">
                  Action Requise: Configuration des équipes
                </h3>
                <p className="text-slate-600 mb-4">
                  Saisissez le nom des équipes afin de générer le bracket et activer votre tournoi.
                </p>
              </div>

              <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center">
                <span className="bg-[#0062AF] text-white w-8 h-8 flex items-center justify-center rounded-full mr-3 text-sm">✓</span>
                Équipes ({tournament.team_count})
              </h2>

              <TournamentTeamsForm tournamentId={tournament.id} teamCount={tournament.team_count} />
            </div>
          ) : isBracket ? (
            <div className="animate-in fade-in duration-500">
               <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                    Bracket du Tournoi
                    {tournament.status === 'completed' && <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full uppercase tracking-widest">Terminé</span>}
                  </h2>
                  <div className="flex items-center gap-6">
                    {tournament.status !== 'completed' && (
                      <CancelTournamentButton tournamentId={tournament.id} />
                    )}
                    <Link href="/dashboard" className="text-sm font-bold text-slate-500 hover:text-[#0062AF]">
                      ← Retour
                    </Link>
                  </div>
               </div>
               
               <TournamentBracket tournament={tournament} matches={tournament.matches} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

