import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { ArrowRight, Globe2, Briefcase, TrendingUp, Calendar, Heart, MapPin } from 'lucide-react';
import { collection, getDocs, query, limit, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Entrepreneur, Article, Project } from '../types';
import { DEMO_ENTREPRENEURS, DEMO_ARTICLES, DEMO_PROJECTS } from '../lib/mockData';

export function Home() {
  const [entrepreneurs, setEntrepreneurs] = useState<Entrepreneur[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Fallbacks to mock data if Firestore is empty
  useEffect(() => {
    const fetchData = async () => {
      try {
        const entQuery = query(collection(db, 'users'), limit(4));
        const entSnap = await getDocs(entQuery);
        let fetchedEnt = entSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Entrepreneur));
        if (fetchedEnt.length === 0) fetchedEnt = DEMO_ENTREPRENEURS.slice(0, 4);
        setEntrepreneurs(fetchedEnt);

        // Simulated fetch for articles and projects if they existed in DB
        // Falling back to DEMO data as they are placeholders for this version
        setArticles(DEMO_ARTICLES);
        setProjects(DEMO_PROJECTS);
      } catch (error) {
        console.error("Error fetching data:", error);
        setEntrepreneurs(DEMO_ENTREPRENEURS.slice(0, 4));
        setArticles(DEMO_ARTICLES);
        setProjects(DEMO_PROJECTS);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { label: "Femmes entrepreneures", value: "2,500+" },
    { label: "Pays représentés", value: "15" },
    { label: "Entreprises accompagnées", value: "850" },
    { label: "Projets soutenus", value: "120" },
  ];

  const partners = [1, 2, 3, 4, 5, 6];
  const countries = ['Sénégal', 'Côte d\'Ivoire', 'Nigeria', 'Mali', 'Cameroun', 'Kenya', 'Maroc', 'Rwanda'];

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F6]">
      
      {/* 1. HERO SECTION */}
      <section className="relative bg-[#FAF9F6] pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#E67E22]/5 rounded-bl-[120px] -z-10"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#D4AF37]/5 rounded-tr-[120px] -z-10"></div>
        
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            
            {/* Left Content */}
            <div className="w-full lg:w-1/2 space-y-8">
              <div className="inline-block px-4 py-2 bg-[#E67E22]/10 border border-[#E67E22]/20 rounded-full">
                <span className="text-[#E67E22] font-bold text-xs uppercase tracking-widest">Forum Africain des Femmes Entrepreneures</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-[#6B3E1E] leading-tight">
                Ensemble, faisons grandir l'entrepreneuriat <span className="text-[#E67E22]">féminin africain.</span>
              </h1>
              
              <p className="text-lg md:text-xl text-[#6B3E1E]/80 max-w-xl leading-relaxed">
                Le FAFE connecte, accompagne et valorise les femmes entrepreneures pour construire une Afrique plus inclusive, innovante et prospère.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                <Link to="/inscription" className="w-full sm:w-auto">
                  <Button className="w-full bg-[#E67E22] hover:bg-[#c96a1a] text-white px-8 py-6 rounded-full font-bold shadow-lg hover:shadow-xl transition-all">
                    Rejoindre le FAFE
                  </Button>
                </Link>
                <Link to="/entrepreneures" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full border-[#6B3E1E]/20 text-[#6B3E1E] hover:bg-[#6B3E1E]/5 px-8 py-6 rounded-full font-bold transition-all">
                    Découvrir notre réseau
                  </Button>
                </Link>
              </div>
              <div className="pt-2">
                <Link to="/dons" className="inline-flex items-center text-[#D4AF37] font-bold text-sm hover:text-[#E67E22] transition-colors group">
                  Soutenir le FAFE 
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right Image Composition */}
            <div className="w-full lg:w-1/2 relative">
              <div className="relative z-10 rounded-2xl md:rounded-[40px] overflow-hidden shadow-2xl border-4 border-white">
                <img 
                  src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1000&auto=format&fit=crop" 
                  alt="Femmes entrepreneures africaines collaborant" 
                  className="w-full h-[400px] lg:h-[600px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#6B3E1E]/60 to-transparent"></div>
              </div>
              
              {/* Subtle graphic elements */}
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-[#E67E22] rounded-full mix-blend-multiply opacity-20 blur-2xl"></div>
              <div className="absolute -top-8 -right-8 w-40 h-40 bg-[#D4AF37] rounded-full mix-blend-multiply opacity-20 blur-2xl"></div>
              
              <div className="absolute bottom-8 -left-4 md:-left-12 z-20 bg-white p-4 rounded-xl shadow-xl border border-[#6B3E1E]/5 flex items-center gap-4">
                <div className="w-12 h-12 bg-[#E67E22]/10 rounded-full flex items-center justify-center text-[#E67E22]">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#6B3E1E]/60 uppercase tracking-wider mb-0.5">Impact 2024</p>
                  <p className="text-lg font-bold text-[#6B3E1E]">+40% de croissance</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. STATISTICS SECTION */}
      <section className="py-12 bg-white border-y border-[#6B3E1E]/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 divide-x-0 lg:divide-x divide-[#6B3E1E]/10">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center px-4">
                <h3 className="text-4xl md:text-5xl font-bold font-heading text-[#6B3E1E] mb-2">{stat.value}</h3>
                <p className="text-sm font-bold text-[#D4AF37] uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. ABOUT SECTION */}
      <section className="py-24 bg-[#FAF9F6]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="w-full lg:w-1/2">
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop" 
                  alt="Équipe FAFE en réunion" 
                  className="w-full h-[500px] object-cover"
                />
              </div>
            </div>
            
            <div className="w-full lg:w-1/2 space-y-8">
              <h2 className="text-sm font-bold tracking-widest text-[#E67E22] uppercase">Notre Mission</h2>
              <h3 className="text-3xl md:text-4xl font-bold font-heading text-[#6B3E1E] leading-tight">
                Une force collective au service de l'entrepreneuriat féminin africain
              </h3>
              <p className="text-lg text-[#6B3E1E]/80 leading-relaxed">
                Le Forum Africain des Femmes Entrepreneures est né d'une conviction profonde : l'avenir économique de l'Afrique repose sur le potentiel d'innovation et de résilience de ses femmes. Nous fédérons les talents, facilitons l'accès aux financements et offrons un accompagnement d'excellence.
              </p>
              
              <div className="grid sm:grid-cols-3 gap-6 pt-6 border-t border-[#6B3E1E]/10">
                <div>
                  <h4 className="text-xl font-bold font-heading text-[#6B3E1E] mb-2 text-[#D4AF37]">Leadership</h4>
                  <p className="text-sm text-[#6B3E1E]/70">Inspirer et former la prochaine génération de dirigeantes.</p>
                </div>
                <div>
                  <h4 className="text-xl font-bold font-heading text-[#6B3E1E] mb-2 text-[#D4AF37]">Solidarité</h4>
                  <p className="text-sm text-[#6B3E1E]/70">Bâtir un réseau d'entraide panafricain puissant.</p>
                </div>
                <div>
                  <h4 className="text-xl font-bold font-heading text-[#6B3E1E] mb-2 text-[#D4AF37]">Excellence</h4>
                  <p className="text-sm text-[#6B3E1E]/70">Viser les plus hauts standards de qualité et d'impact.</p>
                </div>
              </div>
              
              <div className="pt-4">
                <Link to="/about" className="inline-flex items-center text-[#E67E22] font-bold hover:text-[#c96a1a] transition-colors group text-lg">
                  Découvrir le FAFE
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURED ENTREPRENEURS */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-sm font-bold tracking-widest text-[#D4AF37] uppercase mb-3">Réseau d'Excellence</h2>
              <h3 className="text-3xl md:text-4xl font-bold font-heading text-[#6B3E1E] mb-4">Elles entreprennent. Elles transforment. Elles inspirent.</h3>
              <p className="text-lg text-[#6B3E1E]/70">Découvrez les femmes qui font avancer l'économie africaine.</p>
            </div>
            <Link to="/entrepreneures">
              <Button variant="outline" className="group border-[#6B3E1E]/20 text-[#6B3E1E] hover:bg-[#6B3E1E]/5 rounded-full px-6">
                Explorer tout l'annuaire
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              <div className="col-span-4 text-center py-12 text-[#6B3E1E]/50 font-medium">Chargement des profils...</div>
            ) : entrepreneurs.map((ent) => (
              <div key={ent.id} className="group cursor-pointer">
                <div className="w-full aspect-[4/5] bg-stone-100 rounded-2xl mb-6 overflow-hidden relative shadow-sm group-hover:shadow-xl transition-all duration-500">
                  <img 
                    src={ent.professionalPhoto || "https://images.unsplash.com/photo-1531123414708-5369786a5f54?q=80&w=600&auto=format&fit=crop"} 
                    alt={`${ent.firstName} ${ent.lastName}`} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                    <Link to={`/entrepreneures/${ent.id}`} className="w-full">
                      <Button className="w-full bg-white text-[#6B3E1E] hover:bg-white/90">
                        Voir le profil
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="px-2">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-3 h-3 text-[#E67E22]" />
                    <span className="text-[10px] font-bold text-[#E67E22] uppercase tracking-widest">{ent.country}</span>
                  </div>
                  <h4 className="font-bold text-xl text-[#6B3E1E] mb-1">
                    {ent.firstName} {ent.lastName}
                  </h4>
                  <p className="text-sm text-[#6B3E1E]/70 mb-2 font-medium">
                    {ent.position || 'Fondatrice'}, {ent.company}
                  </p>
                  <span className="inline-block px-3 py-1 bg-[#FAF9F6] border border-[#6B3E1E]/10 rounded-full text-[10px] font-bold text-[#6B3E1E] uppercase tracking-wider">
                    {ent.sector}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. AFRICA NETWORK SECTION */}
      <section className="py-24 bg-[#6B3E1E] relative overflow-hidden">
        {/* Subtle decorative Africa Map representation using CSS shapes/svg */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[600px] opacity-[0.03] pointer-events-none">
           <svg viewBox="0 0 400 400" fill="currentColor" className="w-full h-full text-white">
             <path d="M120,80 C150,50 200,40 250,70 C280,90 320,120 340,180 C350,220 330,280 290,320 C250,360 200,380 160,350 C120,320 80,260 90,200 C100,150 90,110 120,80 Z" />
           </svg>
        </div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Globe2 className="w-12 h-12 text-[#D4AF37] mx-auto mb-6 opacity-90" />
            <h2 className="text-sm font-bold tracking-widest text-[#D4AF37] uppercase mb-3">Présence Continentale</h2>
            <h3 className="text-3xl md:text-5xl font-bold font-heading text-white mb-6">Un réseau qui traverse les frontières</h3>
            <p className="text-lg text-white/80 leading-relaxed">
              Sélectionnez un pays pour découvrir les talents et les entreprises qui transforment les économies locales et régionales.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            {countries.map(country => (
              <Link key={country} to={`/entrepreneures?country=${encodeURIComponent(country)}`}>
                <button className="px-6 py-3 bg-white/5 hover:bg-[#E67E22] border border-white/10 hover:border-[#E67E22] rounded-full text-sm font-medium text-white transition-all duration-300 flex items-center gap-2 group">
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37] group-hover:bg-white transition-colors"></span>
                  {country}
                </button>
              </Link>
            ))}
            <Link to="/pays">
              <button className="px-6 py-3 text-[#D4AF37] font-bold text-sm hover:text-white transition-colors">
                Explorer tous les pays →
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* 6. IMPACT SECTION (Projects) */}
      <section className="py-24 bg-[#FAF9F6]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-sm font-bold tracking-widest text-[#E67E22] uppercase mb-3">Impact & Développement</h2>
            <h3 className="text-3xl md:text-4xl font-bold font-heading text-[#6B3E1E]">Transformer l'entrepreneuriat en impact</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {projects.map((project) => (
              <Card key={project.id} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow bg-white rounded-2xl group flex flex-col">
                <div className="flex flex-col sm:flex-row h-full">
                  <div className="sm:w-2/5 h-64 sm:h-auto relative overflow-hidden shrink-0">
                    <img 
                      src={project.image} 
                      alt={project.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-[#E67E22] uppercase tracking-widest shadow-sm">
                        {project.country}
                      </span>
                    </div>
                  </div>
                  <CardContent className="sm:w-3/5 p-8 flex flex-col justify-center flex-grow">
                    <div className="flex items-center gap-2 mb-3 text-xs font-bold text-[#00843D] uppercase tracking-wider">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00843D]"></div>
                      En cours
                    </div>
                    <h4 className="text-2xl font-bold font-heading text-[#6B3E1E] mb-4 leading-tight">{project.title}</h4>
                    <p className="text-sm text-[#6B3E1E]/70 mb-6 leading-relaxed line-clamp-3">
                      {project.description}
                    </p>
                    <Link to={`/projets/${project.id}`} className="mt-auto">
                      <Button variant="outline" className="border-[#D4AF37]/50 text-[#6B3E1E] hover:bg-[#D4AF37] hover:text-white hover:border-[#D4AF37] transition-all rounded-full px-6 w-full sm:w-auto">
                        Découvrir le projet
                      </Button>
                    </Link>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 7. NEWS SECTION */}
      <section className="py-24 bg-white border-t border-[#6B3E1E]/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-sm font-bold tracking-widest text-[#D4AF37] uppercase mb-3">Éditorial</h2>
              <h3 className="text-3xl md:text-4xl font-bold font-heading text-[#6B3E1E]">Actualités & inspirations</h3>
            </div>
            <Link to="/actualites">
              <Button variant="outline" className="group border-[#6B3E1E]/20 text-[#6B3E1E] hover:bg-[#6B3E1E]/5 rounded-full px-6">
                Toutes les actualités
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <article key={article.id} className="group cursor-pointer flex flex-col h-full">
                <div className="w-full aspect-[16/10] overflow-hidden rounded-2xl mb-6 relative">
                  <img 
                    src={article.featuredImage} 
                    alt={article.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4">
                    {article.categories.map(cat => (
                      <span key={cat} className="bg-[#6B3E1E]/90 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full mr-2">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs font-medium text-[#6B3E1E]/50 mb-4 uppercase tracking-wider">
                  <Calendar className="w-4 h-4" />
                  {new Date(article.publicationDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <h4 className="text-2xl font-bold font-heading text-[#6B3E1E] mb-4 leading-snug group-hover:text-[#E67E22] transition-colors">
                  {article.title}
                </h4>
                <p className="text-[#6B3E1E]/70 mb-6 flex-grow leading-relaxed">
                  {article.excerpt}
                </p>
                <div className="mt-auto pt-6 border-t border-[#6B3E1E]/10">
                  <Link to={`/actualites/${article.id}`} className="inline-flex items-center text-[#6B3E1E] font-bold text-sm group-hover:text-[#E67E22] transition-colors">
                    Lire l'article <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 8. DONATION CTA */}
      <section className="py-32 bg-[#522d14] relative overflow-hidden">
        {/* Subtle background effects */}
        <div className="absolute top-0 right-0 -mt-32 -mr-32 w-[500px] h-[500px] bg-[#E67E22] opacity-10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 -mb-32 -ml-32 w-[400px] h-[400px] bg-[#D4AF37] opacity-10 rounded-full blur-[80px]"></div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center max-w-4xl">
          <Heart className="w-16 h-16 text-[#D4AF37] mx-auto mb-8" />
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-white mb-8 leading-tight">
            Votre soutien peut ouvrir de <span className="text-[#D4AF37]">nouvelles opportunités.</span>
          </h2>
          <p className="text-white/80 text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            Chaque contribution participe au développement de l'entrepreneuriat féminin africain en finançant des formations et des projets innovants.
          </p>
          <Link to="/dons">
            <Button size="lg" className="bg-[#E67E22] hover:bg-[#c96a1a] text-white shadow-2xl px-12 py-6 rounded-full font-bold text-lg hover:scale-105 transition-transform duration-300">
              Faire un don
            </Button>
          </Link>
        </div>
      </section>

      {/* 9. PARTNERS */}
      <section className="py-20 bg-white border-t border-[#6B3E1E]/10">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-xs font-bold text-[#6B3E1E]/40 uppercase tracking-widest mb-12">Nos partenaires institutionnels</h2>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            {partners.map(p => (
              <div key={p} className="h-12 flex items-center font-heading font-bold text-2xl text-[#6B3E1E]">
                LOGO {p}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
