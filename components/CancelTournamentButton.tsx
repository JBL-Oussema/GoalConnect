'use client'
// Composant bouton permettant d'annuler un tournoi de bout en bout

import { useState } from 'react'
import { cancelTournament } from '@/app/actions/tournament'
import { useRouter } from 'next/navigation'

export default function CancelTournamentButton({ tournamentId }: { tournamentId: number }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleCancel = async () => {
    if (!confirm('Êtes-vous sûr de vouloir annuler ce tournoi ? Cela supprimera toutes les réservations correspondantes.')) return
    
    setLoading(true)
    try {
      const res = await cancelTournament(tournamentId)
      if (res.success) {
        alert(res.message)
        router.push('/dashboard')
      }
    } catch (err: any) {
      alert(err.message || 'Erreur lors de l\'annulation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleCancel}
      disabled={loading}
      className={`text-sm font-bold text-red-500 hover:text-red-700 transition-colors ${loading ? 'opacity-50' : ''}`}
    >
      {loading ? 'Annulation...' : 'Annuler le tournoi'}
    </button>
  )
}
