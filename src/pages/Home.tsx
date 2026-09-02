import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Entrepreneur, Article, Project } from "../types";
import { useLanguageStore } from "../store/language";
import { getCMSGlobal, defaultHeroSlides } from "../lib/cms";
import { fetchEntrepreneurs, fetchProjects, fetchArticles, fetchEvents } from "../lib/dataFetching";
import {
  ArrowRight,
  Globe2,
  Briefcase,
  TrendingUp,
  Heart,
  MapPin,
  Calendar,
  Sparkles,
  Award,
  ChevronRight
} from "lucide-react";
import { FafeImage } from "../components/ui/FafeImage";
import { AnimatedCounter } from "../components/ui/AnimatedCounter";
import {
  DEMO_ENTREPRENEURS,
  DEMO_ARTICLES,
  DEMO_PROJECTS,
} from "../lib/mockData";

function DynamicHeroSection() {
  // Initialize immediately with solid default data so the Hero is NEVER null
  const [heroText, setHeroText] = useState<any>(defaultHeroSlides[0]);
  const [entrepreneurs, setEntrepreneurs] = useState<Entrepreneur[]>(DEMO_ENTREPRENEURS);
  const [currentIndex, setCurrentIndex] = useState(() => Math.floor(Math.random() * DEMO_ENTREPRENEURS.length));
  const [isPaused, setIsPaused] = useState(false);
  const { language, tl } = useLanguageStore();

  useEffect(() => {
    let isMounted = true;
    const loadBackgroundData = async () => {
      try {
        // 1. Fetch CMS text asynchronously
        const data = await getCMSGlobal();
        if (isMounted && data && data.heroSlides && data.heroSlides.length > 0) {
          setHeroText(data.heroSlides[0]);
        }

        // 2. Fetch fresh entrepreneurs asynchronously
        let ents = await fetchEntrepreneurs(10, true);
        if (ents.length === 0) {
          ents = await fetchEntrepreneurs(10);
        }
        if (isMounted && ents.length > 0) {
          setEntrepreneurs(ents);
        }
      } catch (err) {
        console.warn("Background Hero sync notice:", err);
      }
    };
    loadBackgroundData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle visibility pause to avoid tab lag
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPaused(document.hidden);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // 25-second auto-rotation
  useEffect(() => {
    if (isPaused || entrepreneurs.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % entrepreneurs.length);
    }, 25000);
    return () => clearInterval(interval);
  }, [entrepreneurs.length, isPaused, currentIndex]);

  const currentEnt = entrepreneurs[currentIndex] || DEMO_ENTREPRENEURS[0];

  return (
    <section
      className="relative pt-8 pb-12 md:pt-14 md:pb-20 lg:pt-16 lg:pb-24 overflow-hidden bg-[#FAF9F6]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Decorative ambient gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[60%] md:w-[45%] h-[50%] rounded-full bg-[#E67E22] opacity-8 blur-[90px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[50%] md:w-[35%] h-[45%] rounded-full bg-[#D4AF37] opacity-10 blur-[80px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Institutional Pitch */}
          <div className="max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E67E22]/20 text-[#E67E22] text-xs md:text-sm font-bold tracking-wide uppercase mb-6 shadow-sm">
              <Globe2 className="w-4 h-4 text-[#E67E22]" />
              {language === "fr" ? "Réseau Panafricain" : "Pan-African Network"}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold font-heading text-[#6B3E1E] leading-[1.15] mb-5 tracking-tight">
              {tl(heroText.title)}
            </h1>

            <p className="text-base sm:text-lg text-stone-600 mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0">
              {tl(heroText.shortText)}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
              <Link to={heroText.link || "/rejoindre"} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-[#E67E22] hover:bg-[#c96a1a] text-white rounded-full px-8 py-5 font-bold text-base shadow-lg shadow-[#E67E22]/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {tl(heroText.buttonText) || "Rejoindre le réseau"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/nous" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto border-[#6B3E1E]/20 text-[#6B3E1E] hover:bg-[#6B3E1E]/5 rounded-full px-6 py-5 font-semibold text-base"
                >
                  Découvrir le FAFE
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: Superimposed Card on Photo */}
          <div className="relative mx-auto max-w-sm sm:max-w-md lg:max-w-md xl:max-w-[450px] w-full">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#E67E22] to-[#D4AF37] rounded-[2.5rem] blur-2xl opacity-20 transform -rotate-1" />
            
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-[4/5] bg-stone-900 ring-1 ring-[#6B3E1E]/10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`slide-${currentEnt.id}-${currentIndex}`}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.7, ease: "easeInOut" }}
                  className="w-full h-full relative"
                >
                  <FafeImage
                    src={currentEnt.professionalPhoto}
                    alt={`${currentEnt.firstName} ${currentEnt.lastName}`}
                    fallbackType="person"
                    priority={true}
                    className="w-full h-full object-cover"
                  />

                  {/* Gradient Overlay for card contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Superimposed Card directly ON the photo */}
                  <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl shadow-xl border border-white/40">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#E67E22] animate-ping" />
                        <span className="text-[10px] sm:text-xs font-bold text-[#E67E22] tracking-wider uppercase">
                          À LA UNE
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                        {currentIndex + 1} / {entrepreneurs.length}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold font-heading text-[#6B3E1E] leading-tight mb-0.5 truncate">
                      {currentEnt.firstName} {currentEnt.lastName}
                    </h3>
                    
                    <p className="text-xs sm:text-sm font-medium text-stone-600 mb-1.5 truncate">
                      {currentEnt.company} • <span className="text-[#D4AF37] font-semibold">{currentEnt.sector}</span>
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                      <div className="flex items-center gap-1 text-xs text-stone-500 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[#E67E22]" />
                        {currentEnt.country}
                      </div>
                      
                      <Link
                        to={`/hub/annuaire/${currentEnt.id}`}
                        className="inline-flex items-center text-xs sm:text-sm font-bold text-[#E67E22] hover:text-[#c96a1a] transition-colors group"
                      >
                        Découvrir son profil
                        <ArrowRight className="w-3.5 h-3.5 ml-1 transform group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Pagination Dots */}
            <div className="mt-5 flex justify-center gap-2">
              {entrepreneurs.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "bg-[#E67E22] w-7"
                      : "bg-[#6B3E1E]/20 hover:bg-[#6B3E1E]/40 w-2"
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
  const [articles, setArticles] = useState<Article[]>(DEMO_ARTICLES.slice(0, 3));

  useEffect(() => {
    let isMounted = true;
    const fetchArticlesFn = async () => {
      try {
        const data = await fetchArticles(3);
        if (isMounted && data.length > 0) {
          setArticles(data);
        }
      } catch (err) {
        console.warn("DynamicNews background sync:", err);
      }
    };
    fetchArticlesFn();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
      {articles.map((article) => (
        <Link
          key={article.id}
          to={`/actualites/${article.slug}`}
          className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col border border-stone-100"
        >
          <div className="h-48 overflow-hidden bg-stone-100 relative shrink-0">
            <FafeImage
              src={article.featuredImage}
              alt={article.title}
              fallbackType="article"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {article.tags && article.tags[0] && (
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[11px] font-medium">
                {article.tags[0]}
              </div>
            )}
          </div>
          <div className="p-5 sm:p-6 flex flex-col flex-grow">
            <h3 className="text-lg sm:text-xl font-bold font-heading text-[#6B3E1E] mb-2.5 group-hover:text-[#E67E22] transition-colors line-clamp-2">
              {article.title}
            </h3>
            <p className="text-stone-600 mb-4 line-clamp-2 text-sm leading-relaxed flex-grow">
              {article.excerpt}
            </p>
            <span className="text-[#E67E22] font-bold text-sm inline-flex items-center group-hover:gap-2 transition-all mt-auto">
              Lire l'article <ArrowRight className="w-4 h-4 ml-1" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

function DynamicEvents() {
  const [events, setEvents] = useState<any[]>([
    {
      id: "event-1",
      title: "Sommet FAFE Dakar : Leadership & Financement",
      slug: "sommet-fafe-dakar",
      startDate: Date.now() + 86400000 * 14,
      city: "Dakar",
      country: "Sénégal",
      online: false,
      shortDescription: "Le grand rassemblement annuel des femmes entrepreneures d'Afrique de l'Ouest.",
      coverImage: "https://images.unsplash.com/photo-1540317580384-e5d43867caa6?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: "event-2",
      title: "Masterclass ZLECAf : Exporter ses produits à l'échelle continentale",
      slug: "masterclass-zlecaf-exportation",
      startDate: Date.now() + 86400000 * 22,
      city: "Abidjan",
      country: "Côte d'Ivoire",
      online: true,
      shortDescription: "Comprendre les nouvelles opportunités tarifaires et logistiques panafricaines.",
      coverImage: "https://images.unsplash.com/photo-1556761175-5973dc0f32d7?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: "event-3",
      title: "Atelier Pitch & Rencontre Investisseurs",
      slug: "atelier-pitch-investisseurs",
      startDate: Date.now() + 86400000 * 35,
      city: "Kigali",
      country: "Rwanda",
      online: false,
      shortDescription: "Sessions individuelles de mentorat et mise en relation directe avec les Business Angels.",
      coverImage: "https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&q=80&w=800"
    }
  ]);

  useEffect(() => {
    let isMounted = true;
    const fetchEventsFn = async () => {
      try {
        const data = await fetchEvents(3);
        if (isMounted && data.length > 0) {
          setEvents(data);
        }
      } catch (err) {
        console.warn("DynamicEvents background sync:", err);
      }
    };
    fetchEventsFn();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
      {events.map((event) => (
        <Card key={event.id} className="overflow-hidden border border-stone-100 shadow-sm hover:shadow-xl transition-all duration-300 group h-full flex flex-col rounded-2xl bg-white">
          <div className="relative h-48 overflow-hidden shrink-0">
            <FafeImage 
              src={event.coverImage || "https://images.unsplash.com/photo-1540317580384-e5d43867caa6?auto=format&fit=crop&w=800&q=80"} 
              alt={event.title}
              fallbackType="article"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            />
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl text-center shadow-md">
              <div className="text-[#E67E22] font-extrabold text-lg leading-none">
                {new Date(event.startDate).getDate()}
              </div>
              <div className="text-[#6B3E1E] text-[10px] font-bold uppercase mt-0.5">
                {new Date(event.startDate).toLocaleString('fr-FR', { month: 'short' })}
              </div>
            </div>
            {event.online && (
              <div className="absolute top-3 right-3 bg-[#E67E22] text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm">
                En ligne
              </div>
            )}
          </div>
          <CardContent className="p-5 sm:p-6 flex flex-col flex-grow">
            <h3 className="font-bold font-heading text-lg sm:text-xl text-[#6B3E1E] mb-2 group-hover:text-[#E67E22] transition-colors line-clamp-2">
              {event.title}
            </h3>
            <div className="flex items-center gap-1.5 text-stone-500 text-xs sm:text-sm mb-3">
              <MapPin className="w-3.5 h-3.5 text-[#E67E22] shrink-0" />
              <span className="truncate">{event.online ? "Événement virtuel" : `${event.city}, ${event.country}`}</span>
            </div>
            <p className="text-stone-600 text-xs sm:text-sm line-clamp-2 mb-5 flex-grow leading-relaxed">
              {event.shortDescription || event.description}
            </p>
            <Link to={`/actualites`} className="mt-auto block">
              <Button variant="outline" className="w-full border-[#6B3E1E]/20 text-[#6B3E1E] hover:bg-[#6B3E1E] hover:text-white transition-all rounded-full py-2 text-xs sm:text-sm font-semibold">
                Détails de l'événement
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function Home() {
  const [entrepreneurs, setEntrepreneurs] = useState<Entrepreneur[]>(DEMO_ENTREPRENEURS.slice(0, 4));
  const [projects, setProjects] = useState<Project[]>(DEMO_PROJECTS.slice(0, 2));
  
  useEffect(() => {
    let isMounted = true;
    const fetchHomeData = async () => {
      try {
        const ent = await fetchEntrepreneurs(4, true);
        if (isMounted && ent.length > 0) setEntrepreneurs(ent);
        
        const proj = await fetchProjects(2);
        if (isMounted && proj.length > 0) setProjects(proj);
      } catch (err) {
        console.warn("Home background sync notice:", err);
      }
    };
    fetchHomeData();
    return () => {
      isMounted = false;
    };
  }, []);

  const stats = [
    {
      end: 5000,
      suffix: "+",
      label: "Femmes accompagnées",
      icon: <Heart className="w-5 h-5 md:w-6 md:h-6 text-[#E67E22]" />,
    },
    {
      end: 15,
      suffix: "+",
      label: "Pays africains",
      icon: <Globe2 className="w-5 h-5 md:w-6 md:h-6 text-[#E67E22]" />,
    },
    {
      end: 200,
      suffix: "+",
      label: "Projets financés",
      icon: <Briefcase className="w-5 h-5 md:w-6 md:h-6 text-[#E67E22]" />,
    },
    {
      end: 85,
      suffix: "%",
      label: "Taux de réussite",
      icon: <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-[#E67E22]" />,
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
      {/* 1. HERO SECTION (Instant Render) */}
      <DynamicHeroSection />

      {/* 2. STATISTICS SECTION (Animated Counters & Compact Responsive Spacing) */}
      <section className="py-8 md:py-12 bg-white border-y border-[#6B3E1E]/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-3 sm:p-4 rounded-2xl bg-stone-50/60 md:bg-transparent border md:border-0 border-stone-100 group hover:bg-stone-50 transition-colors">
                <div className="w-12 h-12 md:w-14 md:h-14 mx-auto bg-white md:bg-[#FAF9F6] rounded-xl md:rounded-2xl flex items-center justify-center mb-2.5 md:mb-3 shadow-xs group-hover:scale-105 transition-transform duration-300">
                  {stat.icon}
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-heading text-[#6B3E1E] mb-1">
                  <AnimatedCounter end={stat.end} suffix={stat.suffix} />
                </div>
                <div className="text-xs sm:text-xs font-bold text-stone-500 uppercase tracking-wider leading-tight">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. MISSIONS / NOTRE VOCATION */}
      <section className="py-12 md:py-20 bg-[#FAF9F6]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
            <span className="inline-flex items-center gap-1 text-xs font-bold tracking-widest text-[#E67E22] uppercase mb-2">
              <Sparkles className="w-3 h-3" /> Notre Vocation
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading text-[#6B3E1E] leading-tight">
              Trois piliers pour la réussite de vos projets
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
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
                className="bg-white border border-stone-100 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group"
              >
                <CardContent className="p-6 md:p-8 text-center">
                  <div className="text-4xl md:text-5xl mb-4 transform group-hover:scale-110 transition-transform">
                    {mission.icon}
                  </div>
                  <h3 className="text-lg md:text-xl font-bold font-heading text-[#6B3E1E] mb-2.5">
                    {mission.title}
                  </h3>
                  <p className="text-stone-600 text-sm md:text-base leading-relaxed">
                    {mission.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 4. ENTREPRENEURS HIGHLIGHT */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 md:mb-12 gap-4">
            <div className="max-w-2xl">
              <span className="text-xs font-bold tracking-widest text-[#E67E22] uppercase mb-1 block">
                Annuaire Panafricain
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading text-[#6B3E1E]">
                Découvrez les talents du réseau
              </h2>
            </div>
            <Link to="/entrepreneures">
              <Button
                variant="outline"
                className="group border-[#6B3E1E]/20 text-[#6B3E1E] hover:bg-[#6B3E1E]/5 rounded-full px-5 py-2 text-xs sm:text-sm font-semibold"
              >
                Voir l'annuaire complet
                <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {entrepreneurs.map((ent) => (
              <Link key={ent.id} to={`/hub/annuaire/${ent.id}`} className="group">
                <Card className="border border-stone-100 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden bg-[#FAF9F6] h-full flex flex-col">
                  <div className="relative h-48 overflow-hidden bg-stone-200">
                    <FafeImage
                      src={ent.professionalPhoto}
                      alt={`${ent.firstName} ${ent.lastName}`}
                      fallbackType="person"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-[#6B3E1E]/80 to-transparent">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-bold text-[#6B3E1E] uppercase tracking-wider">
                        <MapPin className="w-3 h-3 text-[#E67E22]" /> {ent.country}
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-5 flex flex-col flex-grow">
                    <h3 className="text-base font-bold font-heading text-[#6B3E1E] mb-1 group-hover:text-[#E67E22] transition-colors truncate">
                      {ent.firstName} {ent.lastName}
                    </h3>
                    <p className="text-xs font-bold text-[#D4AF37] mb-2 truncate">
                      {ent.company}
                    </p>
                    <p className="text-xs text-stone-600 line-clamp-2 mt-auto leading-relaxed">
                      {ent.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. COUNTRIES / CONTINENTAL PRESENCE */}
      <section className="py-12 md:py-20 bg-[#6B3E1E] text-white relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <span className="text-xs font-bold tracking-widest text-[#D4AF37] uppercase mb-2 block">
            Présence Continentale
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading mb-8">
            Un réseau actif dans toute l'Afrique
          </h2>

          <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3.5 max-w-4xl mx-auto mb-8">
            {countries.map((country) => (
              <span
                key={country}
                className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-full border border-white/20 bg-white/10 text-xs sm:text-sm font-semibold flex items-center gap-2 backdrop-blur-xs"
              >
                <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                {country}
              </span>
            ))}
          </div>

          <Link to="/entrepreneures">
            <Button className="bg-[#E67E22] hover:bg-[#c96a1a] text-white rounded-full px-6 py-2.5 text-xs sm:text-sm font-bold shadow-md">
              Explorer les membres par pays →
            </Button>
          </Link>
        </div>
      </section>

      {/* 6. IMPACT & PROJETS */}
      <section className="py-12 md:py-20 bg-[#FAF9F6]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
            <span className="text-xs font-bold tracking-widest text-[#E67E22] uppercase mb-1 block">
              Impact & Développement
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading text-[#6B3E1E]">
              Transformer l'entrepreneuriat en impact
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="overflow-hidden border border-stone-100 shadow-sm hover:shadow-xl transition-shadow bg-white rounded-2xl group flex flex-col"
              >
                <div className="flex flex-col sm:flex-row h-full">
                  <div className="sm:w-2/5 h-48 sm:h-auto relative overflow-hidden shrink-0">
                    <FafeImage
                      src={project.image}
                      alt={project.title}
                      fallbackType="project"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[10px] font-bold text-[#E67E22] uppercase tracking-widest shadow-xs">
                        {project.country}
                      </span>
                    </div>
                  </div>
                  <CardContent className="sm:w-3/5 p-5 sm:p-6 flex flex-col justify-center flex-grow">
                    <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-[#00843D] uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00843D]" />
                      Projet Actif
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold font-heading text-[#6B3E1E] mb-2 leading-snug">
                      {project.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 mb-5 leading-relaxed line-clamp-3">
                      {project.description}
                    </p>
                    <Link to="/projets-sociaux" className="mt-auto">
                      <Button
                        variant="outline"
                        className="border-[#D4AF37]/50 text-[#6B3E1E] hover:bg-[#D4AF37] hover:text-white transition-all rounded-full px-5 py-2 text-xs font-bold w-full sm:w-auto"
                      >
                        En savoir plus
                      </Button>
                    </Link>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 7. EVENTS SECTION */}
      <section className="py-12 md:py-20 bg-white border-t border-stone-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 md:mb-12 gap-4">
            <div className="max-w-2xl">
              <span className="text-xs font-bold tracking-widest text-[#E67E22] uppercase mb-1 block">Agenda</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading text-[#6B3E1E]">Nos prochains événements</h2>
            </div>
            <Link to="/actualites">
              <Button variant="outline" className="group border-[#6B3E1E]/20 text-[#6B3E1E] hover:bg-[#6B3E1E]/5 rounded-full px-5 py-2 text-xs sm:text-sm font-semibold">
                Voir tout l'agenda
                <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          <DynamicEvents />
        </div>
      </section>

      {/* 8. NEWS SECTION */}
      <section className="py-12 md:py-20 bg-[#FAF9F6] border-t border-stone-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 md:mb-12 gap-4">
            <div className="max-w-2xl">
              <span className="text-xs font-bold tracking-widest text-[#D4AF37] uppercase mb-1 block">
                Éditorial
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading text-[#6B3E1E]">
                Actualités & inspirations
              </h2>
            </div>
            <Link to="/actualites">
              <Button
                variant="outline"
                className="group border-[#6B3E1E]/20 text-[#6B3E1E] hover:bg-[#6B3E1E]/5 rounded-full px-5 py-2 text-xs sm:text-sm font-semibold"
              >
                Toutes les actualités
                <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <DynamicNews />
        </div>
      </section>

      {/* 9. DONATION CTA */}
      <section className="py-16 md:py-24 bg-[#522d14] relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-[350px] h-[350px] bg-[#E67E22] opacity-10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-[300px] h-[300px] bg-[#D4AF37] opacity-10 rounded-full blur-[70px] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center max-w-3xl">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6 text-[#D4AF37]">
            <Heart className="w-7 h-7" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading mb-5 leading-tight">
            Votre soutien ouvre de{" "}
            <span className="text-[#D4AF37]">nouvelles opportunités.</span>
          </h2>
          <p className="text-white/80 text-base sm:text-lg mb-8 leading-relaxed max-w-xl mx-auto">
            Chaque contribution participe au développement de l'entrepreneuriat
            féminin africain en finançant des formations et des projets d'avenir.
          </p>
          <Link to="/dons">
            <Button
              size="lg"
              className="bg-[#E67E22] hover:bg-[#c96a1a] text-white shadow-xl px-10 py-5 rounded-full font-bold text-base hover:scale-105 transition-transform duration-300"
            >
              Faire un don
            </Button>
          </Link>
        </div>
      </section>

      {/* 10. PARTNERS */}
      <section className="py-12 md:py-16 bg-white border-t border-stone-100">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-8 block">
            Partenaires institutionnels & stratégiques
          </span>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60">
            {partners.map((p) => (
              <span
                key={p}
                className="font-heading font-bold text-lg md:text-xl text-[#6B3E1E] hover:text-[#E67E22] transition-colors"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
