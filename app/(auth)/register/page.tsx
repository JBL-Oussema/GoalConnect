'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function RegisterPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const data = await res.json()

      if (res.ok) {
        router.push('/login?registered=true')
      } else {
        setError(data.message || 'Une erreur est survenue.')
      }
    } catch (err) {
      setError('Erreur de connexion au serveur.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
        <div className="text-center mb-8">
          <Image 
            src="/site logo.png" 
            alt="GoalConnect Logo" 
            width={180} 
            height={60} 
            className="mx-auto mb-4 object-contain"
          />
          <h1 className="text-2xl font-black text-slate-800">Créer un compte</h1>
          <p className="text-slate-500 mt-2">Rejoignez-nous pour réserver votre terrain ⚽</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 font-medium rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-4 border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-[#0062AF] outline-none transition-all"
              placeholder="ex: joueur123"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-[#0062AF] outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 bg-[#0062AF] hover:bg-blue-700 text-white text-lg font-black uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Inscription...' : 'S\'inscrire'}
          </button>
        </form>

        <p className="mt-8 text-center text-slate-600 font-medium">
          Vous avez déjà un compte ?{' '}
          <Link href="/login" className="text-[#0062AF] hover:underline font-bold">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
