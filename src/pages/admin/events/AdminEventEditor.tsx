import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, setDoc, collection } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { DEMO_EVENTS } from '../../../lib/mockData';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { AdminPageHeader } from '../../../components/admin/AdminPageHeader';
import { ArrowLeft, Save, Loader2, Calendar, Globe, MapPin, Eye } from 'lucide-react';

export function AdminEventEditor() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'nouveau';
  const navigate = useNavigate();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'REGISTRATION_OPEN' | 'REGISTRATION_CLOSED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'>('REGISTRATION_OPEN');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [online, setOnline] = useState(false);
  const [city, setCity] = useState('Dakar');
  const [country, setCountry] = useState('Sénégal');
  const [addressOrLink, setAddressOrLink] = useState('');
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1540317580384-e5d43867caa6?auto=format&fit=crop&w=800&q=80');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState<number>(500);
  const [price, setPrice] = useState<number>(0);
  const [registrationEnabled, setRegistrationEnabled] = useState(true);

  useEffect(() => {
    if (isNew) {
      const tomorrow = new Date(Date.now() + 86400000 * 14);
      setStartDate(tomorrow.toISOString().slice(0, 16));
      const endDay = new Date(Date.now() + 86400000 * 16);
      setEndDate(endDay.toISOString().slice(0, 16));
      return;
    }

    const loadEvent = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'events', id);
        const snap = await getDoc(docRef);
        let data: any = null;

        if (snap.exists()) {
          data = snap.data();
        } else {
          // Check fallback demo events
          const fallback = DEMO_EVENTS.find(e => e.id === id || e.slug === id);
          if (fallback) {
            data = fallback;
          }
        }

        if (data) {
          setTitle(data.title || '');
          setSlug(data.slug || '');
          setStatus(data.status || 'REGISTRATION_OPEN');
          if (data.startDate) {
            setStartDate(new Date(data.startDate).toISOString().slice(0, 16));
          }
          if (data.endDate) {
            setEndDate(new Date(data.endDate).toISOString().slice(0, 16));
          }
          setOnline(Boolean(data.online));
          setCity(data.city || 'Dakar');
          setCountry(data.country || 'Sénégal');
          setAddressOrLink(data.location?.address || data.location?.link || '');
          setCoverImage(data.coverImage || '');
          setShortDescription(data.shortDescription || '');
          setDescription(data.description || '');
          setCapacity(data.capacity || 500);
          setPrice(data.price || 0);
          setRegistrationEnabled(data.registrationEnabled ?? true);
        }
      } catch (err) {
        console.error("Error loading event:", err);
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id, isNew]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (isNew && !slug) {
      setSlug(
        val
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "")
      );
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const eventId = isNew ? (slug || doc(collection(db, 'events')).id) : id;

      const eventData = {
        title,
        slug: finalSlug,
        status,
        startDate: new Date(startDate).getTime() || Date.now(),
        endDate: new Date(endDate).getTime() || Date.now(),
        online,
        city: online ? 'En ligne' : city,
        country: online ? 'Panafricain' : country,
        location: {
          type: online ? 'VIRTUAL' : 'PHYSICAL',
          ...(online ? { link: addressOrLink } : { address: addressOrLink })
        },
        coverImage,
        shortDescription,
        description,
        capacity: Number(capacity) || 0,
        price: Number(price) || 0,
        currency: 'XOF',
        registrationEnabled,
        updatedAt: Date.now(),
        ...(isNew ? { createdAt: Date.now() } : {})
      };

      await setDoc(doc(db, 'events', eventId), eventData, { merge: true });
      navigate('/admin/evenements');
    } catch (err) {
      console.error("Error saving event:", err);
      alert("Erreur lors de l'enregistrement de l'événement.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#00843D]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin/evenements">
            <Button variant="outline" size="sm" className="rounded-full w-9 h-9 p-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold font-heading text-[#063F3A]">
              {isNew ? "Créer un événement" : `Modifier : ${title || 'Événement'}`}
            </h1>
            <p className="text-xs text-stone-500">
              Les informations saisies ici alimentent directement l'accueil FAFE et la page de présentation publique.
            </p>
          </div>
        </div>

        {!isNew && (
          <a
            href={`/evenements/${slug || id}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#00843D] bg-[#00843D]/10 hover:bg-[#00843D]/20 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Eye className="w-3.5 h-3.5" /> Voir la page publique
          </a>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6 bg-white p-6 md:p-8 rounded-2xl border border-stone-200 shadow-sm">
        {/* Basic Info */}
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Titre de l'événement *
            </label>
            <Input
              value={title}
              onChange={e => handleTitleChange(e.target.value)}
              required
              placeholder="Ex: Sommet FAFE Dakar : Leadership & Financement"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Slug (Identifiant URL unique) *
            </label>
            <Input
              value={slug}
              onChange={e => setSlug(e.target.value)}
              required
              placeholder="sommet-fafe-dakar"
            />
          </div>
        </div>

        {/* Cover Image */}
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
            Image de couverture (URL) *
          </label>
          <div className="flex gap-4 items-start">
            <Input
              value={coverImage}
              onChange={e => setCoverImage(e.target.value)}
              required
              placeholder="https://images.unsplash.com/..."
              className="flex-1"
            />
            {coverImage && (
              <div className="w-24 h-16 rounded-xl overflow-hidden border border-stone-200 shrink-0 bg-stone-50">
                <img
                  src={coverImage}
                  alt="Aperçu"
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as any).style.display = 'none'; }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Dates & Times */}
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#00843D]" /> Date & Heure de début *
            </label>
            <Input
              type="datetime-local"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-stone-400" /> Date & Heure de fin
            </label>
            <Input
              type="datetime-local"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* Format & Location */}
        <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-4">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={online}
                onChange={e => setOnline(e.target.checked)}
                className="w-4 h-4 rounded border-stone-300 text-[#00843D] focus:ring-[#00843D]"
              />
              <span className="text-sm font-bold text-stone-800 flex items-center gap-1">
                <Globe className="w-4 h-4 text-[#C8102E]" /> Événement virtuel (En ligne)
              </span>
            </label>
          </div>

          {!online ? (
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Ville *</label>
                <Input value={city} onChange={e => setCity(e.target.value)} required={!online} placeholder="Dakar" />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Pays *</label>
                <Input value={country} onChange={e => setCountry(e.target.value)} required={!online} placeholder="Sénégal" />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Lieu / Adresse</label>
                <Input
                  value={addressOrLink}
                  onChange={e => setAddressOrLink(e.target.value)}
                  placeholder="Centre International de Conférences (CICAD)"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Lien de visioconférence (Zoom, Teams, etc.)</label>
              <Input
                value={addressOrLink}
                onChange={e => setAddressOrLink(e.target.value)}
                placeholder="https://zoom.us/j/..."
              />
            </div>
          )}
        </div>

        {/* Descriptions */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Description courte (Visible sur la carte d'accueil) *
            </label>
            <Input
              value={shortDescription}
              onChange={e => setShortDescription(e.target.value)}
              required
              placeholder="Une à deux phrases synthétiques pour inciter à la participation..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Description complète du programme & détails
            </label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={5}
              placeholder="Présentez les intervenants, les ateliers prévus, les modalités pratiques..."
            />
          </div>
        </div>

        {/* Status, Capacity & Inscriptions */}
        <div className="grid md:grid-cols-4 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Statut
            </label>
            <select
              className="w-full h-10 px-3 rounded-lg border border-stone-200 bg-white text-sm focus:ring-2 focus:ring-[#00843D]"
              value={status}
              onChange={e => setStatus(e.target.value as any)}
            >
              <option value="REGISTRATION_OPEN">Inscriptions ouvertes</option>
              <option value="PUBLISHED">Publié (Bientôt)</option>
              <option value="REGISTRATION_CLOSED">Inscriptions fermées</option>
              <option value="ONGOING">En cours</option>
              <option value="COMPLETED">Terminé</option>
              <option value="DRAFT">Brouillon (Masqué)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Capacité maximale
            </label>
            <Input
              type="number"
              value={capacity}
              onChange={e => setCapacity(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Tarif (XOF, 0 = Gratuit)
            </label>
            <Input
              type="number"
              value={price}
              onChange={e => setPrice(Number(e.target.value))}
            />
          </div>

          <div className="flex items-center pt-5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={registrationEnabled}
                onChange={e => setRegistrationEnabled(e.target.checked)}
                className="w-4 h-4 rounded border-stone-300 text-[#00843D] focus:ring-[#00843D]"
              />
              <span className="text-xs font-bold text-stone-800">Bouton d'inscription actif</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-stone-100">
          <Link to="/admin/evenements">
            <Button type="button" variant="outline">
              Annuler
            </Button>
          </Link>
          <Button type="submit" disabled={saving} className="bg-[#00843D] hover:bg-[#006A31] text-white font-bold px-6">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {isNew ? "Créer et publier" : "Enregistrer les modifications"}
          </Button>
        </div>
      </form>
    </div>
  );
}
