'use client'

import React, { useState } from 'react'
import { cancelReservation } from '@/app/actions/booking'

export default function CancelReservationButton({ reservationId }: { reservationId: number }) {
  const [loading, setLoading] = useState(false)

  const handleCancel = async () => {
    if (confirm('Voulez-vous vraiment annuler cette réservation ?')) {
      setLoading(true)
      try {
        const res = await cancelReservation(reservationId)
        alert(res.message)
      } catch (err: any) {
        alert(err.message || 'Erreur lors de l\'annulation')
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <button 
      onClick={handleCancel} 
      disabled={loading}
      className={`text-red-500 hover:text-red-700 font-bold text-sm ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading ? 'Annulation...' : 'Annuler'}
    </button>
  )
}
