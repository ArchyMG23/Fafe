import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Article, FAFEEvent } from '../../types';
import { fetchArticles } from '../../lib/dataFetching';
import { getPublishedEvents } from '../../lib/events';
import { Loader2, Calendar, MapPin, ArrowRight, User } from 'lucide-react';
import { FafeImage } from '../../components/ui/FafeImage';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '../../components/ui/Button';

type FilterType = 'ALL' | 'NEWS' | 'EVENTS';

type MixedItem = 
  | { type: 'news'; data: Article; date: number }
  | { type: 'event'; data: FAFEEvent; date: number };

export function NewsAndEvents() {
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<MixedItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const articles = await fetchArticles();
        const eventsData = await getPublishedEvents(50);
        
        const mixed: MixedItem[] = [
          ...articles.map(a => ({ type: 'news' as const, data: a, date: a.publishedAt || a.createdAt })),
          ...eventsData.events.map(e => ({ type: 'event' as const, data: e, date: e.startDate }))
        ];
        
        // Sort by date descending
        mixed.sort((a, b) => b.date - a.date);
        setItems(mixed);
      } catch (err) {
        console.error("Error fetching news and events", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
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
      <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-24 overflow-hidden bg-[#6B3E1E]">
        <div className="absolute top-0 right-0 -mt-32 -mr-32 w-[500px] h-[500px] bg-[#D4AF37] opacity-10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 -mb-32 -ml-32 w-[400px] h-[400px] bg-[#E67E22] opacity-10 rounded-full blur-[80px]"></div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-white mb-6">
            Actualités
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10">
            Suivez les dernières actualités du réseau FAFE et participez à nos prochains événements exclusifs pour les entrepreneures africaines.
          </p>
          
          {/* Navigation interne */}
          <div className="inline-flex bg-white/10 p-1.5 rounded-full backdrop-blur-md border border-white/20">
            <button 
              onClick={() => setFilter('ALL')}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${filter === 'ALL' ? 'bg-[#E67E22] text-white shadow-lg' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
            >
              Tout
            </button>
            <button 
              onClick={() => setFilter('NEWS')}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${filter === 'NEWS' ? 'bg-[#E67E22] text-white shadow-lg' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
            >
              Actualités
            </button>
            <button 
              onClick={() => setFilter('EVENTS')}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${filter === 'EVENTS' ? 'bg-[#E67E22] text-white shadow-lg' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
            >
              Événements
            </button>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          {loading ? (
            <div className="flex justify-center p-20">
              <Loader2 className="w-12 h-12 animate-spin text-[#E67E22]" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center p-20 bg-white rounded-3xl border border-stone-200">
              <p className="text-stone-500 text-lg">Aucun contenu disponible pour le moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item, idx) => (
                  <motion.div
                    key={item.type === 'news' ? `news-${item.data.id}` : `evt-${item.data.id}`}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
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
    <Link to={`/actualites/${article.slug}`} className="group bg-white rounded-2xl overflow-hidden border border-stone-200 hover:border-[#E67E22]/30 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      <div className="relative h-56 overflow-hidden bg-stone-100">
        {article.featuredImage ? (
          <FafeImage src={article.featuredImage} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-300">Sans image</div>
        )}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-[#E67E22] text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">
            Actualité
          </span>
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold font-heading text-[#6B3E1E] mb-3 group-hover:text-[#E67E22] transition-colors line-clamp-2">
          {article.title}
        </h3>
        <p className="text-stone-600 text-sm mb-6 line-clamp-3 flex-grow">
          {article.excerpt}
        </p>
        
        <div className="flex items-center justify-between pt-4 border-t border-stone-100">
          <div className="flex items-center text-xs text-stone-500 font-medium">
            <Calendar className="w-4 h-4 mr-1.5" />
            {new Date(article.publishedAt || article.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <span className="text-[#E67E22] group-hover:translate-x-1 transition-transform">
            <ArrowRight className="w-5 h-5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function EventCard({ event }: { event: FAFEEvent }) {
  return (
    <Link to={`/evenements/${event.slug}`} className="group bg-white rounded-2xl overflow-hidden border border-stone-200 hover:border-[#D4AF37]/30 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      <div className="relative h-56 overflow-hidden bg-stone-100">
        {event.coverImage ? (
          <FafeImage src={event.coverImage} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-300">Sans image</div>
        )}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-[#D4AF37] text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">
            Événement
          </span>
        </div>
        
        <div className="absolute bottom-4 right-4 bg-white rounded-xl shadow-lg overflow-hidden flex flex-col text-center min-w-[3.5rem]">
          <div className="bg-[#6B3E1E] text-white text-[10px] font-bold uppercase py-1 px-2">
            {format(new Date(event.startDate), 'MMM', { locale: fr })}
          </div>
          <div className="text-lg font-black text-[#6B3E1E] py-1 px-2">
            {format(new Date(event.startDate), 'dd')}
          </div>
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold font-heading text-[#6B3E1E] mb-3 group-hover:text-[#D4AF37] transition-colors line-clamp-2">
          {event.title}
        </h3>
        <p className="text-stone-600 text-sm mb-4 line-clamp-2 flex-grow">
          {event.shortDescription}
        </p>
        
        <div className="space-y-2 mb-6">
          <div className="flex items-center text-sm text-stone-500">
            <MapPin className="w-4 h-4 mr-2 text-stone-400" />
            <span className="truncate">{event.online ? 'En ligne' : (event.city || 'Lieu à confirmer')}</span>
          </div>
        </div>
        
        <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            event.status === 'PUBLISHED' ? 'bg-green-50 text-green-600' : 'bg-stone-100 text-stone-600'
          }`}>
            {event.status === 'PUBLISHED' ? 'À venir' : 'Passé'}
          </span>
          <span className="text-[#D4AF37] group-hover:translate-x-1 transition-transform">
            <ArrowRight className="w-5 h-5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
