'use client'
// Interface utilisateur pour se connecter à son espace personnel

import React, { useState, useEffect, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccessMsg('Compte créé avec succès ! Connectez-vous maintenant.')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccessMsg('')

    const res = await signIn('credentials', {
      redirect: false,
      username,
      password,
    })

    if (res?.error) {
      setError('Nom d\'utilisateur ou mot de passe incorrect.')
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
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
          <h1 className="text-2xl font-black text-slate-800">Bon retour !</h1>
          <p className="text-slate-500 mt-2">Connectez-vous à votre espace ⚽</p>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 font-medium rounded">
            {successMsg}
          </div>
        )}

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
              placeholder="ex: admin"
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
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        <p className="mt-8 text-center text-slate-600 font-medium">
          Nouveau sur GoalConnect ?{' '}
          <Link href="/register" className="text-[#0062AF] hover:underline font-bold">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Chargement...</div>}>
      <LoginForm />
    </Suspense>
  )
}
