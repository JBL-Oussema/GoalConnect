import { PrismaClient } from '@prisma/client'
import Link from 'next/link'
import Image from 'next/image'

// Force dynamic rendering if pitches update often
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export default async function PitchesList() {
  const stades = await prisma.stade.findMany()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-4">
          NOS TERRAINS
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Découvrez notre sélection de stades pour votre prochain match ou tournoi. 
          Sélectionnez un terrain pour voir les disponibilités.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {stades.map((pitch) => (
          <div key={pitch.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 transition-all hover:shadow-xl hover:-translate-y-1 group flex flex-col">
            <div className="relative h-48 w-full bg-slate-200 overflow-hidden">
              <Image
                src={pitch.img || '/placeholder.jpg'}
                alt={pitch.nom || 'Pitch Image'}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            
            <div className="p-6 flex flex-col flex-grow">
              <h3 className="text-xl font-bold text-[#1E293B] mb-2">{pitch.nom}</h3>
              <p className="text-slate-500 text-sm mb-4 flex items-center">
                📍 {pitch.localisation}
              </p>
              
              <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                <p className="font-black text-[#0062AF] text-lg">
                  {pitch.prix} <span className="text-xs text-slate-400 font-normal">/ 1h30</span>
                </p>
                <Link
                  href={`/terrain/${pitch.id}`}
                  className="bg-[#0062AF] hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-md"
                >
                  Réserver
                </Link>
              </div>
            </div>
          </div>
        ))}

        {stades.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-500 text-lg">
            Aucun terrain trouvé pour le moment.
          </div>
        )}
      </div>
    </div>
  )
}
