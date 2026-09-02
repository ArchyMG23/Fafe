import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../store/auth';
import { Entrepreneur } from '../../types';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { 
  Loader2, AlertCircle, CheckCircle2, Info, ArrowRight, 
  ExternalLink, Sparkles, Building2, MapPin, Globe, ShieldCheck 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AFRICAN_COUNTRIES, SECTORS } from '../../lib/constants';

export function MemberEntrepreneurProfile() {
  const { currentUser, userProfile } = useAuthStore();
  
  const [profile, setProfile] = useState<Entrepreneur | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const isMemberActive = userProfile?.membershipStatus === 'ACTIVE';

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    position: '',
    country: '',
    city: '',
    sector: '',
    website: '',
    description: '',
    expertise: '',
    productsServices: '',
    professionalPhoto: '',
    socialLinks: {
      linkedin: '',
      twitter: '',
      facebook: '',
      instagram: '',
      whatsapp: ''
    }
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser) return;
      try {
        const q = query(collection(db, 'entrepreneurs'), where('ownerId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const docItem = querySnapshot.docs[0];
          const data = { id: docItem.id, ...docItem.data() } as Entrepreneur;
          setProfile(data);
          
          setFormData({
            firstName: data.firstName || userProfile?.firstName || '',
            lastName: data.lastName || userProfile?.lastName || '',
            company: data.company || userProfile?.company || '',
            position: data.position || userProfile?.position || '',
            country: data.country || userProfile?.country || '',
            city: data.city || userProfile?.city || '',
            sector: data.sector || userProfile?.sector || '',
            website: data.website || userProfile?.website || '',
            description: data.description || userProfile?.bio || '',
            expertise: data.expertise?.join(', ') || userProfile?.expertise || '',
            productsServices: data.productsServices?.join(', ') || '',
            professionalPhoto: data.professionalPhoto || userProfile?.photoURL || '',
            socialLinks: {
              linkedin: data.socialLinks?.linkedin || userProfile?.socialLinks?.linkedin || '',
              twitter: data.socialLinks?.twitter || userProfile?.socialLinks?.twitter || '',
              facebook: data.socialLinks?.facebook || userProfile?.socialLinks?.facebook || '',
              instagram: data.socialLinks?.instagram || userProfile?.socialLinks?.instagram || '',
              whatsapp: data.socialLinks?.whatsapp || userProfile?.socialLinks?.whatsapp || ''
            }
          });
        } else if (userProfile) {
          setFormData(prev => ({
            ...prev,
            firstName: userProfile.firstName || '',
            lastName: userProfile.lastName || '',
            company: userProfile.company || '',
            position: userProfile.position || '',
            country: userProfile.country || '',
            city: userProfile.city || '',
            sector: userProfile.sector || '',
            website: userProfile.website || '',
            description: userProfile.bio || '',
            expertise: userProfile.expertise || '',
            professionalPhoto: userProfile.photoURL || '',
            socialLinks: {
              linkedin: userProfile.socialLinks?.linkedin || '',
              twitter: userProfile.socialLinks?.twitter || '',
              facebook: userProfile.socialLinks?.facebook || '',
              instagram: userProfile.socialLinks?.instagram || '',
              whatsapp: userProfile.socialLinks?.whatsapp || ''
            }
          }));
        }
      } catch (err) {
        console.error("Error fetching entrepreneur profile", err);
        setError("Erreur lors du chargement de votre profil.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [currentUser, userProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('social_')) {
      const socialKey = name.split('_')[1];
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialKey]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    
    try {
      if (!currentUser) throw new Error("Non authentifié");
      
      const expertiseArray = formData.expertise.split(',').map(s => s.trim()).filter(Boolean);
      const productsArray = formData.productsServices.split(',').map(s => s.trim()).filter(Boolean);
      
      const now = Date.now();
      const targetStatus = isMemberActive ? 'APPROVED' : (profile?.status || 'PENDING');
      const targetVerification = isMemberActive ? 'VERIFIED' : (profile?.verificationStatus || 'UNVERIFIED');

      const profileData: Partial<Entrepreneur> = {
        ownerId: currentUser.uid,
        firstName: formData.firstName,
        lastName: formData.lastName,
        company: formData.company,
        position: formData.position,
        country: formData.country,
        city: formData.city,
        sector: formData.sector,
        website: formData.website,
        description: formData.description,
        expertise: expertiseArray,
        productsServices: productsArray,
        professionalPhoto: formData.professionalPhoto,
        socialLinks: formData.socialLinks,
        status: targetStatus,
        verificationStatus: targetVerification,
        membershipNumber: userProfile?.membershipNumber || profile?.membershipNumber || '',
        updatedAt: now
      };
      
      if (profile?.id) {
        // Update existing document
        await updateDoc(doc(db, 'entrepreneurs', profile.id), profileData);
        setSuccess(isMemberActive 
          ? "Votre profil a été mis à jour et est en ligne dans l'Annuaire Panafricain !" 
          : "Votre profil a été sauvegardé. Il sera activé dans l'Annuaire dès validation de votre adhésion.");
        setProfile({ ...profile, ...profileData } as Entrepreneur);
      } else {
        // Create new document
        const newProfile = {
          ...profileData,
          createdAt: now
        };
        const docRef = await addDoc(collection(db, 'entrepreneurs'), newProfile);
        setSuccess(isMemberActive 
          ? "Fiche créée et publiée avec succès dans l'Annuaire Panafricain !" 
          : "Votre profil a été soumis. Activez votre adhésion pour le rendre public dans l'Annuaire.");
        setProfile({ id: docRef.id, ...newProfile } as Entrepreneur);
      }

      // Also update mirror fields in user profile
      try {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          firstName: formData.firstName,
          lastName: formData.lastName,
          company: formData.company,
          position: formData.position,
          country: formData.country,
          city: formData.city,
          sector: formData.sector,
          bio: formData.description,
          photoURL: formData.professionalPhoto,
          website: formData.website,
          updatedAt: now
        });
      } catch (userErr) {
        console.warn("Could not sync user profile mirror:", userErr);
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Une erreur est survenue lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#E67E22] mb-3" />
        <p className="text-stone-500 text-sm">Chargement de votre profil entrepreneure...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-[#6B3E1E]">Profil Entrepreneure & Annuaire</h2>
          <p className="text-[#6B3E1E]/70 text-sm mt-1">
            Complétez votre fiche professionnelle pour être visible auprès des investisseurs, partenaires et clientes du réseau panafricain.
          </p>
        </div>

        {profile && profile.status === 'APPROVED' && (
          <Link to={`/hub/annuaire/${profile.id}`}>
            <Button variant="outline" className="text-[#E67E22] border-[#E67E22]/30 hover:bg-orange-50 font-bold text-sm">
              <Globe className="w-4 h-4 mr-2" /> Voir ma fiche publique
            </Button>
          </Link>
        )}
      </div>

      {/* Membership Status & Directory Activation Banner */}
      {!isMemberActive ? (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-700">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-base text-amber-950">Publication dans l'Annuaire Panafricain</h4>
              <p className="text-xs sm:text-sm text-amber-800/90 mt-0.5 leading-relaxed">
                Votre fiche sera rendue <strong>publique et active</strong> dans l'Annuaire dès que votre adhésion FAFE sera validée. Remplissez votre profil dès maintenant puis confirmez votre adhésion.
              </p>
            </div>
          </div>
          <Link to="/hub/adhesion" className="shrink-0 w-full md:w-auto">
            <Button className="w-full md:w-auto bg-[#E67E22] hover:bg-[#c96a1a] text-white text-xs sm:text-sm font-bold shadow-sm">
              Valider mon adhésion <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-700">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm sm:text-base text-emerald-950">Fiche Annuaire Active & Vérifiée</h4>
                <span className="text-[11px] font-mono font-bold bg-emerald-200/80 px-2 py-0.5 rounded text-emerald-900">
                  {userProfile?.membershipNumber || profile?.membershipNumber || 'FAFE MEMBRE'}
                </span>
              </div>
              <p className="text-xs text-emerald-800 mt-0.5">
                Votre profil est visible et référencé dans l'Annuaire Panafricain FAFE.
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center text-sm font-medium border border-red-200">
          <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 text-green-800 rounded-xl flex items-center text-sm font-medium border border-green-200">
          <CheckCircle2 className="w-4 h-4 mr-2 shrink-0" />
          {success}
        </div>
      )}

      <Card className="border-[#6B3E1E]/10 shadow-sm overflow-hidden bg-white">
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 md:p-8 space-y-8">
            {/* Informations Personnelles */}
            <section>
              <h3 className="text-lg font-bold text-[#6B3E1E] mb-4 border-b border-[#6B3E1E]/10 pb-2 flex items-center gap-2">
                Identité de l'Entrepreneure
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-[#6B3E1E]">Prénom <span className="text-red-500">*</span></label>
                  <Input name="firstName" value={formData.firstName} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-[#6B3E1E]">Nom <span className="text-red-500">*</span></label>
                  <Input name="lastName" value={formData.lastName} onChange={handleChange} required />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold uppercase text-[#6B3E1E]">Photo professionnelle (URL Portrait)</label>
                  <Input 
                    name="professionalPhoto" 
                    placeholder="https://..." 
                    value={formData.professionalPhoto} 
                    onChange={handleChange} 
                  />
                  <p className="text-xs text-stone-500 mt-1">
                    Ajoutez le lien d'une photo claire et professionnelle pour valoriser votre profil dans l'annuaire.
                  </p>
                </div>
              </div>
            </section>

            {/* Entreprise & Rôle */}
            <section>
              <h3 className="text-lg font-bold text-[#6B3E1E] mb-4 border-b border-[#6B3E1E]/10 pb-2 flex items-center gap-2">
                Entreprise & Activité
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-[#6B3E1E]">Nom de l'entreprise / Organisation <span className="text-red-500">*</span></label>
                  <Input name="company" value={formData.company} onChange={handleChange} required placeholder="ex: Kanza AgriTech" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-[#6B3E1E]">Poste / Fonction <span className="text-red-500">*</span></label>
                  <Input name="position" placeholder="ex: Fondatrice & Directrice Générale" value={formData.position} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-[#6B3E1E]">Secteur d'activité <span className="text-red-500">*</span></label>
                  <select 
                    name="sector"
                    value={formData.sector}
                    onChange={handleChange}
                    required
                    className="flex h-12 w-full rounded-xl border border-[#6B3E1E]/20 bg-white px-4 py-2 text-sm text-[#6B3E1E] focus:outline-none focus:ring-2 focus:ring-[#E67E22]/20 focus:border-[#E67E22] transition-colors"
                  >
                    <option value="">Sélectionnez un secteur</option>
                    {SECTORS.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-[#6B3E1E]">Site Web Professionnel</label>
                  <Input name="website" type="url" placeholder="https://..." value={formData.website} onChange={handleChange} />
                </div>
              </div>
            </section>

            {/* Localisation */}
            <section>
              <h3 className="text-lg font-bold text-[#6B3E1E] mb-4 border-b border-[#6B3E1E]/10 pb-2">
                Zone Géographique d'Opération
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-[#6B3E1E]">Pays d'opération principal <span className="text-red-500">*</span></label>
                  <select 
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className="flex h-12 w-full rounded-xl border border-[#6B3E1E]/20 bg-white px-4 py-2 text-sm text-[#6B3E1E] focus:outline-none focus:ring-2 focus:ring-[#E67E22]/20 focus:border-[#E67E22] transition-colors"
                  >
                    <option value="">Sélectionnez un pays</option>
                    {AFRICAN_COUNTRIES.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-[#6B3E1E]">Ville <span className="text-red-500">*</span></label>
                  <Input name="city" value={formData.city} onChange={handleChange} required placeholder="ex: Kinshasa, Dakar, Abidjan..." />
                </div>
              </div>
            </section>

            {/* Description & Offre */}
            <section>
              <h3 className="text-lg font-bold text-[#6B3E1E] mb-4 border-b border-[#6B3E1E]/10 pb-2">
                Description de l'Activité & Produits / Services
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-[#6B3E1E]">Présentation de l'entreprise <span className="text-red-500">*</span></label>
                  <Textarea 
                    name="description" 
                    rows={4} 
                    value={formData.description} 
                    onChange={handleChange} 
                    required 
                    placeholder="Décrivez votre activité, vos réalisations, votre mission et votre impact..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-[#6B3E1E]">Produits ou Services phares (séparés par des virgules)</label>
                  <Input 
                    name="productsServices" 
                    value={formData.productsServices} 
                    onChange={handleChange} 
                    placeholder="ex: Transformation de cacao biologique, Vente en gros, Distribution B2B" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-[#6B3E1E]">Domaines d'expertise / Mots-clés (séparés par des virgules)</label>
                  <Input 
                    name="expertise" 
                    value={formData.expertise} 
                    onChange={handleChange} 
                    placeholder="ex: Agro-industrie, Chaîne logistique, Exportation, FinTech" 
                  />
                </div>
              </div>
            </section>

            {/* Réseaux Sociaux */}
            <section>
              <h3 className="text-lg font-bold text-[#6B3E1E] mb-4 border-b border-[#6B3E1E]/10 pb-2">
                Contacts & Réseaux Sociaux Professionnels
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-[#6B3E1E]">LinkedIn</label>
                  <Input name="social_linkedin" value={formData.socialLinks.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/..." />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-[#6B3E1E]">WhatsApp Professionnel</label>
                  <Input name="social_whatsapp" value={formData.socialLinks.whatsapp} onChange={handleChange} placeholder="+243..." />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-[#6B3E1E]">Twitter / X</label>
                  <Input name="social_twitter" value={formData.socialLinks.twitter} onChange={handleChange} placeholder="https://twitter.com/..." />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-[#6B3E1E]">Facebook / Instagram</label>
                  <Input name="social_facebook" value={formData.socialLinks.facebook} onChange={handleChange} placeholder="https://facebook.com/..." />
                </div>
              </div>
            </section>

            <div className="pt-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-stone-100">
              <p className="text-xs text-stone-500">
                {isMemberActive ? '✓ Vos modifications seront instantanément répercutées dans l\'annuaire.' : 'ℹ Complétez votre adhésion pour activer la diffusion.'}
              </p>
              <Button 
                type="submit" 
                disabled={saving}
                className="w-full sm:w-auto bg-[#E67E22] hover:bg-[#c96a1a] text-white px-8 py-6 rounded-xl font-bold"
              >
                {saving ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Enregistrement...</>
                ) : (
                  profile ? 'Enregistrer les modifications' : 'Créer ma fiche entrepreneure'
                )}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
