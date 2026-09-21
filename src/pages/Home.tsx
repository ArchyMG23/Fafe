import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Entrepreneur, Article, Project } from "../types";
import { useLanguageStore } from "../store/language";
import { getPublishedCMSContent, defaultAccueilCMS, defaultNousCMS, getCMSLocalizedText, mergeWithDefaults } from "../lib/cms";
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
import { HeroSection } from "../components/home/HeroSection";
import {
  DEMO_ENTREPRENEURS,
  DEMO_ARTICLES,
  DEMO_PROJECTS,
  DEMO_EVENTS,
} from "../lib/mockData";

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
            <h3 className="text-lg sm:text-xl font-bold font-heading text-[#063F3A] mb-2.5 group-hover:text-[#00843D] transition-colors line-clamp-2">
              {article.title}
            </h3>
            <p className="text-stone-600 mb-4 line-clamp-2 text-sm leading-relaxed flex-grow">
              {article.excerpt}
            </p>
            <span className="text-[#00843D] font-bold text-sm inline-flex items-center group-hover:gap-2 transition-all mt-auto">
              Lire l'article <ArrowRight className="w-4 h-4 ml-1" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

function DynamicEvents() {
  const [events, setEvents] = useState<any[]>(DEMO_EVENTS.slice(0, 3));

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
          <Link to={`/evenements/${event.slug || event.id}`} className="relative h-48 overflow-hidden shrink-0 block">
            <FafeImage 
              src={event.coverImage || "https://images.unsplash.com/photo-1540317580384-e5d43867caa6?auto=format&fit=crop&w=800&q=80"} 
              alt={event.title}
              fallbackType="article"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            />
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl text-center shadow-md">
              <div className="text-[#00843D] font-extrabold text-lg leading-none">
                {new Date(event.startDate).getDate()}
              </div>
              <div className="text-[#063F3A] text-[10px] font-bold uppercase mt-0.5">
                {new Date(event.startDate).toLocaleString('fr-FR', { month: 'short' })}
              </div>
            </div>
            {event.online && (
              <div className="absolute top-3 right-3 bg-[#C8102E] text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm">
                En ligne
              </div>
            )}
          </Link>
          <CardContent className="p-5 sm:p-6 flex flex-col flex-grow">
            <Link to={`/evenements/${event.slug || event.id}`} className="block">
              <h3 className="font-bold font-heading text-lg sm:text-xl text-[#063F3A] mb-2 group-hover:text-[#00843D] transition-colors line-clamp-2">
                {event.title}
              </h3>
            </Link>
            <div className="flex items-center gap-1.5 text-stone-500 text-xs sm:text-sm mb-3">
              <MapPin className="w-3.5 h-3.5 text-[#00843D] shrink-0" />
              <span className="truncate">{event.online ? "Événement virtuel" : `${event.city}, ${event.country}`}</span>
            </div>
            <p className="text-stone-600 text-xs sm:text-sm line-clamp-2 mb-5 flex-grow leading-relaxed">
              {event.shortDescription || event.description}
            </p>
            <Link to={`/evenements/${event.slug || event.id}`} className="mt-auto block">
              <Button variant="outline" className="w-full border-[#063F3A]/20 text-[#063F3A] hover:bg-[#00843D] hover:text-white transition-all rounded-full py-2 text-xs sm:text-sm font-semibold">
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
  const { language } = useLanguageStore();
  const [cmsData, setCmsData] = useState<any>(() => {
    try {
      const cached = localStorage.getItem("fafe_cms_published_accueil");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object') {
          return mergeWithDefaults(defaultAccueilCMS, parsed.content || parsed);
        }
      }
    } catch (e) {}
    return defaultAccueilCMS;
  });

  const [nousData, setNousData] = useState<any>(() => {
    try {
      const cached = localStorage.getItem("fafe_cms_published_nous");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object') {
          return mergeWithDefaults(defaultNousCMS, parsed.content || parsed);
        }
      }
    } catch (e) {}
    return defaultNousCMS;
  });

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

    const fetchCMS = async () => {
      try {
        const data = await getPublishedCMSContent("accueil", defaultAccueilCMS);
        if (isMounted && data) {
          setCmsData(data);
        }
      } catch (err) {
        console.warn("Home CMS sync:", err);
      }
      try {
        const nous = await getPublishedCMSContent("nous", defaultNousCMS);
        if (isMounted && nous) {
          setNousData(nous);
        }
      } catch (err) {
        console.warn("Home nous CMS sync:", err);
      }
    };
    fetchCMS();

    const handleCMSUpdate = (e: any) => {
      if (e.detail?.pageId === "accueil" && e.detail?.content && isMounted) {
        setCmsData(mergeWithDefaults(defaultAccueilCMS, e.detail.content));
      }
      if (e.detail?.pageId === "nous" && e.detail?.content && isMounted) {
        setNousData(mergeWithDefaults(defaultNousCMS, e.detail.content));
      }
    };
    window.addEventListener("fafe_cms_updated", handleCMSUpdate);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "fafe_cms_published_accueil" && e.newValue && isMounted) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed) {
            setCmsData(mergeWithDefaults(defaultAccueilCMS, parsed.content || parsed));
          }
        } catch {}
      }
      if (e.key === "fafe_cms_published_nous" && e.newValue && isMounted) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed) {
            setNousData(mergeWithDefaults(defaultNousCMS, parsed.content || parsed));
          }
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      isMounted = false;
      window.removeEventListener("fafe_cms_updated", handleCMSUpdate);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const statsList = Array.isArray(cmsData.stats) && cmsData.stats.length > 0 ? cmsData.stats : defaultAccueilCMS.stats;
  const getStatIcon = (iconName?: string) => {
    switch (iconName) {
      case "Globe": return <Globe2 className="w-5 h-5 md:w-6 md:h-6 text-[#00843D]" />;
      case "Briefcase": return <Briefcase className="w-5 h-5 md:w-6 md:h-6 text-[#00843D]" />;
      case "TrendingUp": return <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-[#00843D]" />;
      case "Heart":
      default: return <Heart className="w-5 h-5 md:w-6 md:h-6 text-[#00843D]" />;
    }
  };

  const stats = statsList.map((st: any) => {
    const rawVal = String(st.value || "");
    const numeric = parseInt(rawVal.replace(/[^0-9]/g, "")) || 0;
    const suffix = rawVal.replace(/[0-9\s]/g, "") || "+";
    return {
      end: numeric,
      suffix,
      label: getCMSLocalizedText(st.label, language, "Statistique"),
      icon: getStatIcon(st.icon),
    };
  });

  const rawPartners = Array.isArray(cmsData.partners?.list) && cmsData.partners.list.length > 0
    ? cmsData.partners.list
    : ["ONU Femmes", "BAD", "AFD", "Union Européenne", "OIF"];
  const partners = rawPartners.map((p: any) => typeof p === "string" ? p : p.name);

  const countries = Array.isArray(cmsData.network?.countries) && cmsData.network.countries.length > 0
    ? cmsData.network.countries
    : ["Sénégal", "Côte d'Ivoire", "Mali", "Cameroun", "RDC", "Maroc"];

  const missionPillars = Array.isArray(cmsData.missions?.pillars) && cmsData.missions.pillars.length > 0
    ? cmsData.missions.pillars.map((p: any) => ({
        title: getCMSLocalizedText(p.title, language),
        desc: getCMSLocalizedText(p.description, language),
        icon: p.icon === "Banknote" ? "💰" : p.icon === "GraduationCap" ? "🎓" : "🤝",
      }))
    : [
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
      ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION (Instant Full-Screen Render) */}
      <HeroSection hero={cmsData.hero} pcaHero={nousData?.pcaHero} />

      {/* 2. STATISTICS SECTION (Animated Counters & Compact Responsive Spacing) */}
      <section className="py-8 md:py-12 bg-white/60 backdrop-blur-xs border-y border-[#063F3A]/5">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {stats.map((stat: any, index: number) => (
              <div key={index} className="text-center p-3 sm:p-4 rounded-2xl bg-stone-50/60 md:bg-transparent border md:border-0 border-stone-100 group hover:bg-stone-50 transition-colors">
                <div className="w-12 h-12 md:w-14 md:h-14 mx-auto bg-white md:bg-[#FAF9F6] rounded-xl md:rounded-2xl flex items-center justify-center mb-2.5 md:mb-3 shadow-xs group-hover:scale-105 transition-transform duration-300">
                  {stat.icon}
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-heading text-[#063F3A] mb-1">
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
      <section className="py-12 md:py-20 bg-transparent">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
            <span className="inline-flex items-center gap-1 text-xs font-bold tracking-widest text-[#00843D] uppercase mb-2">
              <Sparkles className="w-3 h-3" /> {getCMSLocalizedText(cmsData.missions?.badge, language, "Notre Vocation")}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading text-[#063F3A] leading-tight">
              {getCMSLocalizedText(cmsData.missions?.title, language, "Trois piliers pour la réussite de vos projets")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {missionPillars.map((mission: any, idx: number) => (
              <Card
                key={idx}
                className="bg-white border border-stone-100 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group"
              >
                <CardContent className="p-6 md:p-8 text-center">
                  <div className="text-4xl md:text-5xl mb-4 transform group-hover:scale-110 transition-transform">
                    {mission.icon}
                  </div>
                  <h3 className="text-lg md:text-xl font-bold font-heading text-[#063F3A] mb-2.5">
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
      <section className="py-12 md:py-20 bg-white/60 backdrop-blur-xs">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 md:mb-12 gap-4">
            <div className="max-w-2xl">
              <span className="text-xs font-bold tracking-widest text-[#00843D] uppercase mb-1 block">
                {getCMSLocalizedText(cmsData.directory?.badge, language, "Annuaire Panafricain")}
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading text-[#063F3A]">
                {getCMSLocalizedText(cmsData.directory?.title, language, "Découvrez les talents du réseau")}
              </h2>
            </div>
            <Link to={cmsData.directory?.buttonLink || "/entrepreneures"}>
              <Button
                variant="outline"
                className="group border-[#063F3A]/20 text-[#063F3A] hover:bg-[#00843D]/5 rounded-full px-5 py-2 text-xs sm:text-sm font-semibold"
              >
                {getCMSLocalizedText(cmsData.directory?.buttonText, language, "Voir l'annuaire complet")}
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
                    <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black/80 to-transparent">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-bold text-[#063F3A] uppercase tracking-wider">
                        <MapPin className="w-3.5 h-3.5 text-[#00843D]" /> {ent.country}
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-5 flex flex-col flex-grow">
                    <h3 className="text-base font-bold font-heading text-[#063F3A] mb-1 group-hover:text-[#00843D] transition-colors truncate">
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
      <section className="py-12 md:py-20 bg-transparent text-[#063F3A] relative overflow-hidden">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 relative z-10 text-center">
          <span className="text-xs font-bold tracking-widest text-[#00843D] uppercase mb-2 block">
            {getCMSLocalizedText(cmsData.network?.badge, language, "Présence Continentale")}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading mb-8">
            {getCMSLocalizedText(cmsData.network?.title, language, "Un réseau actif dans toute l'Afrique")}
          </h2>

          <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3.5 max-w-4xl mx-auto mb-8">
            {countries.map((country: string) => (
              <span
                key={country}
                className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-full border border-stone-200 bg-white text-stone-700 shadow-sm text-xs sm:text-sm font-semibold flex items-center gap-2 backdrop-blur-xs"
              >
                <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                {country}
              </span>
            ))}
          </div>

          <Link to={cmsData.network?.link || "/entrepreneures"}>
            <Button className="bg-[#C8102E] hover:bg-[#A30D25] text-white rounded-full px-6 py-2.5 text-xs sm:text-sm font-bold shadow-md">
              {getCMSLocalizedText(cmsData.network?.linkText, language, "Explorer les membres par pays →")}
            </Button>
          </Link>
        </div>
      </section>

      {/* 6. IMPACT & PROJETS */}
      <section className="py-12 md:py-20 bg-transparent">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
            <span className="text-xs font-bold tracking-widest text-[#00843D] uppercase mb-1 block">
              {getCMSLocalizedText(cmsData.projects?.badge, language, "Impact & Développement")}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading text-[#063F3A]">
              {getCMSLocalizedText(cmsData.projects?.title, language, "Transformer l'entrepreneuriat en impact")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="overflow-hidden border border-stone-100 shadow-sm hover:shadow-xl transition-shadow bg-white rounded-2xl group flex flex-col"
              >
                <div className="flex flex-col sm:flex-row h-full">
                  <Link to={`/projets-sociaux/${project.id}`} className="sm:w-2/5 h-48 sm:h-auto relative overflow-hidden shrink-0 block">
                    <FafeImage
                      src={project.image}
                      alt={project.title}
                      fallbackType="project"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[10px] font-bold text-[#00843D] uppercase tracking-widest shadow-xs">
                        {project.country}
                      </span>
                    </div>
                  </Link>
                  <CardContent className="sm:w-3/5 p-5 sm:p-6 flex flex-col justify-center flex-grow">
                    <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-[#00843D] uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00843D]" />
                      Projet Actif
                    </div>
                    <Link to={`/projets-sociaux/${project.id}`} className="block">
                      <h3 className="text-lg sm:text-xl font-bold font-heading text-[#063F3A] mb-2 leading-snug group-hover:text-[#00843D] transition-colors">
                        {project.title}
                      </h3>
                    </Link>
                    <p className="text-xs sm:text-sm text-stone-600 mb-5 leading-relaxed line-clamp-3">
                      {project.description}
                    </p>
                    <Link to={`/projets-sociaux/${project.id}`} className="mt-auto">
                      <Button
                        variant="outline"
                        className="border-[#D4AF37]/50 text-[#063F3A] hover:bg-[#D4AF37] hover:text-white transition-all rounded-full px-5 py-2 text-xs font-bold w-full sm:w-auto"
                      >
                        {getCMSLocalizedText(cmsData.projects?.buttonText, language, "En savoir plus")}
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
      <section className="py-12 md:py-20 bg-white/60 backdrop-blur-xs border-t border-stone-100">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 md:mb-12 gap-4">
            <div className="max-w-2xl">
              <span className="text-xs font-bold tracking-widest text-[#00843D] uppercase mb-1 block">
                {getCMSLocalizedText(cmsData.events?.badge, language, "Agenda")}
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading text-[#063F3A]">
                {getCMSLocalizedText(cmsData.events?.title, language, "Nos prochains événements")}
              </h2>
            </div>
            <Link to={cmsData.events?.buttonLink || "/actualites"}>
              <Button variant="outline" className="group border-[#063F3A]/20 text-[#063F3A] hover:bg-[#00843D]/5 rounded-full px-5 py-2 text-xs sm:text-sm font-semibold">
                {getCMSLocalizedText(cmsData.events?.buttonText, language, "Voir tout l'agenda")}
                <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          <DynamicEvents />
        </div>
      </section>

      {/* 8. NEWS SECTION */}
      <section className="py-12 md:py-20 bg-transparent border-t border-stone-100">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 md:mb-12 gap-4">
            <div className="max-w-2xl">
              <span className="text-xs font-bold tracking-widest text-[#D4AF37] uppercase mb-1 block">
                {getCMSLocalizedText(cmsData.news?.badge, language, "Éditorial")}
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading text-[#063F3A]">
                {getCMSLocalizedText(cmsData.news?.title, language, "Actualités & inspirations")}
              </h2>
            </div>
            <Link to={cmsData.news?.buttonLink || "/actualites"}>
              <Button
                variant="outline"
                className="group border-[#063F3A]/20 text-[#063F3A] hover:bg-[#00843D]/5 rounded-full px-5 py-2 text-xs sm:text-sm font-semibold"
              >
                {getCMSLocalizedText(cmsData.news?.buttonText, language, "Toutes les actualités")}
                <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <DynamicNews />
        </div>
      </section>

      {/* 9. DONATION CTA */}
      <section className="py-16 md:py-24 bg-[#063F3A] relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-[350px] h-[350px] bg-[#C8102E] opacity-10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-[300px] h-[300px] bg-[#D4AF37] opacity-10 rounded-full blur-[70px] pointer-events-none" />

        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 relative z-10 text-center max-w-3xl">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6 text-[#D4AF37]">
            <Heart className="w-7 h-7" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading mb-5 leading-tight text-white">
            {getCMSLocalizedText(cmsData.donationCta?.title, language, "Votre soutien ouvre de nouvelles opportunités.")}
          </h2>
          <p className="text-white/80 text-base sm:text-lg mb-8 leading-relaxed max-w-xl mx-auto">
            {getCMSLocalizedText(
              cmsData.donationCta?.description,
              language,
              "Chaque contribution participe au développement de l'entrepreneuriat féminin africain en finançant des formations et des projets d'avenir."
            )}
          </p>
          <Link to={cmsData.donationCta?.buttonLink || "/dons"}>
            <Button
              size="lg"
              className="bg-[#C8102E] hover:bg-[#A30D25] text-white shadow-xl px-10 py-5 rounded-full font-bold text-base hover:scale-105 transition-transform duration-300"
            >
              {getCMSLocalizedText(cmsData.donationCta?.buttonText, language, "Faire un don")}
            </Button>
          </Link>
        </div>
      </section>

      {/* 10. PARTNERS */}
      <section className="py-12 md:py-16 bg-white/60 backdrop-blur-xs border-t border-stone-100">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 text-center">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-8 block">
            {getCMSLocalizedText(cmsData.partners?.title, language, "Partenaires institutionnels & stratégiques")}
          </span>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60">
            {partners.map((p: string) => (
              <span
                key={p}
                className="font-heading font-bold text-lg md:text-xl text-[#063F3A] hover:text-[#00843D] transition-colors"
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
