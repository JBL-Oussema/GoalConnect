'use client'

import { useState } from 'react'
import { finalizeTournament } from '@/app/actions/booking'

export default function TournamentTeamsForm({ tournamentId, teamCount }: { tournamentId: number, teamCount: number }) {
  const [loading, setLoading] = useState(false)

  // Pre-fill an array with empty strings based on teamCount
  const [teams, setTeams] = useState<string[]>(Array(teamCount).fill(''))

  const handleNameChange = (index: number, val: string) => {
    const newTeams = [...teams]
    newTeams[index] = val
    setTeams(newTeams)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const resp = await finalizeTournament(tournamentId, teams)
      if (resp.success) {
        alert(resp.message)
      }
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teams.map((team, idx) => (
          <div key={idx} className="bg-slate-50 p-4 border border-slate-200 rounded-lg">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Nom de l'équipe {idx + 1}
            </label>
            <input
              type="text"
              required
              value={team}
              onChange={(e) => handleNameChange(idx, e.target.value)}
              placeholder="Ex: FC Ariana"
              className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0062AF] focus:border-[#0062AF] outline-none"
            />
          </div>
        ))}
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className={`w-full py-4 text-white text-lg font-bold rounded-lg uppercase tracking-wide transition-all shadow-md ${
          loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#0062AF] hover:bg-blue-600 hover:-translate-y-0.5'
        }`}
      >
        {loading ? 'Génération du bracket...' : 'Démarrer le Tournoi'}
      </button>
    </form>
  )
}
