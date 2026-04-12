'use client'

import React, { useState } from 'react'
import { updateMatchScore } from '@/app/actions/tournament'

export default function TournamentBracket({ 
  tournament, 
  matches 
}: { 
  tournament: any, 
  matches: any[] 
}) {
  const [loading, setLoading] = useState(false)

  // Group matches by round
  const maxRound = Math.max(...matches.map(m => m.round))
  const rounds = []
  for (let r = 1; r <= maxRound; r++) {
    rounds.push(matches.filter(m => m.round === r).sort((a, b) => a.match_order - b.match_order))
  }

  const handleScoreSubmit = async (e: React.FormEvent, matchId: number) => {
    e.preventDefault()
    
    const formData = new FormData(e.target as HTMLFormElement)
    const t1Score = Number(formData.get('team1Score'))
    const t2Score = Number(formData.get('team2Score'))
    
    let t1Pens = null
    let t2Pens = null
    
    if (t1Score === t2Score) {
      if (!formData.get('team1Pens') || !formData.get('team2Pens')) {
        alert("En cas d'égalité, vous devez spécifier le score des tirs au but.")
        return
      }
      t1Pens = Number(formData.get('team1Pens'))
      t2Pens = Number(formData.get('team2Pens'))
      
      if (t1Pens === t2Pens) {
        alert("Les tirs au but ne peuvent pas se terminer par une égalité.")
        return
      }
    }

    setLoading(true)
    try {
      const res = await updateMatchScore(matchId, t1Score, t2Score, t1Pens, t2Pens)
      alert(res.message)
    } catch (err: any) {
      alert(err.message || 'Erreur.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="overflow-x-auto pb-8">
      <div className="flex gap-8 min-w-max px-4">
        {rounds.map((roundMatches, roundIndex) => (
          <div key={roundIndex} className="flex flex-col justify-around gap-6 w-72">
            <h3 className="text-center font-black text-slate-400 uppercase tracking-widest text-sm mb-4">
              {maxRound - roundIndex === 1 ? 'Finale' : 
               maxRound - roundIndex === 2 ? 'Demi-finales' : 
               maxRound - roundIndex === 3 ? 'Quarts de finale' : 
               maxRound - roundIndex === 4 ? 'Huitièmes de finale' :
               `Tour ${roundIndex + 1}`}
            </h3>
            
            {roundMatches.map(match => {
              const isPlayed = match.winner_id != null
              const canPlay = match.team1_id != null && match.team2_id != null && !isPlayed

              return (
                <div key={match.id} className={`bg-white rounded-xl shadow-sm border p-4 ${isPlayed ? 'border-[#0062AF]' : 'border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-3 text-sm">
                    <span className="text-slate-500 font-bold">Match #{match.match_order}</span>
                    {isPlayed && <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-bold">Terminé</span>}
                  </div>

                  <form onSubmit={(e) => handleScoreSubmit(e, match.id)} className="space-y-4">
                    {/* Team 1 Row */}
                    <div className="flex items-center justify-between">
                      <span className={`font-medium ${match.winner_id === match.team1_id ? 'font-black text-[#0062AF]' : 'text-slate-700'}`}>
                        {match.team1?.team_name || <span className="italic text-slate-400">À déterminer</span>}
                      </span>
                      {isPlayed ? (
                        <div className="font-bold flex items-center gap-2">
                           {match.team1_penalties != null && <span className="text-xs text-orange-500">({match.team1_penalties})</span>}
                           {match.team1_score}
                        </div>
                      ) : canPlay && (
                        <input type="number" name="team1Score" required min="0" className="w-16 border rounded px-2 py-1 text-center" placeholder="0" />
                      )}
                    </div>

                    {/* Team 2 Row */}
                    <div className="flex items-center justify-between">
                      <span className={`font-medium ${match.winner_id === match.team2_id ? 'font-black text-[#0062AF]' : 'text-slate-700'}`}>
                        {match.team2?.team_name || <span className="italic text-slate-400">À déterminer</span>}
                      </span>
                      {isPlayed ? (
                        <div className="font-bold flex items-center gap-2">
                           {match.team2_penalties != null && <span className="text-xs text-orange-500">({match.team2_penalties})</span>}
                           {match.team2_score}
                        </div>
                      ) : canPlay && (
                        <input type="number" name="team2Score" required min="0" className="w-16 border rounded px-2 py-1 text-center" placeholder="0" />
                      )}
                    </div>

                    {/* Penalty inputs if active and needed (handled dynamically via JS ideally, but we can safely show them if canPlay and let users fill them if draw) */}
                    {canPlay && (
                      <div className="pt-3 border-t border-slate-100">
                        <p className="text-xs text-slate-500 mb-2">Tirs au but (uniquement si égalité) :</p>
                        <div className="flex justify-between gap-2">
                          <input type="number" name="team1Pens" min="0" className="w-1/2 border rounded px-2 py-1 text-center text-sm" placeholder="T.A.B 1" />
                          <input type="number" name="team2Pens" min="0" className="w-1/2 border rounded px-2 py-1 text-center text-sm" placeholder="T.A.B 2" />
                        </div>
                        <button type="submit" disabled={loading} className="mt-3 w-full bg-[#0062AF] text-white font-bold py-1.5 rounded-lg hover:bg-blue-600 text-sm disabled:opacity-50">
                           Enregistrer
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
