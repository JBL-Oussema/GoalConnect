// Tableau de bord de l'utilisateur affichant ses réservations (simples ou tournois)
import React from 'react'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from 'next/navigation'
import Link from 'next/link'

import CancelReservationButton from '@/components/CancelReservationButton'

const prisma = new PrismaClient()

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const userId = Number((session.user as any).id)
  if (!userId) {
    redirect('/login')
  }

  const reservations = await prisma.reservation.findMany({
    where: { user_id: userId },
    include: { pitch: true },
    orderBy: { start_date: 'desc' }
  })

  const tournaments = await prisma.gcTournament.findMany({
    where: { organizer_id: userId },
    include: { pitch: true, teams: true },
    orderBy: { booking_date: 'desc' }
  })

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 mt-8">
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl mb-12">
        <h1 className="text-4xl font-black mb-2 text-slate-800 tracking-tight">
          Tableau de bord de <span className="text-[#0062AF]">{session.user.name}</span>
        </h1>
        <p className="text-slate-500 text-lg">Retrouvez et gérez vos réservations et tournois ⚽</p>
      </div>

      <div className="mb-14">
        <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
          <span className="bg-[#0062AF] text-white w-10 h-10 flex items-center justify-center rounded-xl">📅</span>
          Mes Réservations Récentes
        </h2>
        {reservations.length === 0 ? (
          <div className="bg-slate-50 p-8 rounded-2xl border border-dashed border-slate-300 text-center">
            <p className="text-slate-500 font-medium pb-4">Vous n'avez aucune réservation.</p>
            <Link href="/liste-des-stades" className="inline-block px-6 py-3 bg-[#0062AF] text-white font-bold rounded-xl hover:bg-blue-600 transition-colors">Réserver un match</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reservations.map(res => (
              <div key={res.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${res.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      res.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                    {res.status === 'confirmed' ? 'Confirmé' : res.status === 'cancelled' ? 'Annulé' : 'En attente'}
                  </span>
                  {res.status === 'pending' && <CancelReservationButton reservationId={res.id} />}
                </div>
                <h3 className="font-black text-xl text-slate-800 mb-1">{res.pitch.nom}</h3>
                <p className="text-[#0062AF] font-semibold text-sm mb-4">{res.booking_type}</p>

                <div className="space-y-2 text-sm text-slate-600">
                  <p>🗓️ {new Date(res.start_date).toLocaleDateString('fr-FR')}</p>
                  <p>⏰ {new Date(res.start_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                  <p>💰 <span className="font-bold text-slate-800">{res.total_price.toString()} DT</span></p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
          <span className="bg-[#0062AF] text-white w-10 h-10 flex items-center justify-center rounded-xl">🏆</span>
          Mes Tournois
        </h2>
        {tournaments.length === 0 ? (
          <div className="bg-slate-50 p-8 rounded-2xl border border-dashed border-slate-300 text-center">
            <p className="text-slate-500 font-medium">Vous n'avez organisé aucun tournoi.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map(tour => (
              <div key={tour.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative">
                <div className="absolute top-0 right-0 p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${tour.status === 'active' ? 'bg-blue-100 text-[#0062AF]' : 'bg-slate-100 text-slate-600'
                    }`}>
                    {tour.status === 'active' ? 'Actif' : 'Brouillon'}
                  </span>
                </div>
                <h3 className="font-black text-xl text-slate-800 mb-1">{tour.tournament_name}</h3>
                <p className="text-[#0062AF] font-semibold text-sm mb-4">{tour.pitch.nom}</p>

                <div className="space-y-2 text-sm text-slate-600 mb-6">
                  <p>🗓️ {new Date(tour.booking_date).toLocaleDateString('fr-FR')}</p>
                  <p>👥 {tour.team_count} Équipes inscrites</p>
                </div>

                {tour.status === 'setup' && (
                  <Link href={`/configuration?tournament_id=${tour.id}`} className="block text-center w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors">
                    Continuer la configuration
                  </Link>
                )}
                {tour.status === 'active' && (
                  <Link href={`/configuration?tournament_id=${tour.id}`} className="block text-center w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition-colors border border-slate-300">
                    Voir les détails
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
