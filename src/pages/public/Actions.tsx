import { FafeImage } from '../../components/ui/FafeImage';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  BookOpen, 
  Briefcase, 
  PiggyBank, 
  Users, 
  ShoppingCart,
  Lightbulb,
  Heart,
  Globe2,
  Calendar,
  MapPin,
  CheckCircle2,
  Search
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useLanguageStore } from '../../store/language';
import { 
  ActionCategory, 
  FAFEAction, 
  ActionStatistic, 
  ActionTestimonial,
  Project,
  FAFEEvent
} from '../../types';
import { 
  fetchActionCategories, 
  fetchFAFEActions, 
  fetchActionStats, 
  fetchActionTestimonials, 
  fetchProjects, 
  fetchEvents 
} from '../../lib/dataFetching';
import { 
  DEMO_ACTION_CATEGORIES, 
  DEMO_ACTIONS, 
  DEMO_ACTION_STATS, 
  DEMO_ACTION_TESTIMONIALS 
} from '../../lib/actionsMock';
import { DEMO_PROJECTS, DEMO_EVENTS } from '../../lib/mockData';

const iconMap: Record<string, any> = {
  BookOpen,
  Briefcase,
  PiggyBank,
  Users,
  ShoppingCart,
  Lightbulb,
  Heart
};

