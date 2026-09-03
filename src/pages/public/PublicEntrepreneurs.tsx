import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useLanguageStore } from '../../store/language';
import { ArrowRight, Star, Award, TrendingUp, Users } from 'lucide-react';
import { FafeImage } from '../../components/ui/FafeImage';
import { Button } from '../../components/ui/Button';

// Quick mock data for public showcase
const SHOWCASE_ENTREPRENEURS = [
  {
    id: '1',
    firstName: 'Fatou',
    lastName: 'Diop',
    company: 'AgriTech Sénégal',
    role: 'Fondatrice & CEO',
    country: 'Sénégal',
    image: 'https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?auto=format&fit=crop&q=80',
    storyFR: 'Révolutionne l\'irrigation grâce à l\'intelligence artificielle.',
    storyEN: 'Revolutionizing irrigation with artificial intelligence.',
  },
  {
    id: '2',
    firstName: 'Amaka',
    lastName: 'Okafor',
    company: 'GreenEnergy Solutions',
    role: 'CEO',
    country: 'Nigeria',
    image: 'https://images.unsplash.com/photo-1589156191108-c762ff4b96ab?auto=format&fit=crop&q=80',
    storyFR: 'Apporte l\'énergie solaire aux communautés rurales isolées.',
    storyEN: 'Bringing solar energy to isolated rural communities.',
  },
  {
    id: '3',
    firstName: 'Marie',
    lastName: 'Kouassi',
    company: 'Cocoa Beauty',
    role: 'Fondatrice',
    country: 'Côte d\'Ivoire',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80',
    storyFR: 'Valorise le beurre de cacao local à l\'international.',
    storyEN: 'Promoting local cocoa butter internationally.',
  },
];

export function PublicEntrepreneurs() {
  const { language } = useLanguageStore();

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="bg-[#FAF9F6] min-h-screen">
      {/* Hero */}
      <section className="pt-24 pb-20 lg:pt-32 lg:pb-32 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#E67E22] opacity-5 rounded-full blur-[100px] -mt-40 -mr-40" />
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 relative z-10 text-center max-w-4xl">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-[#6B3E1E] leading-tight mb-6">
              {language === 'fr' 
                ? 'Les Visages de la Réussite Africaine' 
                : 'The Faces of African Success'}
            </h1>
            <p className="text-lg text-stone-600 mb-10 leading-relaxed max-w-2xl mx-auto">
              {language === 'fr'
                ? 'Découvrez des femmes exceptionnelles qui transforment l\'économie du continent par leur vision, leur leadership et leur détermination.'
                : 'Discover exceptional women transforming the continent\'s economy through their vision, leadership, and determination.'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/hub/annuaire">
                <Button size="lg" className="bg-[#E67E22] hover:bg-[#c96a1a] text-white rounded-full px-8 py-6 font-bold shadow-lg">
                  {language === 'fr' ? 'Accéder à l\'Annuaire Complet (Hub)' : 'Access the Full Directory (Hub)'}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Showcase */}
      <section className="py-24 bg-[#FAF9F6]">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold font-heading text-[#6B3E1E] mb-4">
              {language === 'fr' ? 'Entrepreneures à la une' : 'Featured Entrepreneurs'}
            </h2>
            <div className="w-20 h-1 bg-[#D4AF37] mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {SHOWCASE_ENTREPRENEURS.map((ent, idx) => (
              <motion.div 
                key={ent.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: idx * 0.1 } }
                }}
                className="bg-white rounded-2xl overflow-hidden shadow-md group hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <FafeImage 
                    src={ent.image} 
                    alt={`${ent.firstName} ${ent.lastName}`} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="inline-block bg-[#D4AF37] text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                      {ent.country}
                    </div>
                    <h3 className="text-2xl font-bold font-heading text-white mb-1">
                      {ent.firstName} {ent.lastName}
                    </h3>
                    <p className="text-white/80 font-medium">
                      {ent.role}, {ent.company}
                    </p>
                  </div>
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <p className="text-stone-600 mb-6 italic line-clamp-3">
                    "{language === 'fr' ? ent.storyFR : ent.storyEN}"
                  </p>
                  <Link to="/hub/annuaire" className="mt-auto">
                    <Button variant="outline" className="w-full border-stone-200 text-[#6B3E1E] hover:border-[#E67E22] hover:text-[#E67E22] group-hover:bg-[#E67E22] group-hover:text-white transition-all">
                      {language === 'fr' ? 'Découvrir son profil complet' : 'View full profile'}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats/Impact */}
      <section className="py-24 bg-[#6B3E1E] text-white text-center">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 max-w-5xl">
          <h2 className="text-3xl font-bold font-heading mb-12">
            {language === 'fr' ? 'Un réseau en constante croissance' : 'A constantly growing network'}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 border border-white/10 rounded-2xl bg-white/5">
              <Users className="w-10 h-10 text-[#E67E22] mx-auto mb-4" />
              <div className="text-4xl font-bold font-heading text-[#D4AF37] mb-2">+5 000</div>
              <p className="text-white/80">{language === 'fr' ? 'Membres actifs' : 'Active members'}</p>
            </div>
            <div className="p-6 border border-white/10 rounded-2xl bg-white/5">
              <Globe className="w-10 h-10 text-[#E67E22] mx-auto mb-4" />
              <div className="text-4xl font-bold font-heading text-[#D4AF37] mb-2">54</div>
              <p className="text-white/80">{language === 'fr' ? 'Pays représentés' : 'Countries represented'}</p>
            </div>
            <div className="p-6 border border-white/10 rounded-2xl bg-white/5">
              <TrendingUp className="w-10 h-10 text-[#E67E22] mx-auto mb-4" />
              <div className="text-4xl font-bold font-heading text-[#D4AF37] mb-2">+120M</div>
              <p className="text-white/80">{language === 'fr' ? 'Chiffre d\'affaires cumulé ($)' : 'Cumulative revenue ($)'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA to Hub */}
      <section className="py-24 bg-white text-center">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 max-w-3xl">
          <h2 className="text-3xl font-bold font-heading text-[#6B3E1E] mb-6">
            {language === 'fr' 
              ? 'Rejoignez le mouvement ou trouvez votre partenaire d\'affaires' 
              : 'Join the movement or find your business partner'}
          </h2>
          <p className="text-lg text-stone-600 mb-10">
            {language === 'fr'
              ? 'L\'annuaire complet du FAFE, incluant la recherche par secteur, compétences et pays, est exclusivement disponible dans le FAFE Hub.'
              : 'The full FAFE directory, including search by sector, skills, and country, is exclusively available in the FAFE Hub.'}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/hub/annuaire">
              <Button size="lg" className="bg-[#6B3E1E] hover:bg-[#522d14] text-white rounded-full px-8 py-6 font-bold shadow-md">
                {language === 'fr' ? 'Accéder à l\'Annuaire (FAFE Hub)' : 'Access the Directory (FAFE Hub)'}
              </Button>
            </Link>
            <Link to="/rejoindre">
              <Button size="lg" variant="outline" className="border-stone-200 text-[#6B3E1E] hover:bg-stone-50 rounded-full px-8 py-6 font-bold">
                {language === 'fr' ? 'Devenir membre' : 'Become a member'}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// Just adding a simple Globe icon since we didn't import it above
function Globe(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}
