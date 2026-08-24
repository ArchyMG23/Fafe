import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store/auth';
import { collection, query, where, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { EventRegistration, FAFEEvent } from '../../../types';
import { Link } from 'react-router-dom';
import { Calendar, Download, MapPin, Search } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export function MemberEvents() {
  const { currentUser } = useAuthStore();
  const [registrations, setRegistrations] = useState<(EventRegistration & { eventData?: FAFEEvent })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadRegistrations();
    }
  }, [currentUser]);

  const loadRegistrations = async () => {
    try {
      const q = query(
        collection(db, 'eventRegistrations'),
        where('userId', '==', currentUser?.uid),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const regs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EventRegistration));
      
      // Fetch associated events
      const regsWithEvents = await Promise.all(regs.map(async (reg) => {
        const eventRef = doc(db, 'events', reg.eventId);
        const eventSnap = await getDoc(eventRef);
        if (eventSnap.exists()) {
          return { ...reg, eventData: { id: eventSnap.id, ...eventSnap.data() } as FAFEEvent };
        }
        return reg;
      }));
      
      setRegistrations(regsWithEvents);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><div className="animate-spin w-8 h-8 border-4 border-[#E67E22] border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-heading text-[#6B3E1E]">Mes événements</h2>
          <p className="text-stone-500">Gérez vos inscriptions et téléchargez vos certificats</p>
        </div>
        <Link to="/evenements">
          <Button className="bg-[#E67E22] hover:bg-[#c96a1a] text-white">Découvrir les événements</Button>
        </Link>
      </div>

      {registrations.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-stone-100 text-center">
          <Calendar className="w-16 h-16 text-stone-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-stone-700">Aucune inscription</h3>
          <p className="text-stone-500 mt-2">Vous n'êtes inscrit(e) à aucun événement pour le moment.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {registrations.map(reg => (
            <div key={reg.id} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="w-full md:w-48 h-32 bg-stone-100 rounded-xl overflow-hidden shrink-0 relative">
                {reg.eventData?.coverImage ? (
                  <img src={reg.eventData.coverImage} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-400"><Calendar /></div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-stone-100 text-stone-600 rounded-md text-xs font-bold">{reg.status}</span>
                  {reg.attended && <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold">Présent(e)</span>}
                </div>
                <h3 className="text-lg font-bold text-[#6B3E1E] mb-2">{reg.eventData?.title || 'Événement'}</h3>
                
                <div className="flex flex-col sm:flex-row gap-4 text-sm text-stone-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-[#E67E22]" />
                    {reg.eventData ? new Date(reg.eventData.startDate).toLocaleDateString('fr-FR') : 'Date inconnue'}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-[#E67E22]" />
                    {reg.eventData?.online ? 'En ligne' : reg.eventData?.city}
                  </div>
                </div>

                <div className="bg-stone-50 p-3 rounded-lg flex items-center justify-between">
                  <span className="text-xs text-stone-500 font-medium uppercase">Référence: {reg.registrationReference}</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 w-full md:w-auto shrink-0">
                {reg.eventData && (
                  <Link to={`/evenements/${reg.eventData.slug}`}>
                    <Button variant="outline" className="w-full">Voir l'événement</Button>
                  </Link>
                )}
                {reg.attended && reg.eventData?.certificateEnabled && (
                  <Button className="w-full bg-[#D4AF37] hover:bg-[#b5952f] text-white">
                    <Download className="w-4 h-4 mr-2" /> Certificat
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
