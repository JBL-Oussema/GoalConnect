'use client'

import React from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

import Image from 'next/image'

// Composant pour la barre de navigation de l'application
export default function Navigation() {
  const { data: session, status } = useSession()

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center mt-1">
              <Image 
                src="/site logo.png" 
                alt="GoalConnect Logo" 
                width={160} 
                height={50} 
                priority
                className="object-contain hover:opacity-90 transition-opacity"
              />
            </Link>
            
            {/* Liens de navigation : Accueil, Réserver, Mon Espace */}
            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
              <Link href="/" className="border-transparent text-gray-500 hover:border-[#0062AF] hover:text-[#0062AF] inline-flex items-center px-1 border-b-2 font-medium">
                Accueil
              </Link>
              <Link href="/liste-des-stades" className="border-transparent text-gray-500 hover:border-[#0062AF] hover:text-[#0062AF] inline-flex items-center px-1 border-b-2 font-medium">
                Réserver
              </Link>
              {session && (
                <Link href="/dashboard" className="border-transparent text-gray-500 hover:border-[#0062AF] hover:text-[#0062AF] inline-flex items-center px-1 border-b-2 font-medium">
                  Mon Espace
                </Link>
              )}
            </div>
          </div>

          {/* Section utilisateur : affichage profil ou bouton de connexion */}
          <div className="flex items-center">
            {status === 'loading' ? (
              <div className="animate-pulse bg-gray-200 rounded-full h-10 w-24"></div>
            ) : session ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  👤 {session.user?.name || 'Joueur'}
                </span>

                <button
                  onClick={() => signOut()}
                  className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-full text-sm font-bold transition-colors"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-[#0062AF] hover:bg-blue-700 text-white px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-wide transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                Se connecter
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