export function Actions() {
  const { language, tl } = useLanguageStore();
  const [categories, setCategories] = useState<ActionCategory[]>(() => DEMO_ACTION_CATEGORIES.filter(c => c.isActive));
  const [featuredActions, setFeaturedActions] = useState<FAFEAction[]>(() => DEMO_ACTIONS.filter(a => a.isFeatured));
  const [allActions, setAllActions] = useState<FAFEAction[]>(() => DEMO_ACTIONS);
  const [stats, setStats] = useState<ActionStatistic[]>(() => DEMO_ACTION_STATS.filter(s => s.isVisible));
  const [testimonials, setTestimonials] = useState<ActionTestimonial[]>(() => DEMO_ACTION_TESTIMONIALS.filter(t => t.isVisible));
  const [projects, setProjects] = useState<Project[]>(() => DEMO_PROJECTS.slice(0, 3));
  const [events, setEvents] = useState<FAFEEvent[]>(() => (DEMO_EVENTS as any[]).slice(0, 3));
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const [cats, featured, all, st, tests, projs, evts] = await Promise.all([
          fetchActionCategories(),
          fetchFAFEActions(3, true),
          fetchFAFEActions(),
          fetchActionStats(),
          fetchActionTestimonials(),
          fetchProjects(3),
          fetchEvents(3)
        ]);
        if (isMounted) {
          if (cats.length > 0) setCategories(cats);
          if (featured.length > 0) setFeaturedActions(featured);
          if (all.length > 0) setAllActions(all);
          if (st.length > 0) setStats(st);
          if (tests.length > 0) setTestimonials(tests);
          if (projs.length > 0) setProjects(projs);
          if (evts.length > 0) setEvents(evts);
        }
      } catch (err) {
        console.warn("Notice loading actions data in background:", err);
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const filteredActions = allActions.filter(a => {
    const matchesFilter = activeFilter === 'all' || a.categoryId === activeFilter;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      (a.titleFR && a.titleFR.toLowerCase().includes(searchLower)) ||
      (a.titleEN && a.titleEN.toLowerCase().includes(searchLower)) ||
      (a.shortDescriptionFR && a.shortDescriptionFR.toLowerCase().includes(searchLower)) ||
      (a.country && a.country.toLowerCase().includes(searchLower));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="bg-[#FAF9F6] min-h-screen actions-container">
      {/* 1. HERO - NOS ACTIONS */}
      <section className="merged-section relative pt-24 pb-20 lg:pt-32 lg:pb-32 overflow-hidden bg-[#FAF9F6] merged-section" id="actions-hero">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-32 -mr-32 w-[500px] h-[500px] bg-[#E67E22] opacity-5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 -mb-32 -ml-32 w-[400px] h-[400px] bg-[#D4AF37] opacity-5 rounded-full blur-[80px]"></div>

        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <motion.div 
              className="lg:w-1/2"
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E67E22]/20 text-[#E67E22] text-sm font-bold tracking-wide uppercase mb-6 shadow-sm">
                <Globe2 className="w-4 h-4" />
                {language === 'fr' ? 'Nos Actions' : 'Our Actions'}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-[#6B3E1E] leading-tight mb-6">
                {language === 'fr' 
                  ? "Agir aujourd'hui pour construire l'entrepreneuriat féminin africain de demain."
                  : "Acting today to build tomorrow's African female entrepreneurship."}
              </h1>
              <p className="text-lg text-stone-600 mb-8 leading-relaxed max-w-xl">
                {language === 'fr'
                  ? "Le FAFE déploie des programmes concrets et mesurables pour accompagner, former, financer et connecter les femmes entrepreneures à travers tout le continent."
                  : "FAFE deploys concrete and measurable programs to support, train, finance, and connect women entrepreneurs across the continent."}
              </p>
            </motion.div>
            
            <motion.div 
              className="lg:w-1/2 w-full"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3] group">
                <FafeImage 
                  src="https://images.unsplash.com/photo-1531545514256-b1400bc00f31?auto=format&fit=crop&q=80" 
                  alt="Actions FAFE" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. INTRODUCTION / NOTRE ENGAGEMENT */}
      <section className="merged-section py-20 bg-white">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-sm font-bold text-[#E67E22] tracking-widest uppercase mb-4">
              {language === 'fr' ? 'Notre Engagement' : 'Our Commitment'}
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold font-heading text-[#6B3E1E] mb-8 leading-tight">
              {language === 'fr' 
                ? "Nous transformons les ambitions entrepreneuriales en opportunités concrètes."
                : "We transform entrepreneurial ambitions into concrete opportunities."}
            </h3>
            <p className="text-lg text-stone-600 leading-relaxed">
              {language === 'fr'
                ? "Parce que le potentiel ne suffit pas, nous mettons en place un écosystème d'actions complémentaires pour lever les freins et accélérer la croissance des entreprises dirigées par des femmes en Afrique."
                : "Because potential is not enough, we are putting in place an ecosystem of complementary actions to remove obstacles and accelerate the growth of women-led businesses in Africa."}
            </p>
          </motion.div>
        </div>
      </section>

      {/* 3. DOMAINES D'ACTION */}
      <section className="merged-section py-24 bg-[#FAF9F6]">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-[#6B3E1E] mb-4">
              {language === 'fr' ? "Nos Domaines d'Action" : 'Our Areas of Action'}
            </h2>
            <div className="w-20 h-1 bg-[#E67E22] mx-auto rounded-full"></div>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {categories.map((category, index) => {
              const Icon = category.icon && iconMap[category.icon] ? iconMap[category.icon] : BookOpen;
              // Asymmetric layout logic for emphasis on the first two
              const isLarge = index === 0 || index === 1;

              return (
                <motion.div 
                  key={category.id}
                  variants={fadeInUp}
                  className={`group relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${isLarge ? 'md:col-span-2 lg:col-span-2' : ''}`}
                  style={{ minHeight: isLarge ? '320px' : '280px' }}
                >
                  <Link to={`/nos-actions/${category.slug}`} className="absolute inset-0 z-20">
                    <span className="sr-only">{tl({ fr: category.titleFR, en: category.titleEN })}</span>
                  </Link>
                  
                  {category.image && (
                    <div className="absolute inset-0 z-0">
                      <FafeImage 
                        src={category.image} 
                        alt="" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity group-hover:opacity-90"></div>
                    </div>
                  )}

                  <div className="relative z-10 h-full p-8 flex flex-col justify-end text-white">
                    <div 
                      className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center backdrop-blur-md bg-white/20 transition-transform group-hover:scale-110"
                      style={{ borderLeft: `4px solid ${category.colorAccent || '#E67E22'}` }}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold font-heading mb-2 transform transition-transform group-hover:-translate-y-1">
                      {tl({ fr: category.titleFR, en: category.titleEN })}
                    </h3>
                    <p className="text-white/80 mb-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 line-clamp-2">
                      {tl({ fr: category.descriptionFR || '', en: category.descriptionEN || '' })}
                    </p>
                    <div className="flex items-center text-sm font-bold text-[#E67E22] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {language === 'fr' ? 'Découvrir' : 'Discover'}
                      <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* 4. ACTIONS À LA UNE */}
      {featuredActions.length > 0 && (
        <section className="merged-section py-24 bg-white">
          <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
            <motion.div 
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="text-sm font-bold text-[#E67E22] tracking-widest uppercase mb-4">
                {language === 'fr' ? 'À la une' : 'Featured'}
              </h2>
              <h3 className="text-3xl md:text-4xl font-bold font-heading text-[#6B3E1E] mb-4">
                {language === 'fr' ? "Programmes & Actions Phares" : "Flagship Programs & Actions"}
              </h3>
            </motion.div>

            <div className="grid lg:grid-cols-12 gap-8">
              {/* Main Featured Action */}
              <motion.div 
                className="lg:col-span-8 group rounded-2xl overflow-hidden bg-white shadow-lg border border-stone-100 flex flex-col md:flex-row"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                <div className="md:w-1/2 relative overflow-hidden">
                  <FafeImage 
                    src={featuredActions[0].image} 
                    alt="" 
                    className="w-full h-full object-cover aspect-video md:aspect-auto transition-transform duration-700 group-hover:scale-105" 
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#E67E22] uppercase tracking-wider">
                    {language === 'fr' ? 'Programme' : 'Program'}
                  </div>
                </div>
                <div className="md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
                  <h4 className="text-2xl font-bold font-heading text-[#6B3E1E] mb-4">
                    {tl({ fr: featuredActions[0].titleFR, en: featuredActions[0].titleEN })}
                  </h4>
                  <p className="text-stone-600 mb-6 line-clamp-3">
                    {tl({ fr: featuredActions[0].shortDescriptionFR, en: featuredActions[0].shortDescriptionEN })}
                  </p>
                  <ul className="space-y-2 mb-8">
                    <li className="flex items-center text-sm text-stone-500">
                      <MapPin className="w-4 h-4 mr-2 text-[#D4AF37]" />
                      {featuredActions[0].country || 'Panafricain'}
                    </li>
                    <li className="flex items-center text-sm text-stone-500">
                      <Calendar className="w-4 h-4 mr-2 text-[#D4AF37]" />
                      {featuredActions[0].status === 'ONGOING' 
                        ? (language === 'fr' ? 'En cours' : 'Ongoing') 
                        : (language === 'fr' ? 'À venir' : 'Upcoming')}
                    </li>
                  </ul>
                  <Link to={featuredActions[0].ctaLink || `/nos-actions/${featuredActions[0].slug}`}>
                    <Button className="w-full sm:w-auto bg-[#6B3E1E] hover:bg-[#8B5E34] text-white rounded-full">
                      {tl({ fr: featuredActions[0].ctaTextFR || 'Découvrir', en: featuredActions[0].ctaTextEN || 'Discover' })}
                    </Button>
                  </Link>
                </div>
              </motion.div>

              {/* Secondary Featured Actions */}
              <div className="lg:col-span-4 flex flex-col gap-8">
                {featuredActions.slice(1, 3).map((action, idx) => (
                  <motion.div 
                    key={action.id}
                    className="group rounded-2xl overflow-hidden bg-white shadow-md border border-stone-100 flex h-full"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                  >
                    <div className="w-1/3 relative overflow-hidden">
                      <FafeImage 
                        src={action.image} 
                        alt="" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      />
                    </div>
                    <div className="w-2/3 p-5 flex flex-col justify-center">
                      <h4 className="text-lg font-bold font-heading text-[#6B3E1E] mb-2 line-clamp-2 group-hover:text-[#E67E22] transition-colors">
                        {tl({ fr: action.titleFR, en: action.titleEN })}
                      </h4>
                      <div className="flex items-center text-xs text-stone-500 mb-3">
                        <MapPin className="w-3 h-3 mr-1" />
                        {action.country || 'Panafricain'}
                      </div>
                      <Link to={action.ctaLink || `/nos-actions/${action.slug}`} className="text-sm font-bold text-[#E67E22] flex items-center mt-auto">
                        {language === 'fr' ? 'Voir' : 'View'}
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. IMPACT EN CHIFFRES */}
      <section className="merged-section py-20 bg-[#6B3E1E] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37] opacity-10 rounded-full blur-[80px]"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#E67E22] opacity-10 rounded-full blur-[80px]"></div>
        
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center">
            {stats.map((stat, idx) => (
              <motion.div 
                key={stat.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="flex flex-col items-center"
              >
                <div className="text-4xl md:text-5xl font-bold font-heading text-[#D4AF37] mb-2 flex items-center">
                  {stat.prefix && <span>{stat.prefix}</span>}
                  <span>{stat.value}</span>
                  {stat.suffix && <span>{stat.suffix}</span>}
                </div>
                <div className="text-sm md:text-base font-medium text-white/80 uppercase tracking-wide">
                  {tl({ fr: stat.labelFR, en: stat.labelEN })}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. TOUTES LES ACTIONS (FILTRABLES) */}
      <section className="merged-section py-24 bg-[#FAF9F6]">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
            <h2 className="text-3xl font-bold font-heading text-[#6B3E1E]">
              {language === 'fr' ? 'Toutes nos actions' : 'All our actions'}
            </h2>
            
            
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 justify-center md:justify-end flex-grow">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input 
                  type="text" 
                  placeholder={language === 'fr' ? 'Rechercher une action...' : 'Search an action...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-64 pl-9 pr-4 py-2 rounded-full border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#E67E22]/20 focus:border-[#E67E22] transition-all"
                />
              </div>
              <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === 'all' 
                    ? 'bg-[#E67E22] text-white' 
                    : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                {language === 'fr' ? 'Toutes' : 'All'}
              </button>
              {categories.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => setActiveFilter(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeFilter === cat.id 
                      ? 'bg-[#E67E22] text-white' 
                      : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  {tl({ fr: cat.titleFR, en: cat.titleEN })}
                </button>
              ))}
            </div>
            </div>
          </div>

          {filteredActions.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-stone-100">
              <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[#6B3E1E] mb-2">
                {language === 'fr' ? 'Actions à venir' : 'Upcoming actions'}
              </h3>
              <p className="text-stone-500">
                {language === 'fr' 
                  ? 'Notre équipe prépare actuellement les prochaines actions du FAFE.'
                  : 'Our team is currently preparing the next FAFE actions.'}
              </p>
            </div>
          ) : (
            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              {filteredActions.map(action => (
                <motion.div 
                  key={action.id}
                  variants={fadeInUp}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-stone-100 flex flex-col group"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <FafeImage 
                      src={action.image} 
                      alt="" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#6B3E1E]">
                      {categories.find(c => c.id === action.categoryId)?.titleFR || 'Action'}
                    </div>
                  </div>
                  <div className="p-6 flex-grow flex flex-col">
                    <h3 className="text-xl font-bold font-heading text-[#6B3E1E] mb-3 group-hover:text-[#E67E22] transition-colors">
                      {tl({ fr: action.titleFR, en: action.titleEN })}
                    </h3>
                    <p className="text-stone-600 text-sm mb-6 line-clamp-3">
                      {tl({ fr: action.shortDescriptionFR, en: action.shortDescriptionEN })}
                    </p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center text-xs text-stone-500">
                        <MapPin className="w-3 h-3 mr-1" />
                        {action.country || 'Panafricain'}
                      </div>
                      <Link to={action.ctaLink || `/nos-actions/${action.slug}`} className="text-sm font-bold text-[#E67E22] hover:text-[#c96a1a] flex items-center">
                        {language === 'fr' ? 'Découvrir' : 'Discover'}
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* 7. PROJETS EN COURS */}
      {projects.length > 0 && (
        <section className="merged-section py-24 bg-white">
          <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex justify-between items-end mb-12">
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                <h2 className="text-sm font-bold text-[#E67E22] tracking-widest uppercase mb-2">
                  {language === 'fr' ? 'Projets Sociaux' : 'Social Projects'}
                </h2>
                <h3 className="text-3xl md:text-4xl font-bold font-heading text-[#6B3E1E]">
                  {language === 'fr' ? 'Nos projets en cours' : 'Our ongoing projects'}
                </h3>
              </motion.div>
              <Link to="/projets-sociaux" className="hidden md:flex items-center text-[#E67E22] font-bold hover:text-[#c96a1a] transition-colors">
                {language === 'fr' ? 'Voir tous les projets' : 'View all projects'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project, idx) => (
                <motion.div 
                  key={project.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  className="rounded-2xl overflow-hidden bg-stone-50 border border-stone-100 group"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <FafeImage 
                      src={project.image} 
                      alt={project.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center text-xs font-bold text-[#D4AF37] mb-2 uppercase tracking-wide">
                      {project.country || 'Panafricain'}
                    </div>
                    <h4 className="text-xl font-bold font-heading text-[#6B3E1E] mb-3 line-clamp-2">
                      {project.title}
                    </h4>
                    

                    
                                        {/* Progression bar for projects */}
                    {project.targetAmount && project.raisedAmount !== undefined && (
                      <div className="mb-6">
                        <div className="flex justify-between text-xs text-stone-500 mb-2">
                          <span>{language === 'fr' ? 'Objectif du projet' : 'Project goal'}</span>
                          <span className="font-bold text-[#E67E22]">
                            {Math.round((project.raisedAmount / project.targetAmount) * 100)}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#E67E22]" 
                            style={{ width: `${Math.min(Math.round((project.raisedAmount / project.targetAmount) * 100), 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    <Link to={`/projets-sociaux/${project.id}`}>
                      <Button variant="outline" className="w-full border-stone-200 text-[#6B3E1E] hover:bg-white hover:border-[#E67E22] hover:text-[#E67E22]">
                        {language === 'fr' ? 'Découvrir le projet' : 'Discover the project'}
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. HISTOIRES D'IMPACT (TÉMOIGNAGES) */}
      {testimonials.length > 0 && (
        <section className="merged-section py-24 bg-[#FAF9F6]">
          <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
            <motion.div 
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="text-3xl md:text-4xl font-bold font-heading text-[#6B3E1E] mb-4">
                {language === 'fr' ? "Des actions qui changent des parcours" : 'Actions that change paths'}
              </h2>
              <div className="w-20 h-1 bg-[#D4AF37] mx-auto rounded-full"></div>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {testimonials.slice(0, 2).map((testimonial, idx) => (
                <motion.div 
                  key={testimonial.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 relative"
                >
                  <div className="text-6xl text-[#E67E22]/10 absolute top-4 left-4 font-serif">"</div>
                  <p className="text-stone-600 italic mb-8 relative z-10">
                    "{tl({ fr: testimonial.testimonialFR, en: testimonial.testimonialEN })}"
                  </p>
                  <div className="flex items-center gap-4">
                    <FafeImage 
                      src={testimonial.photo} 
                      alt="" 
                      className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
                    />
                    <div>
                      <h4 className="font-bold text-[#6B3E1E]">
                        {testimonial.firstName} {testimonial.lastName}
                      </h4>
                      <p className="text-sm text-stone-500">
                        {testimonial.company} • {testimonial.country}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      
      {/* 8.5 ÉVÉNEMENTS ET ACTIVITÉS */}
      {events.length > 0 && (
        <section className="merged-section py-24 bg-white">
          <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex justify-between items-end mb-12">
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                <h2 className="text-sm font-bold text-[#E67E22] tracking-widest uppercase mb-2">
                  {language === 'fr' ? 'Agenda' : 'Agenda'}
                </h2>
                <h3 className="text-3xl md:text-4xl font-bold font-heading text-[#6B3E1E]">
                  {language === 'fr' ? 'Prochains rendez-vous' : 'Upcoming events'}
                </h3>
              </motion.div>
              <Link to="/evenements" className="hidden md:flex items-center text-[#E67E22] font-bold hover:text-[#c96a1a] transition-colors">
                {language === 'fr' ? 'Tous les événements' : 'All events'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {events.map((evt, idx) => (
                <motion.div 
                  key={evt.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  className="bg-[#FAF9F6] p-6 rounded-2xl shadow-sm border border-stone-100 group hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="bg-white text-center p-3 rounded-xl border border-stone-100 shadow-sm min-w-[70px]">
                      <div className="text-sm font-bold text-[#E67E22] uppercase">
                        {new Date(evt.startDate).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { month: 'short' })}
                      </div>
                      <div className="text-2xl font-bold font-heading text-[#6B3E1E] leading-none">
                        {new Date(evt.startDate).getDate()}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold font-heading text-[#6B3E1E] group-hover:text-[#E67E22] transition-colors line-clamp-2">
                        {evt.title}
                      </h4>
                      <p className="text-xs text-stone-500 mt-1 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {evt.city ? `${evt.city}, ${evt.country}` : (evt.online ? 'En ligne' : 'TBD')}
                      </p>
                    </div>
                  </div>
                  <Link to={`/evenements/${evt.slug}`} className="text-sm font-bold text-[#E67E22] hover:text-[#c96a1a] flex items-center mt-4">
                    {language === 'fr' ? 'S\'inscrire' : 'Register'}
                    <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 9. COMMENT PARTICIPER (CTA) */}
      <section className="merged-section py-20 bg-white">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl font-bold font-heading text-[#6B3E1E]">
              {language === 'fr' ? "Vous aussi, passez à l'action" : 'You too, take action'}
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Users, titleFR: 'Rejoindre le réseau', titleEN: 'Join the network', link: '/rejoindre' },
              { icon: BookOpen, titleFR: 'Se former', titleEN: 'Get trained', link: '/hub/formations' },
              { icon: Heart, titleFR: 'Soutenir un projet', titleEN: 'Support a project', link: '/dons' },
              { icon: Calendar, titleFR: 'Participer aux événements', titleEN: 'Attend events', link: '/evenements' }
            ].map((item, idx) => (
              <Link key={idx} to={item.link}>
                <motion.div 
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  className="bg-[#FAF9F6] p-6 rounded-2xl text-center hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-stone-100 group"
                >
                  <div className="w-12 h-12 mx-auto bg-white rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                    <item.icon className="w-5 h-5 text-[#E67E22]" />
                  </div>
                  <h4 className="font-bold text-[#6B3E1E] group-hover:text-[#E67E22] transition-colors">
                    {tl({ fr: item.titleFR, en: item.titleEN })}
                  </h4>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 10. CTA FINAL */}
      <section className="merged-section py-24 bg-[#6B3E1E] relative overflow-hidden">
        {/* Abstract background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#D4AF37] via-transparent to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-[#E67E22] via-transparent to-transparent"></div>
        </div>
        
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 relative z-10 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-5xl font-bold font-heading text-white mb-8 leading-tight">
              {language === 'fr' 
                ? "Ensemble, faisons avancer l'entrepreneuriat féminin africain."
                : "Together, let's advance African female entrepreneurship."}
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/rejoindre">
                <Button size="lg" className="bg-[#E67E22] hover:bg-[#c96a1a] text-white rounded-full px-8 py-6 font-bold shadow-lg">
                  {language === 'fr' ? 'Rejoindre le FAFE' : 'Join FAFE'}
                </Button>
              </Link>
              <Link to="/projets-sociaux">
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-full px-8 py-6 font-bold">
                  {language === 'fr' ? 'Découvrir nos projets' : 'Discover our projects'}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
