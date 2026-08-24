import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPublishedEvents } from '../../../lib/events';
import { FAFEEvent } from '../../../types';
import { Calendar, MapPin, Search } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export function EventList() {
  const [events, setEvents] = useState<FAFEEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await getPublishedEvents(50); // Get more for client-side filtering
      setEvents(data.events);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase()) || 
                          event.shortDescription?.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'ALL' || event.eventType === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="bg-[#FAF9F6] min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-heading text-[#6B3E1E] mb-4">Événements</h1>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            Participez à nos forums, salons, webinaires et rencontres professionnelles.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex flex-col md:flex-row gap-4 mb-12">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input 
              type="text" 
              placeholder="Rechercher un événement..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#E67E22] transition-all"
            />
          </div>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#E67E22] transition-all"
          >
            <option value="ALL">Tous les types</option>
            <option value="FORUM">Forum</option>
            <option value="CONFERENCE">Conférence</option>
            <option value="WEBINAR">Webinaire</option>
            <option value="ATELIER">Atelier</option>
            <option value="RENCONTRE">Rencontre</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-[#E67E22] border-t-transparent rounded-full"></div></div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-stone-100">
            <Calendar className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-stone-700">Aucun événement à venir</h3>
            <p className="text-stone-500 mt-2">Revenez bientôt pour découvrir nos prochains événements.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <Link key={event.id} to={`/evenements/${event.slug}`} className="group h-full">
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                  <div className="h-48 bg-stone-200 relative overflow-hidden">
                    {event.coverImage ? (
                      <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#E67E22]/10 text-[#E67E22]">
                        <Calendar className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#E67E22] shadow-sm">
                      {event.eventType}
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold font-heading text-[#6B3E1E] mb-2 group-hover:text-[#E67E22] transition-colors">{event.title}</h3>
                    <p className="text-stone-600 text-sm mb-4 line-clamp-2">{event.shortDescription}</p>
                    <div className="mt-auto space-y-2 text-sm text-stone-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#E67E22]" />
                        <span>{new Date(event.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#E67E22]" />
                        <span>{event.online ? 'En ligne' : `${event.city}, ${event.country}`}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
