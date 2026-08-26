import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Network, Users, Briefcase, GraduationCap } from 'lucide-react';

export function HubIntro() {
  return (
    <div className="bg-[#FAF9F6] min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-4xl text-center">
        <h1 className="text-4xl md:text-5xl font-bold font-heading text-[#6B3E1E] mb-6">
          Bienvenue sur le FAFE Hub
        </h1>
        <p className="text-xl text-[#6B3E1E]/80 mb-12 max-w-2xl mx-auto">
          L'espace numérique exclusif réservé aux membres du réseau FAFE. Connectez-vous, partagez et grandissez avec des femmes entrepreneures de tout le continent.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6 mb-12 text-left">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#6B3E1E]/5">
            <Users className="w-10 h-10 text-[#E67E22] mb-4" />
            <h3 className="text-xl font-bold text-[#6B3E1E] mb-2">Annuaire Panafricain</h3>
            <p className="text-stone-600">Découvrez et contactez les membres du réseau à travers le monde.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#6B3E1E]/5">
            <Briefcase className="w-10 h-10 text-[#E67E22] mb-4" />
            <h3 className="text-xl font-bold text-[#6B3E1E] mb-2">Opportunités & Marchés</h3>
            <p className="text-stone-600">Accédez à des appels d'offres et des partenariats exclusifs.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#6B3E1E]/5">
            <Network className="w-10 h-10 text-[#E67E22] mb-4" />
            <h3 className="text-xl font-bold text-[#6B3E1E] mb-2">Réseautage B2B</h3>
            <p className="text-stone-600">Participez à des rencontres virtuelles et développez vos affaires.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#6B3E1E]/5">
            <GraduationCap className="w-10 h-10 text-[#E67E22] mb-4" />
            <h3 className="text-xl font-bold text-[#6B3E1E] mb-2">Formations & Mentorat</h3>
            <p className="text-stone-600">Renforcez vos capacités avec nos programmes d'accompagnement.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/hub/inscription">
            <Button size="lg" className="w-full sm:w-auto bg-[#E67E22] hover:bg-[#c96a1a] text-white px-8 py-6 rounded-xl font-bold text-lg shadow-lg">
              Devenir membre
            </Button>
          </Link>
          <Link to="/hub/connexion">
            <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white border-2 border-[#6B3E1E]/20 text-[#6B3E1E] hover:bg-stone-50 px-8 py-6 rounded-xl font-bold text-lg">
              Se connecter
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
