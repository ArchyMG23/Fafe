import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import {
  collection,
  query,
  where,
  getDocs,
  limit,
  orderBy,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { Entrepreneur, Article, Project } from "../types";
import { useLanguageStore } from "../store/language";
import { getCMSGlobal, defaultHeroSlides } from "../lib/cms";
import { fetchEntrepreneurs, fetchProjects, fetchArticles, fetchEvents } from "../lib/dataFetching";
import { CMSHeroSlide } from "../types";
import {
  ArrowRight,
  Globe2,
  Briefcase,
  TrendingUp,
  Calendar,
  Heart,
  MapPin,
  Play
} from "lucide-react";
import { FafeImage } from '../components/ui/FafeImage';
import {
  DEMO_ENTREPRENEURS,
  DEMO_ARTICLES,
  DEMO_PROJECTS,
} from "../lib/mockData";

function DynamicHeroSection() {
  const [heroText, setHeroText] = useState<any>(null);
  const [entrepreneurs, setEntrepreneurs] = useState<Entrepreneur[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { language, tl } = useLanguageStore();

  useEffect(() => {
    const loadData = async () => {
      // 1. Load CMS for the institutional text (left column)
      const data = await getCMSGlobal();
      if (data && data.heroSlides && data.heroSlides.length > 0) {
        setHeroText(data.heroSlides[0]); // Take the first slide text
      } else {
        setHeroText(defaultHeroSlides[0]);
      }

      // 2. Load entrepreneurs for the carousel (right column)
      let ents = await fetchEntrepreneurs(10, true);
      if (ents.length === 0) {
        ents = await fetchEntrepreneurs(10); // fallback if no featured
      }
      if (ents.length === 0) {
        ents = DEMO_ENTREPRENEURS.slice(0, 5);
      }
      
      // Optionally randomize the starting index to avoid same person on every refresh
      const startIndex = Math.floor(Math.random() * ents.length);
      
      setEntrepreneurs(ents);
      setCurrentIndex(startIndex);
    };
    loadData();
  }, []);

  // Handle visibility pause
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPaused(true);
      } else {
        setIsPaused(false);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (isPaused || entrepreneurs.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % entrepreneurs.length);
    }, 25000); // 25 seconds
    return () => clearInterval(interval);
  }, [entrepreneurs.length, isPaused, currentIndex]);

  // Preload next image
  useEffect(() => {
    if (entrepreneurs.length > 1) {
      const nextIndex = (currentIndex + 1) % entrepreneurs.length;
      const img = new Image();
      img.src = entrepreneurs[nextIndex].professionalPhoto;
    }
  }, [currentIndex, entrepreneurs]);

  if (entrepreneurs.length === 0 || !heroText) return null;

  const currentEnt = entrepreneurs[currentIndex];

  return (
    <section
      className="relative pt-12 pb-16 lg:pt-16 lg:pb-24 overflow-hidden bg-[#FAF9F6]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[60%] rounded-full bg-[#E67E22] opacity-5 blur-[100px] transition-all duration-1000"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[50%] rounded-full bg-[#D4AF37] opacity-10 blur-[80px] transition-all duration-1000"></div>
      </div>
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left Column: Text content */}
          <div className="max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E67E22]/20 text-[#E67E22] text-sm font-bold tracking-wide uppercase mb-8 shadow-sm">
              <Globe2 className="w-4 h-4" />
              {language === "fr" ? "Réseau Panafricain" : "Pan-African Network"}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold font-heading text-[#6B3E1E] leading-tight mb-6 animate-fade-in-up">
              {tl(heroText.title)}
            </h1>

            <p className="text-base md:text-lg lg:text-xl text-stone-600 mb-10 leading-relaxed animate-fade-in-up animation-delay-100">
              {tl(heroText.shortText)}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-fade-in-up animation-delay-200">
              <Link to={heroText.link || "/hub/inscription"}>
                <Button
                  size="lg"
                  className="bg-[#E67E22] hover:bg-[#c96a1a] text-white rounded-full px-8 py-6 font-bold text-lg shadow-lg shadow-[#E67E22]/20 hover:scale-105 transition-all"
                >
                  {tl(heroText.buttonText)}
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: Image with Superimposed Card */}
          <div
            className="relative mx-auto max-w-md lg:max-w-md xl:max-w-[450px] w-full transition-opacity duration-1000"
            key={`img-${currentIndex}`}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-[#E67E22] to-[#D4AF37] rounded-full blur-2xl opacity-20 animate-pulse"></div>
            
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-[4/5]">
              <FafeImage                 src={currentEnt.professionalPhoto}
                alt={`${currentEnt.firstName} ${currentEnt.lastName}`}
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000"
              />

              {/* Gradient Overlay for legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

              {/* Superimposed Card directly ON the photo */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-xl transform transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-[#E67E22] animate-pulse"></div>
                  <span className="text-xs font-bold text-[#E67E22] tracking-wider uppercase">À LA UNE</span>
                </div>
                <h3 className="text-xl font-bold text-[#6B3E1E] mb-1">
                  {currentEnt.firstName} {currentEnt.lastName}
                </h3>
                <p className="text-sm font-medium text-stone-600 mb-1">
                  {currentEnt.company} • {currentEnt.sector}
                </p>
                <div className="flex items-center gap-1 text-sm text-stone-500 mb-4">
                  <MapPin className="w-4 h-4" />
                  {currentEnt.country}
                </div>
                
                <Link to={`/hub/annuaire/${currentEnt.id}`} className="inline-flex items-center text-sm font-bold text-[#E67E22] hover:text-[#c96a1a] transition-colors group">
                  Découvrir son profil 
                  <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Pagination Dots */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
              {entrepreneurs.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "bg-[#E67E22] w-8"
                      : "bg-[#6B3E1E]/20 hover:bg-[#6B3E1E]/40"
                  }`}
                  aria-label={`Voir entrepreneure ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DynamicNews() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticlesFn = async () => {
      setLoading(true);
      const data = await fetchArticles(3);
      setArticles(data);
      setLoading(false);
    };
    fetchArticlesFn();
  }, []);

  if (loading)
    return (
      <div className="text-center py-20">
        <div className="w-8 h-8 border-4 border-[#E67E22] border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );

  if (articles.length === 0)
    return (
      <div className="text-center text-stone-500 py-12">
        <p>Aucune actualité publiée pour le moment.</p>
      </div>
    );

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {articles.map((article) => (
        <Link
          key={article.id}
          to={`/actualites/${article.slug}`}
          className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group"
        >
          <div className="h-48 overflow-hidden bg-stone-100 relative">
            {article.featuredImage ? (
              <FafeImage                 src={article.featuredImage}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-300">
                Sans image
              </div>
            )}
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold font-heading text-[#6B3E1E] mb-3 group-hover:text-[#E67E22] transition-colors line-clamp-2">
              {article.title}
            </h3>
            <p className="text-stone-600 mb-4 line-clamp-2 text-sm">
              {article.excerpt}
            </p>
            <span className="text-[#E67E22] font-bold text-sm flex items-center group-hover:gap-2 transition-all">
              Lire l'article <ArrowRight className="w-4 h-4 ml-1" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}


function DynamicEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventsFn = async () => {
      setLoading(true);
      const data = await fetchEvents(3);
      setEvents(data);
      setLoading(false);
    };
    fetchEventsFn();
  }, []);

  if (loading)
    return (
      <div className="text-center py-20">
        <div className="w-8 h-8 border-4 border-[#E67E22] border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );

  if (events.length === 0)
    return (
      <div className="text-center text-stone-500 py-12">
        <p>Aucun événement programmé pour le moment.</p>
      </div>
    );

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {events.map((event) => (
        <Card key={event.id} className="overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer h-full flex flex-col">
          <div className="relative h-48 overflow-hidden shrink-0">
            <FafeImage 
              src={event.coverImage || "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"} 
              alt={event.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            />
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-2 rounded-lg text-center shadow-md">
              <div className="text-[#E67E22] font-bold text-xl leading-none">
                {new Date(event.startDate).getDate()}
              </div>
              <div className="text-[#6B3E1E] text-xs font-bold uppercase mt-1">
                {new Date(event.startDate).toLocaleString('fr-FR', { month: 'short' })}
              </div>
            </div>
            {event.online && (
              <div className="absolute top-4 right-4 bg-[#E67E22] text-white px-2 py-1 rounded text-xs font-bold">
                En ligne
              </div>
            )}
          </div>
          <CardContent className="p-6 flex flex-col flex-grow">
            <h3 className="font-bold font-heading text-xl text-[#6B3E1E] mb-2 group-hover:text-[#E67E22] transition-colors line-clamp-2">
              {event.title}
            </h3>
            <div className="flex items-center gap-2 text-stone-500 text-sm mb-4">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{event.online ? "Événement virtuel" : `${event.city}, ${event.country}`}</span>
            </div>
            <p className="text-stone-600 text-sm line-clamp-3 mb-6 flex-grow">
              {event.shortDescription || event.description}
            </p>
            <Link to={`/evenements/${event.slug}`} className="mt-auto block">
              <Button variant="outline" className="w-full border-[#6B3E1E]/20 text-[#6B3E1E] hover:bg-[#6B3E1E] hover:text-white transition-all rounded-full">
                Voir l'événement
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function Home() {
  const [entrepreneurs, setEntrepreneurs] = useState<Entrepreneur[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  
  useEffect(() => {
    const fetchHomeData = async () => {
      const ent = await fetchEntrepreneurs(4, true);
      setEntrepreneurs(ent);
      const proj = await fetchProjects(2);
      setProjects(proj);
    };
    fetchHomeData();
  }, []);

  const stats = [
    {
      value: "5K+",
      label: "Femmes accompagnées",
      icon: <Heart className="w-6 h-6 text-[#E67E22]" />,
    },
    {
      value: "15+",
      label: "Pays africains",
      icon: <Globe2 className="w-6 h-6 text-[#E67E22]" />,
    },
    {
      value: "200+",
      label: "Projets financés",
      icon: <Briefcase className="w-6 h-6 text-[#E67E22]" />,
    },
    {
      value: "85%",
      label: "Taux de réussite",
      icon: <TrendingUp className="w-6 h-6 text-[#E67E22]" />,
    },
  ];

  const partners = ["ONU Femmes", "BAD", "AFD", "Union Européenne", "OIF"];
  const countries = [
    "Sénégal",
    "Côte d'Ivoire",
    "Mali",
    "Cameroun",
    "RDC",
    "Maroc",
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <DynamicHeroSection />

      {/* 2. STATISTICS SECTION */}
      <section className="py-12 bg-white border-y border-[#6B3E1E]/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 mx-auto bg-[#FAF9F6] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>
                <div className="text-4xl font-bold font-heading text-[#6B3E1E] mb-2">
                  {stat.value}
                </div>
                <div className="text-sm font-bold text-stone-500 uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. MISSIONS SECTION */}
      <section className="py-24 bg-[#FAF9F6]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-sm font-bold tracking-widest text-[#E67E22] uppercase mb-3">
              Notre Vocation
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold font-heading text-[#6B3E1E]">
              Trois piliers pour la réussite de vos projets
            </h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Financement",
                desc: "Accès facilité aux fonds d'investissement, subventions et prêts à taux préférentiels pour développer votre activité.",
                icon: "💰",
              },
              {
                title: "Formation & Mentorat",
                desc: "Programmes de renforcement de capacités et accompagnement personnalisé par des experts et leaders du marché.",
                icon: "🎓",
              },
              {
                title: "Réseautage",
                desc: "Intégration à un écosystème puissant pour trouver des partenaires, des clients et des opportunités d'affaires.",
                icon: "🤝",
              },
            ].map((mission, idx) => (
              <Card
                key={idx}
                className="bg-white border-0 shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group"
              >
                <CardContent className="p-8 text-center">
                  <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform">
                    {mission.icon}
                  </div>
                  <h4 className="text-xl font-bold font-heading text-[#6B3E1E] mb-4">
                    {mission.title}
                  </h4>
                  <p className="text-stone-600 leading-relaxed">
                    {mission.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 4. ENTREPRENEURS HIGHLIGHT */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-sm font-bold tracking-widest text-[#E67E22] uppercase mb-3">
                Annuaire
              </h2>
              <h3 className="text-3xl md:text-4xl font-bold font-heading text-[#6B3E1E]">
                Découvrez les talents du réseau
              </h3>
            </div>
            <Link to="/entrepreneures">
              <Button
                variant="outline"
                className="group border-[#6B3E1E]/20 text-[#6B3E1E] hover:bg-[#6B3E1E]/5 rounded-full px-6"
              >
                Voir l'annuaire complet
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {entrepreneurs.map((ent) => (
              <Link key={ent.id} to={`/hub/annuaire/${ent.id}`}>
                <Card className="border border-[#6B3E1E]/10 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group cursor-pointer bg-[#FAF9F6] h-full flex flex-col">
                  <div className="relative h-48 overflow-hidden bg-[#6B3E1E]/5">
                    {ent.professionalPhoto ? (
                      <FafeImage                         src={ent.professionalPhoto}
                        alt={`${ent.firstName} ${ent.lastName}`}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#6B3E1E]/20 font-heading text-4xl">
                        {ent.firstName[0]}
                        {ent.lastName[0]}
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-[#6B3E1E]/80 to-transparent">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[10px] font-bold text-[#6B3E1E] uppercase tracking-wider">
                        <MapPin className="w-3 h-3" /> {ent.country}
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-6 flex flex-col flex-grow">
                    <h4 className="text-lg font-bold font-heading text-[#6B3E1E] mb-1 group-hover:text-[#E67E22] transition-colors">
                      {ent.firstName} {ent.lastName}
                    </h4>
                    <p className="text-sm font-bold text-[#D4AF37] mb-3">
                      {ent.company}
                    </p>
                    <p className="text-xs text-[#6B3E1E]/70 line-clamp-2 mt-auto">
                      {ent.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. COUNTRIES MAP PLACEHOLDER */}
      <section className="py-24 bg-[#6B3E1E] text-white relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-12">
            Un réseau présent dans toute l'Afrique
          </h2>

          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            {countries.map((country) => (
              <Link key={country} to={`/pays/${country.toLowerCase()}`}>
                <button className="px-6 py-3 rounded-full border border-white/20 bg-white/5 hover:bg-white hover:text-[#6B3E1E] font-bold transition-all flex items-center gap-2 group">
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
            <h2 className="text-sm font-bold tracking-widest text-[#E67E22] uppercase mb-3">
              Impact & Développement
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold font-heading text-[#6B3E1E]">
              Transformer l'entrepreneuriat en impact
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow bg-white rounded-2xl group flex flex-col"
              >
                <div className="flex flex-col sm:flex-row h-full">
                  <div className="sm:w-2/5 h-64 sm:h-auto relative overflow-hidden shrink-0">
                    <FafeImage                       src={project.image}
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
                    <h4 className="text-2xl font-bold font-heading text-[#6B3E1E] mb-4 leading-tight">
                      {project.title}
                    </h4>
                    <p className="text-sm text-[#6B3E1E]/70 mb-6 leading-relaxed line-clamp-3">
                      {project.description}
                    </p>
                    <Link to={`/projets-sociaux/${project.id}`} className="mt-auto">
                      <Button
                        variant="outline"
                        className="border-[#D4AF37]/50 text-[#6B3E1E] hover:bg-[#D4AF37] hover:text-white hover:border-[#D4AF37] transition-all rounded-full px-6 w-full sm:w-auto"
                      >
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

      
      {/* EVENTS SECTION */}
      <section className="py-24 bg-[#FAF9F6] border-t border-[#6B3E1E]/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-sm font-bold tracking-widest text-[#E67E22] uppercase mb-3">Agenda</h2>
              <h3 className="text-3xl md:text-4xl font-bold font-heading text-[#6B3E1E]">Nos prochains événements</h3>
            </div>
            <Link to="/evenements">
              <Button variant="outline" className="group border-[#6B3E1E]/20 text-[#6B3E1E] hover:bg-[#6B3E1E]/5 rounded-full px-6">
                Voir l'agenda
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          <DynamicEvents />
        </div>
      </section>

      {/* 7. NEWS SECTION */}
      <section className="py-24 bg-white border-t border-[#6B3E1E]/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-sm font-bold tracking-widest text-[#D4AF37] uppercase mb-3">
                Éditorial
              </h2>
              <h3 className="text-3xl md:text-4xl font-bold font-heading text-[#6B3E1E]">
                Actualités & inspirations
              </h3>
            </div>
            <Link to="/actualites">
              <Button
                variant="outline"
                className="group border-[#6B3E1E]/20 text-[#6B3E1E] hover:bg-[#6B3E1E]/5 rounded-full px-6"
              >
                Toutes les actualités
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <DynamicNews />
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
            Votre soutien peut ouvrir de{" "}
            <span className="text-[#D4AF37]">nouvelles opportunités.</span>
          </h2>
          <p className="text-white/80 text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            Chaque contribution participe au développement de l'entrepreneuriat
            féminin africain en finançant des formations et des projets
            innovants.
          </p>
          <Link to="/dons">
            <Button
              size="lg"
              className="bg-[#E67E22] hover:bg-[#c96a1a] text-white shadow-2xl px-12 py-6 rounded-full font-bold text-lg hover:scale-105 transition-transform duration-300"
            >
              Faire un don
            </Button>
          </Link>
        </div>
      </section>

      {/* 9. PARTNERS */}
      <section className="py-20 bg-white border-t border-[#6B3E1E]/10">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-xs font-bold text-[#6B3E1E]/40 uppercase tracking-widest mb-12">
            Nos partenaires institutionnels
          </h2>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            {partners.map((p) => (
              <div
                key={p}
                className="h-12 flex items-center font-heading font-bold text-2xl text-[#6B3E1E]"
              >
                LOGO {p}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
