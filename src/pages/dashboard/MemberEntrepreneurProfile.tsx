import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../store/auth';
import { Entrepreneur } from '../../types';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Loader2, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { AFRICAN_COUNTRIES, SECTORS } from '../../lib/constants';

export function MemberEntrepreneurProfile() {
  const { currentUser, userProfile } = useAuthStore();
  
  const [profile, setProfile] = useState<Entrepreneur | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
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
      instagram: ''
    }
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser) return;
      try {
        const q = query(collection(db, 'entrepreneurs'), where('ownerId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const data = { id: doc.id, ...doc.data() } as Entrepreneur;
          setProfile(data);
          
          setFormData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            company: data.company || '',
            position: data.position || '',
            country: data.country || '',
            city: data.city || '',
            sector: data.sector || '',
            website: data.website || '',
            description: data.description || '',
            expertise: data.expertise?.join(', ') || '',
            productsServices: data.productsServices?.join(', ') || '',
            professionalPhoto: data.professionalPhoto || '',
            socialLinks: {
              linkedin: data.socialLinks?.linkedin || '',
              twitter: data.socialLinks?.twitter || '',
              facebook: data.socialLinks?.facebook || '',
              instagram: data.socialLinks?.instagram || ''
            }
          });
        } else if (userProfile) {
          // Pre-fill with user info
          setFormData(prev => ({
            ...prev,
            firstName: userProfile.firstName || '',
            lastName: userProfile.lastName || '',
            country: userProfile.country || '',
            city: userProfile.city || '',
            professionalPhoto: userProfile.photoURL || ''
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
      
      const profileData = {
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
        updatedAt: Date.now()
      };
      
      if (profile?.id) {
        // Update existing
        await updateDoc(doc(db, 'entrepreneurs', profile.id), profileData);
        setSuccess("Votre profil a été mis à jour avec succès.");
        setProfile({ ...profile, ...profileData } as Entrepreneur);
      } else {
        // Create new
        const newProfile = {
          ...profileData,
          status: 'PENDING',
          verificationStatus: 'UNVERIFIED',
          createdAt: Date.now()
        };
        const docRef = await addDoc(collection(db, 'entrepreneurs'), newProfile);
        setSuccess("Votre profil a été soumis. Il sera publié après validation par notre équipe.");
        setProfile({ id: docRef.id, ...newProfile } as Entrepreneur);
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
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#E67E22]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading text-[#6B3E1E] mb-2">Profil Entrepreneure</h2>
        <p className="text-[#6B3E1E]/70 text-sm">
          Gérez votre présence dans l'Annuaire Panafricain FAFE. Les informations saisies ici seront publiques.
        </p>
      </div>

      {profile && (
        <div className={`p-4 rounded-xl flex items-start gap-3 border ${
          profile.status === 'APPROVED' ? 'bg-green-50 border-green-200 text-green-800' :
          profile.status === 'REJECTED' ? 'bg-red-50 border-red-200 text-red-800' :
          profile.status === 'SUSPENDED' ? 'bg-orange-50 border-orange-200 text-orange-800' :
          'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          {profile.status === 'APPROVED' ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : 
           profile.status === 'REJECTED' || profile.status === 'SUSPENDED' ? <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /> :
           <Info className="w-5 h-5 shrink-0 mt-0.5" />}
          <div>
            <h4 className="font-bold mb-1">
              Statut de votre profil : {
                profile.status === 'APPROVED' ? 'Publié' :
                profile.status === 'REJECTED' ? 'Rejeté' :
                profile.status === 'SUSPENDED' ? 'Suspendu' :
                'En attente de validation'
              }
            </h4>
            <p className="text-sm opacity-90">
              {profile.status === 'APPROVED' && 'Votre profil est visible publiquement dans l\'annuaire.'}
              {profile.status === 'PENDING' && 'Votre profil est en cours de révision par notre équipe. Il sera visible une fois approuvé.'}
              {profile.status === 'REJECTED' && 'Votre profil a été rejeté. Veuillez vérifier les informations fournies.'}
              {profile.status === 'SUSPENDED' && 'Votre profil a été suspendu par les administrateurs.'}
            </p>
            {profile.status === 'APPROVED' && profile.verificationStatus === 'VERIFIED' && (
              <p className="text-sm font-bold mt-2 flex items-center gap-1.5 text-[#D4AF37]">
                <CheckCircle2 className="w-4 h-4" /> Profil Vérifié par FAFE
              </p>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center text-sm font-medium border border-red-100">
          <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 text-green-700 rounded-xl flex items-center text-sm font-medium border border-green-100">
          <CheckCircle2 className="w-4 h-4 mr-2 shrink-0" />
          {success}
        </div>
      )}

      <Card className="border-[#6B3E1E]/10 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 md:p-8 space-y-8">
            {/* Informations Personnelles */}
            <section>
              <h3 className="text-lg font-bold text-[#6B3E1E] mb-4 border-b border-[#6B3E1E]/10 pb-2">Informations Personnelles</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#6B3E1E]">Prénom <span className="text-red-500">*</span></label>
                  <Input name="firstName" value={formData.firstName} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#6B3E1E]">Nom <span className="text-red-500">*</span></label>
                  <Input name="lastName" value={formData.lastName} onChange={handleChange} required />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-[#6B3E1E]">URL de la photo (Portrait professionnel)</label>
                  <Input name="professionalPhoto" placeholder="https://..." value={formData.professionalPhoto} onChange={handleChange} />
                  <p className="text-xs text-[#6B3E1E]/60 mt-1">Lien vers une image hébergée. Bientôt : upload de fichier directement.</p>
                </div>
              </div>
            </section>

            {/* Entreprise & Profession */}
            <section>
              <h3 className="text-lg font-bold text-[#6B3E1E] mb-4 border-b border-[#6B3E1E]/10 pb-2">Entreprise & Profession</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#6B3E1E]">Nom de l'entreprise <span className="text-red-500">*</span></label>
                  <Input name="company" value={formData.company} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#6B3E1E]">Poste / Fonction <span className="text-red-500">*</span></label>
                  <Input name="position" placeholder="ex: Fondatrice & CEO" value={formData.position} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#6B3E1E]">Secteur d'activité <span className="text-red-500">*</span></label>
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
                  <label className="text-sm font-bold text-[#6B3E1E]">Site Web</label>
                  <Input name="website" type="url" placeholder="https://" value={formData.website} onChange={handleChange} />
                </div>
              </div>
            </section>

            {/* Localisation */}
            <section>
              <h3 className="text-lg font-bold text-[#6B3E1E] mb-4 border-b border-[#6B3E1E]/10 pb-2">Localisation</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#6B3E1E]">Pays d'opération principal <span className="text-red-500">*</span></label>
                  <select 
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className="flex h-12 w-full rounded-xl border border-[#6B3E1E]/20 bg-white px-4 py-2 text-sm text-[#6B3E1E] focus:outline-none focus:ring-2 focus:ring-[#E67E22]/20 focus:border-[#E67E22] transition-colors"
                  >
                    <option value="">Sélectionnez un pays</option>
                    {AFRICAN_COUNTRIES.map(c => (
                      <option key={c.id} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#6B3E1E]">Ville <span className="text-red-500">*</span></label>
                  <Input name="city" value={formData.city} onChange={handleChange} required />
                </div>
              </div>
            </section>

            {/* Description & Expertise */}
            <section>
              <h3 className="text-lg font-bold text-[#6B3E1E] mb-4 border-b border-[#6B3E1E]/10 pb-2">Description & Expertise</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#6B3E1E]">Présentation de l'entreprise (Description) <span className="text-red-500">*</span></label>
                  <Textarea 
                    name="description" 
                    rows={4} 
                    value={formData.description} 
                    onChange={handleChange} 
                    required 
                    placeholder="Décrivez votre activité, votre mission et votre impact..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#6B3E1E]">Vos domaines d'expertise</label>
                  <Input name="expertise" value={formData.expertise} onChange={handleChange} placeholder="ex: Marketing digital, Finance, Stratégie d'entreprise (séparés par des virgules)" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#6B3E1E]">Produits ou Services principaux</label>
                  <Input name="productsServices" value={formData.productsServices} onChange={handleChange} placeholder="ex: Conseil RH, Vente de produits agricoles (séparés par des virgules)" />
                </div>
              </div>
            </section>

            {/* Réseaux Sociaux */}
            <section>
              <h3 className="text-lg font-bold text-[#6B3E1E] mb-4 border-b border-[#6B3E1E]/10 pb-2">Réseaux Sociaux Professionnels</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#6B3E1E]">LinkedIn</label>
                  <Input name="social_linkedin" value={formData.socialLinks.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#6B3E1E]">Twitter (X)</label>
                  <Input name="social_twitter" value={formData.socialLinks.twitter} onChange={handleChange} placeholder="https://twitter.com/..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#6B3E1E]">Facebook</label>
                  <Input name="social_facebook" value={formData.socialLinks.facebook} onChange={handleChange} placeholder="https://facebook.com/..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#6B3E1E]">Instagram</label>
                  <Input name="social_instagram" value={formData.socialLinks.instagram} onChange={handleChange} placeholder="https://instagram.com/..." />
                </div>
              </div>
            </section>

            <div className="pt-6 flex justify-end">
              <Button 
                type="submit" 
                disabled={saving}
                className="bg-[#E67E22] hover:bg-[#c96a1a] text-white px-8 py-6 rounded-xl font-bold"
              >
                {saving ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Enregistrement...</>
                ) : (
                  profile ? 'Mettre à jour mon profil' : 'Soumettre mon profil'
                )}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
