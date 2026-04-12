'use client'

import React, { useState } from 'react'
import { createBooking } from '@/app/actions/booking'

interface Pitch {
  id: number
  nom: string
  localisation: string
  prix: string
  img: string
}

interface ReservationFormProps {
  pitch: Pitch
}

export default function ReservationForm({ pitch }: ReservationFormProps) {
  const [bookingType, setBookingType] = useState<'single' | 'tournament'>('single')
  const [teamCount, setTeamCount] = useState<number>(8)
  const [loading, setLoading] = useState(false)

  // Extract base price cleanly
  const basePriceMatch = pitch.prix.match(/\d+(\.\d+)?/)
  const basePrice = basePriceMatch ? parseFloat(basePriceMatch[0]) : 100

  // Calculate dynamic price
  const isTournament = bookingType === 'tournament'
  const tournamentDays = teamCount - 1
  const tournoiPrice = isTournament ? (basePrice * tournamentDays) * 0.70 : basePrice
  const totalDays = isTournament ? tournamentDays : 1

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    try {
      const response = await createBooking(formData)
      if (response?.success) {
        alert(response.message)
      }
    } catch (error: any) {
      alert(error.message || 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-5 font-sans mt-8">
      <h1 className="text-4xl font-black mb-6" style={{ color: '#0062AF' }}>
        {pitch.nom}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <img
          src={pitch.img}
          alt={pitch.nom}
          className="w-full h-[300px] object-cover rounded-xl shadow-lg border border-slate-200"
        />

        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <p className="text-lg text-slate-800 mb-6">
            📍 <strong className="ml-2 bg-slate-100 px-3 py-1 rounded-md">{pitch.localisation}</strong>
          </p>
          <div className="bg-slate-50 p-4 rounded-lg items-center inline-block">
            <p className="text-4xl font-black" style={{ color: '#0062AF' }}>
              {tournoiPrice.toFixed(2)} DT
            </p>
            <p className="text-sm font-medium text-slate-500 mt-1">
              {isTournament ? `/ Tournoi (${totalDays} Jours)` : '/ Match 1h30'}
            </p>
          </div>
          <p className="mt-6 text-slate-600 leading-relaxed text-sm">
            Sélectionnez votre type de réservation ci-dessous. Le prix du tournoi inclut une remise de <span className="font-bold text-red-500">30%</span> sur le tarif de base !
          </p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-md mb-20">
        <h2 className="text-2xl font-black mb-8 pl-4 border-l-8" style={{ color: '#1e293b', borderColor: '#0062AF' }}>
          Finaliser la Réservation
        </h2>

        <form action={handleSubmit} className="space-y-8">
          <input type="hidden" name="pitch_id" value={pitch.id} />
          
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <label className="block text-lg font-bold mb-4 text-slate-800">
              1. Type de réservation :
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${bookingType === 'single' ? 'border-[#0062AF] bg-blue-50 ring-2 ring-blue-200' : 'border-slate-200 hover:bg-slate-100'}`}>
                <input
                  type="radio"
                  name="booking_type"
                  value="single"
                  checked={bookingType === 'single'}
                  onChange={() => setBookingType('single')}
                  className="w-5 h-5 mr-3 accent-[#0062AF]"
                />
                <span className="font-medium text-slate-700">Match Simple (1 Jour)</span>
              </label>

              <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${bookingType === 'tournament' ? 'border-[#0062AF] bg-blue-50 ring-2 ring-blue-200' : 'border-slate-200 hover:bg-slate-100'}`}>
                <input
                  type="radio"
                  name="booking_type"
                  value="tournament"
                  checked={bookingType === 'tournament'}
                  onChange={() => setBookingType('tournament')}
                  className="w-5 h-5 mr-3 accent-[#0062AF]"
                />
                <span className="font-medium text-slate-700">Tournoi Knockout</span>
              </label>
            </div>

            {isTournament && (
              <div className="mt-6 pt-6 border-t border-slate-200 animate-in fade-in slide-in-from-top-4 duration-300">
                <label className="block font-bold mb-3 text-slate-800">
                  Nombre d'équipes participantes :
                </label>
                <select
                  name="team_count"
                  value={teamCount}
                  onChange={(e) => setTeamCount(Number(e.target.value))}
                  className="w-full p-4 border border-slate-300 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-[#0062AF] outline-none font-medium bg-white"
                >
                  <option value={4}>4 Équipes (3 Matchs / 3 Jours)</option>
                  <option value={8}>8 Équipes (7 Matchs / 7 Jours)</option>
                  <option value={16}>16 Équipes (15 Matchs / 15 Jours)</option>
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
            <div>
              <label className="block font-bold mb-3 text-slate-800">
                2. Date de début :
              </label>
              <input
                type="date"
                name="booking_date"
                required
                className="w-full p-4 border border-slate-300 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-[#0062AF] outline-none font-medium text-slate-700"
              />
            </div>
            <div>
              <label className="block font-bold mb-3 text-slate-800">
                3. Heure du coup d'envoi :
              </label>
              <select
                name="booking_time"
                required
                className="w-full p-4 border border-slate-300 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-[#0062AF] outline-none font-medium text-slate-700"
              >
                <option value="">-- Choisir une heure --</option>
                <option value="16:00">16:00 - 17:30</option>
                <option value="18:00">18:00 - 19:30</option>
                <option value="20:00">20:00 - 21:30</option>
                <option value="22:00">22:00 - 23:30</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-5 bg-[#0062AF] hover:bg-blue-600 text-white text-xl font-black uppercase tracking-wider rounded-xl transition-all duration-300 shadow-xl hover:shadow-blue-500/40 hover:-translate-y-1 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Traitement en cours...' : 'Confirmer la réservation'}
          </button>
        </form>
      </div>
    </div>
  )
}
