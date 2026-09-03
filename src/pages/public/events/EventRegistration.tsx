import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getEventBySlug, checkRegistrationExists, registerForEvent } from '../../../lib/events';
import { FAFEEvent, EventStatus, EventRegistration as RegistrationType } from '../../../types';
import { useAuthStore } from '../../../store/auth';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { AlertCircle, ArrowLeft, Calendar, CheckCircle2 } from 'lucide-react';

export function EventRegistration() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuthStore();
  
  const [event, setEvent] = useState<FAFEEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    company: '',
    position: '',
    specialRequirements: ''
  });

  useEffect(() => {
    if (slug) {
      loadEvent(slug);
    }
  }, [slug]);

  useEffect(() => {
    if (userProfile && !loading) {
      setFormData(prev => ({
        ...prev,
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        email: currentUser?.email || '',
        phone: userProfile.phoneNumber || '',
        country: userProfile.country || '',
        city: userProfile.city || '',
        company: userProfile.company || '',
        position: userProfile.position || ''
      }));
    }
  }, [userProfile, currentUser, loading]);

  const loadEvent = async (eventSlug: string) => {
    try {
      const data = await getEventBySlug(eventSlug);
      setEvent(data);
      if (data) {
        checkExisting(data.id);
      }
    } catch (error) {
      console.error(error);
      setError("Impossible de charger l'événement.");
    } finally {
      setLoading(false);
    }
  };

  const checkExisting = async (eventId: string) => {
    if (currentUser) {
      const exists = await checkRegistrationExists(eventId, currentUser.uid);
      setAlreadyRegistered(exists);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;
    
    setSubmitting(true);
    setError(null);

    try {
      if (!currentUser) {
        // Also check by email if guest
        const exists = await checkRegistrationExists(event.id, undefined, formData.email);
        if (exists) {
          throw new Error("Une inscription existe déjà avec cette adresse email.");
        }
      }

      const regData: Partial<RegistrationType> = {
        ...formData,
        userId: currentUser?.uid
      };

      const result = await registerForEvent(event, regData);
      // Pass reference to success page via state
      navigate('/evenements/inscription/succes', { state: { reference: result.registrationReference, eventTitle: event.title } });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Une erreur est survenue lors de l'inscription.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-[#E67E22] border-t-transparent rounded-full"></div></div>;
  }

  if (!event) return <div className="text-center py-20">Événement introuvable</div>;

  if (alreadyRegistered) {
    return (
      <div className="bg-[#FAF9F6] min-h-[80vh] flex items-center justify-center py-16">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-stone-100 max-w-lg w-full text-center">
          <div className="w-16 h-16 bg-[#E67E22]/10 text-[#E67E22] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-heading text-[#6B3E1E] mb-4">Vous êtes déjà inscrit</h2>
          <p className="text-stone-600 mb-8">Vous avez déjà validé votre inscription pour l'événement <strong>{event.title}</strong>.</p>
          <div className="space-y-4">
            <Link to="/hub/dashboard/evenements">
              <Button className="w-full bg-[#E67E22] hover:bg-[#c96a1a] text-white">Voir mes inscriptions</Button>
            </Link>
            <Link to={`/evenements/${event.slug}`}>
              <Button variant="outline" className="w-full">Retour à l'événement</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isRegistrationClosed = event.status === EventStatus.REGISTRATION_CLOSED || 
                               (event.registrationDeadline && Date.now() > event.registrationDeadline);

  if (isRegistrationClosed) {
    return (
      <div className="bg-[#FAF9F6] min-h-[80vh] flex items-center justify-center py-16">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-stone-100 max-w-lg w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold font-heading text-[#6B3E1E] mb-4">Inscriptions clôturées</h2>
          <p className="text-stone-600 mb-8">Les inscriptions pour <strong>{event.title}</strong> sont fermées.</p>
          <Link to={`/evenements/${event.slug}`}>
            <Button variant="outline" className="w-full">Retour à l'événement</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF9F6] min-h-screen pt-24 pb-16">
      <div className="w-full max-w-7xl mx-auto px-4 max-w-3xl">
        <Link to={`/evenements/${event.slug}`} className="inline-flex items-center gap-2 text-stone-500 hover:text-[#E67E22] mb-8 font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour à l'événement
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="bg-[#6B3E1E] text-white p-8 md:p-10">
            <div className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-bold tracking-wide uppercase mb-4">
              Formulaire d'inscription
            </div>
            <h1 className="text-2xl md:text-3xl font-bold font-heading mb-2">{event.title}</h1>
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <Calendar className="w-4 h-4" />
              {new Date(event.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-6">
            {!currentUser && (
               <div className="bg-[#E67E22]/10 border border-[#E67E22]/20 text-[#E67E22] p-4 rounded-xl text-sm flex gap-3">
                 <AlertCircle className="w-5 h-5 shrink-0" />
                 <p>Vous n'êtes pas connecté. <Link to="/hub/connexion" className="font-bold underline">Connectez-vous</Link> pour pré-remplir ce formulaire et retrouver vos billets dans votre espace membre.</p>
               </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
                {error}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-700">Prénom *</label>
                <Input required name="firstName" value={formData.firstName} onChange={handleChange} className="bg-[#FAF9F6] border-stone-200" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-700">Nom *</label>
                <Input required name="lastName" value={formData.lastName} onChange={handleChange} className="bg-[#FAF9F6] border-stone-200" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-700">Email *</label>
                <Input required type="email" name="email" value={formData.email} onChange={handleChange} className="bg-[#FAF9F6] border-stone-200" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-700">Téléphone *</label>
                <Input required name="phone" value={formData.phone} onChange={handleChange} className="bg-[#FAF9F6] border-stone-200" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-700">Pays *</label>
                <Input required name="country" value={formData.country} onChange={handleChange} className="bg-[#FAF9F6] border-stone-200" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-700">Ville *</label>
                <Input required name="city" value={formData.city} onChange={handleChange} className="bg-[#FAF9F6] border-stone-200" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-700">Entreprise</label>
                <Input name="company" value={formData.company} onChange={handleChange} className="bg-[#FAF9F6] border-stone-200" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-700">Fonction</label>
                <Input name="position" value={formData.position} onChange={handleChange} className="bg-[#FAF9F6] border-stone-200" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700">Besoins spécifiques (Optionnel)</label>
              <textarea 
                name="specialRequirements" 
                value={formData.specialRequirements} 
                onChange={handleChange} 
                className="w-full rounded-md border border-stone-200 bg-[#FAF9F6] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E67E22] min-h-[100px]"
                placeholder="Allergies, accessibilité..."
              />
            </div>

            {event.price !== undefined && (
              <div className="bg-[#FAF9F6] p-6 rounded-xl border border-stone-200 flex items-center justify-between mt-8">
                <span className="font-bold text-stone-800">Total à régler</span>
                <span className="text-xl font-bold text-[#E67E22]">
                  {event.price === 0 ? 'Gratuit' : `${event.price} ${event.currency || 'FCFA'}`}
                </span>
              </div>
            )}

            <Button type="submit" disabled={submitting} className="w-full bg-[#6B3E1E] hover:bg-[#522d14] text-white py-6 font-bold text-lg mt-8 rounded-xl">
              {submitting ? 'Traitement en cours...' : (event.price === 0 || event.price === undefined ? 'Confirmer l\'inscription' : 'Passer au paiement')}
            </Button>
            <p className="text-center text-xs text-stone-400 mt-4">
              En vous inscrivant, vous acceptez les conditions générales de participation du FAFE.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
