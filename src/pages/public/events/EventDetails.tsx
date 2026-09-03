import { FafeImage } from '../../../components/ui/FafeImage';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEventBySlug } from '../../../lib/events';
import { FAFEEvent, EventStatus } from '../../../types';
import { Calendar, MapPin, Clock, Globe2, AlertCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export function EventDetails() {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<FAFEEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      loadEvent(slug);
    }
  }, [slug]);

  const loadEvent = async (eventSlug: string) => {
    try {
      const data = await getEventBySlug(eventSlug);
      setEvent(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-[#E67E22] border-t-transparent rounded-full"></div></div>;
  }

  if (!event) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <h2 className="text-3xl font-bold font-heading text-[#6B3E1E] mb-4">Événement introuvable</h2>
        <Link to="/evenements"><Button variant="outline">Retour aux événements</Button></Link>
      </div>
    );
  }

  const isRegistrationClosed = event.status === EventStatus.REGISTRATION_CLOSED || 
                               (event.registrationDeadline && Date.now() > event.registrationDeadline);
  const isCompleted = event.status === EventStatus.COMPLETED;
  const isCancelled = event.status === EventStatus.CANCELLED;

  return (
    <div className="bg-[#FAF9F6] min-h-screen pt-24 pb-16">
      <div className="w-full max-w-7xl mx-auto px-4 max-w-5xl">
        <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
          {/* Cover */}
          <div className="h-64 md:h-96 bg-stone-200 relative">
            {event.coverImage ? (
              <FafeImage src={event.coverImage} alt={event.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-[#6B3E1E] to-[#8E5B35]">
                <Calendar className="w-20 h-20 text-white/20" />
              </div>
            )}
            <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold text-[#E67E22] shadow-sm uppercase tracking-wide">
              {event.eventType}
            </div>
          </div>

          <div className="p-8 md:p-12">
            <h1 className="text-3xl md:text-5xl font-bold font-heading text-[#6B3E1E] mb-6 leading-tight">
              {event.title}
            </h1>
            
            <div className="grid md:grid-cols-3 gap-8 md:gap-12 mb-12">
              <div className="md:col-span-2 prose prose-stone max-w-none">
                <p className="text-lg text-stone-600 mb-8 font-medium">{event.shortDescription}</p>
                <div dangerouslySetInnerHTML={{ __html: event.description }} className="text-stone-600" />
              </div>

              {/* Sidebar Info */}
              <div className="space-y-6">
                <div className="bg-[#FAF9F6] p-6 rounded-2xl border border-stone-100">
                  <h3 className="font-bold text-[#6B3E1E] mb-4 text-lg border-b border-stone-200 pb-2">Informations pratiques</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-[#E67E22] mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-stone-800">Date</p>
                        <p className="text-sm text-stone-600">{new Date(event.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-[#E67E22] mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-stone-800">Heure</p>
                        <p className="text-sm text-stone-600">
                          {new Date(event.startDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} 
                          {' - '} 
                          {new Date(event.endDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-xs text-stone-400">{event.timezone}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      {event.online ? (
                        <Globe2 className="w-5 h-5 text-[#E67E22] mt-0.5 shrink-0" />
                      ) : (
                        <MapPin className="w-5 h-5 text-[#E67E22] mt-0.5 shrink-0" />
                      )}
                      <div>
                        <p className="font-medium text-stone-800">Lieu</p>
                        <p className="text-sm text-stone-600">{event.online ? 'Événement en ligne' : event.venue}</p>
                        {!event.online && <p className="text-xs text-stone-500">{event.city}, {event.country}</p>}
                      </div>
                    </div>
                    
                    {event.price !== undefined && (
                      <div className="flex items-start gap-3 pt-4 border-t border-stone-200">
                        <div className="w-5 h-5 rounded-full bg-[#E67E22]/10 flex items-center justify-center text-[#E67E22] font-bold shrink-0 mt-0.5">€</div>
                        <div>
                          <p className="font-medium text-stone-800">Tarif</p>
                          <p className="text-sm text-stone-600 font-bold">{event.price === 0 ? 'Participation gratuite' : `${event.price} ${event.currency || 'FCFA'}`}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2">
                  {isCancelled ? (
                     <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 border border-red-100">
                       <AlertCircle className="w-5 h-5" />
                       <span className="font-bold">Événement annulé</span>
                     </div>
                  ) : isCompleted ? (
                     <div className="bg-stone-100 text-stone-600 p-4 rounded-xl text-center border border-stone-200 font-bold">
                       Événement terminé
                     </div>
                  ) : isRegistrationClosed ? (
                     <div className="bg-stone-100 text-stone-600 p-4 rounded-xl text-center border border-stone-200 font-bold">
                       Inscriptions clôturées
                     </div>
                  ) : event.registrationRequired ? (
                    <Link to={`/evenements/${event.slug}/inscription`}>
                      <Button className="w-full bg-[#E67E22] hover:bg-[#c96a1a] text-white py-6 font-bold text-lg rounded-xl shadow-md">
                        S'inscrire à l'événement
                      </Button>
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
