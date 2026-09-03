import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Article, FAFEEvent, EventStatus } from '../../types';
import { fetchArticles } from '../../lib/dataFetching';
import { getPublishedEvents } from '../../lib/events';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { FafeImage } from '../../components/ui/FafeImage';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { DEMO_ARTICLES } from '../../lib/mockData';

type FilterType = 'ALL' | 'NEWS' | 'EVENTS';

type MixedItem = 
  | { type: 'news'; data: Article; date: number }
  | { type: 'event'; data: FAFEEvent; date: number };

const INITIAL_DEMO_EVENTS: FAFEEvent[] = [
  {
    id: "evt-1",
    title: "Sommet FAFE Dakar : Leadership & Financement",
    slug: "sommet-fafe-dakar",
    startDate: Date.now() + 86400000 * 14,
    endDate: Date.now() + 86400000 * 15,
    city: "Dakar",
    country: "Sénégal",
    venue: "Centre International de Conférences Abdou Diouf",
    online: false,
    eventType: "SUMMIT",
    timezone: "GMT",
    registrationRequired: true,
    registrationOpen: true,
    organizer: "FAFE Sénégal",
    shortDescription: "Le grand rassemblement annuel des femmes entrepreneures d'Afrique de l'Ouest.",
    description: "Le grand rassemblement annuel des femmes entrepreneures d'Afrique de l'Ouest.",
    coverImage: "https://images.unsplash.com/photo-1540317580384-e5d43867caa6?auto=format&fit=crop&q=80&w=800",
    status: EventStatus.PUBLISHED,
    capacity: 300,
    price: 0,
    currency: "XOF",
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: "evt-2",
    title: "Masterclass ZLECAf : Exporter ses produits à l'échelle continentale",
    slug: "masterclass-zlecaf-exportation",
    startDate: Date.now() + 86400000 * 22,
    endDate: Date.now() + 86400000 * 22,
    city: "Abidjan",
    country: "Côte d'Ivoire",
    venue: "Plateau & Webinaire Zoom",
    online: true,
    eventType: "MASTERCLASS",
    timezone: "GMT",
    registrationRequired: true,
    registrationOpen: true,
    organizer: "FAFE Hub",
    shortDescription: "Comprendre les nouvelles opportunités tarifaires et logistiques panafricaines.",
    description: "Comprendre les nouvelles opportunités tarifaires et logistiques panafricaines.",
    coverImage: "https://images.unsplash.com/photo-1556761175-5973dc0f32d7?auto=format&fit=crop&q=80&w=800",
    status: EventStatus.PUBLISHED,
    capacity: 500,
    price: 0,
    currency: "XOF",
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];

export function NewsAndEvents() {
  const [filter, setFilter] = useState<FilterType>('ALL');
  // Initialize immediately with demo items for instant visual presentation
  const [items, setItems] = useState<MixedItem[]>(() => {
    const initial: MixedItem[] = [
      ...DEMO_ARTICLES.map(a => ({ type: 'news' as const, data: a, date: a.publishedAt || a.createdAt })),
      ...INITIAL_DEMO_EVENTS.map(e => ({ type: 'event' as const, data: e, date: e.startDate }))
    ];
    return initial.sort((a, b) => b.date - a.date);
  });

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const articles = await fetchArticles();
        const eventsData = await getPublishedEvents(50);
        
        if (isMounted) {
          const mixed: MixedItem[] = [
            ...(articles.length > 0 ? articles : DEMO_ARTICLES).map(a => ({ type: 'news' as const, data: a, date: a.publishedAt || a.createdAt })),
            ...(eventsData.events.length > 0 ? eventsData.events : INITIAL_DEMO_EVENTS).map(e => ({ type: 'event' as const, data: e, date: e.startDate }))
          ];
          mixed.sort((a, b) => b.date - a.date);
          setItems(mixed);
        }
      } catch (err) {
        console.warn("NewsAndEvents background sync notice:", err);
      }
    };
    
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredItems = items.filter(item => {
    if (filter === 'ALL') return true;
    if (filter === 'NEWS') return item.type === 'news';
    if (filter === 'EVENTS') return item.type === 'event';
    return true;
  });

  return (
    <div className="bg-[#FAF9F6] min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-16 pb-14 md:pt-24 md:pb-20 overflow-hidden bg-[#6B3E1E]">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-[350px] h-[350px] bg-[#D4AF37] opacity-10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-[300px] h-[300px] bg-[#E67E22] opacity-10 rounded-full blur-[70px] pointer-events-none" />
        
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 relative z-10 text-center max-w-3xl">
          <span className="text-xs font-bold tracking-widest text-[#D4AF37] uppercase mb-2 block">
            Éditorial & Agenda
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-white mb-4 leading-tight">
            Actualités & Événements
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-white/80 max-w-xl mx-auto mb-8 leading-relaxed">
            Suivez les initiatives du réseau FAFE et participez aux rencontres clés pour les entrepreneures panafricaines.
          </p>
          
          {/* Internal Filter Tabs */}
          <div className="inline-flex bg-white/10 p-1 rounded-full backdrop-blur-md border border-white/20">
            <button 
              onClick={() => setFilter('ALL')}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${filter === 'ALL' ? 'bg-[#E67E22] text-white shadow-md' : 'text-white/80 hover:text-white'}`}
            >
              Tout
            </button>
            <button 
              onClick={() => setFilter('NEWS')}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${filter === 'NEWS' ? 'bg-[#E67E22] text-white shadow-md' : 'text-white/80 hover:text-white'}`}
            >
              Actualités
            </button>
            <button 
              onClick={() => setFilter('EVENTS')}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${filter === 'EVENTS' ? 'bg-[#E67E22] text-white shadow-md' : 'text-white/80 hover:text-white'}`}
            >
              Événements
            </button>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 md:py-16">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 max-w-7xl">
          {filteredItems.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-stone-200">
              <p className="text-stone-500 text-sm">Aucun contenu disponible pour ce filtre.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item) => (
                  <motion.div
                    key={item.type === 'news' ? `news-${item.data.id}` : `evt-${item.data.id}`}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.25 }}
                  >
                    {item.type === 'news' ? (
                      <NewsCard article={item.data as Article} />
                    ) : (
                      <EventCard event={item.data as FAFEEvent} />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function NewsCard({ article }: { article: Article }) {
  return (
    <Link
      to={`/actualites/${article.slug}`}
      className="group bg-white rounded-2xl overflow-hidden border border-stone-100 hover:border-[#E67E22]/30 hover:shadow-xl transition-all duration-300 flex flex-col h-full"
    >
      <div className="relative h-48 overflow-hidden bg-stone-100">
        <FafeImage
          src={article.featuredImage}
          alt={article.title}
          fallbackType="article"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-0.5 bg-white/95 backdrop-blur-sm text-[#E67E22] text-[10px] font-bold uppercase tracking-wider rounded-full shadow-xs">
            Actualité
          </span>
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold font-heading text-[#6B3E1E] mb-2 group-hover:text-[#E67E22] transition-colors line-clamp-2">
          {article.title}
        </h3>
        <p className="text-stone-600 text-xs sm:text-sm mb-4 line-clamp-2 flex-grow leading-relaxed">
          {article.excerpt}
        </p>
        
        <div className="flex items-center justify-between pt-3 border-t border-stone-100">
          <div className="flex items-center text-xs text-stone-500 font-medium">
            <Calendar className="w-3.5 h-3.5 mr-1 text-stone-400" />
            {new Date(article.publishedAt || article.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
          <span className="text-[#E67E22] text-xs font-bold inline-flex items-center group-hover:translate-x-1 transition-transform">
            Lire <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function EventCard({ event }: { event: FAFEEvent }) {
  return (
    <Link
      to={`/evenements/${event.slug}`}
      className="group bg-white rounded-2xl overflow-hidden border border-stone-100 hover:border-[#D4AF37]/30 hover:shadow-xl transition-all duration-300 flex flex-col h-full"
    >
      <div className="relative h-48 overflow-hidden bg-stone-100">
        <FafeImage
          src={event.coverImage}
          alt={event.title}
          fallbackType="article"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-0.5 bg-[#D4AF37] text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-xs">
            Événement
          </span>
        </div>
        
        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm rounded-xl shadow-md overflow-hidden flex flex-col text-center min-w-[3rem]">
          <div className="bg-[#6B3E1E] text-white text-[9px] font-bold uppercase py-0.5 px-2">
            {format(new Date(event.startDate), 'MMM', { locale: fr })}
          </div>
          <div className="text-base font-black text-[#6B3E1E] py-0.5 px-2">
            {format(new Date(event.startDate), 'dd')}
          </div>
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold font-heading text-[#6B3E1E] mb-2 group-hover:text-[#D4AF37] transition-colors line-clamp-2">
          {event.title}
        </h3>
        <p className="text-stone-600 text-xs sm:text-sm mb-3 line-clamp-2 flex-grow leading-relaxed">
          {event.shortDescription}
        </p>
        
        <div className="flex items-center text-xs text-stone-500 mb-4">
          <MapPin className="w-3.5 h-3.5 mr-1 text-[#E67E22] shrink-0" />
          <span className="truncate">{event.online ? 'En ligne (Virtuel)' : (event.city || 'Afrique')}</span>
        </div>
        
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
            {event.status === 'PUBLISHED' ? 'Inscriptions ouvertes' : 'Confirmé'}
          </span>
          <span className="text-[#D4AF37] text-xs font-bold inline-flex items-center group-hover:translate-x-1 transition-transform">
            Participer <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}
