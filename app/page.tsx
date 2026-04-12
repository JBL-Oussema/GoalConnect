import Link from 'next/link'
import Image from 'next/image'

// Page d'accueil principale de l'application
export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Section Hero : Bannière d'accueil principale */}
      <section className="relative w-full h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <Image
          src="/soccer-stadium-under-lights.jpg"
          alt="Stadium background"
          fill
          className="object-cover"
          priority
        />

        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto space-y-8 mt-10">
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight drop-shadow-xl">
            VOTRE TERRAIN, <br />
            <span className="text-[#0062AF]">VOTRE JEU.</span>
          </h1>
          <p className="text-xl text-gray-200 mt-6 max-w-2xl mx-auto font-medium">
            Le réseau de réservation de terrains de football le plus vaste et dynamique.
            Organisez des matchs simples ou créez des tournois épiques entre amis.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            {/* Lien vers la page de réservation des stades */}
            <Link
              href="/liste-des-stades"
              className="bg-[#0062AF] hover:bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-bold uppercase tracking-wider transition-all transform hover:scale-105 shadow-xl hover:shadow-blue-500/50"
            >
              Réservez Maintenant
            </Link>
            <Link
              href="/configuration"
              className="bg-white hover:bg-gray-100 text-[#0062AF] px-8 py-4 rounded-full text-lg font-bold uppercase tracking-wider transition-all transform hover:scale-105 shadow-xl"
            >
              Mes Tournois
            </Link>
          </div>
        </div>
      </section>

      {/* Section Fonctionnalités : Pourquoi choisir notre plateforme */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-800 tracking-tight">POURQUOI CHOISIR <span className="text-[#0062AF]">GOALCONNECT</span> ?</h2>
            <div className="h-1 w-24 bg-[#0062AF] mx-auto mt-6 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-10 text-center transition-all hover:shadow-xl hover:-translate-y-2">
              <div className="text-5xl mb-6">🏟️</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Terrains Premium</h3>
              <p className="text-slate-600">Accédez aux meilleurs stades du pays avec des infrastructures de haute qualité pour votre confort.</p>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-10 text-center transition-all hover:shadow-xl hover:-translate-y-2">
              <div className="text-5xl mb-6">🏆</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Mode Tournoi</h3>
              <p className="text-slate-600">Organisez des tournois de 4, 8 ou 16 équipes avec notre générateur de bracket et profitez de 30% de réduction.</p>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-10 text-center transition-all hover:shadow-xl hover:-translate-y-2">
              <div className="text-5xl mb-6">⚡</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Réservation Instantanée</h3>
              <p className="text-slate-600">Notre système de réservation sécurisé en temps réel vous garantit votre créneau sans attente.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
