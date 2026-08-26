import React, { useState, useRef, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useAuthStore } from '../../store/auth';
import { db, storage, auth } from '../../lib/firebase';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { 
  User as UserIcon, Lock, Briefcase, Camera, 
  CheckCircle2, AlertCircle, Loader2, CreditCard, 
  Globe, Mail, Phone, MapPin, Building2, Facebook, 
  Instagram, Twitter, Linkedin, MessageCircle, AlertTriangle
} from 'lucide-react';
import { SECTORS, AFRICAN_COUNTRIES } from '../../lib/constants';

export function MemberProfile() {
  const { currentUser, userProfile, setProfile } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'infos' | 'pro' | 'security'>('infos');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    country: '',
    city: '',
    address: '',
    company: '',
    position: '',
    sector: '',
    expertise: '',
    bio: '',
    website: '',
    linkedin: '',
    facebook: '',
    instagram: '',
    twitter: '',
    whatsapp: ''
  });
  
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        phone: userProfile.phone || userProfile.phoneNumber || '',
        country: userProfile.country || '',
        city: userProfile.city || '',
        address: userProfile.address || '',
        company: userProfile.company || '',
        position: userProfile.position || '',
        sector: userProfile.sector || '',
        expertise: userProfile.expertise || '',
        bio: userProfile.bio || '',
        website: userProfile.website || '',
        linkedin: userProfile.socialLinks?.linkedin || '',
        facebook: userProfile.socialLinks?.facebook || '',
        instagram: userProfile.socialLinks?.instagram || '',
        twitter: userProfile.socialLinks?.twitter || '',
        whatsapp: userProfile.socialLinks?.whatsapp || ''
      });
      setIsDirty(false);
    }
  }, [userProfile]);

  // Warning when leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setIsDirty(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser || !userProfile) return;

    // Validate size and format (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'La taille de l\'image ne doit pas dépasser 5 Mo.' });
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setMessage({ type: 'error', text: 'Format non supporté. Veuillez utiliser JPG, PNG ou WEBP.' });
      return;
    }

    setIsUploading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const storageRef = ref(storage, `users/${currentUser.uid}/profile_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, { photoURL: downloadURL });
      
      setProfile({ ...userProfile, photoURL: downloadURL });
      setMessage({ type: 'success', text: 'Photo de profil mise à jour avec succès.' });
    } catch (error) {
      console.error('Error uploading photo:', error);
      setMessage({ type: 'error', text: 'Erreur lors du téléchargement de la photo.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile || !currentUser) return;
    
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const updates: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        country: formData.country,
        city: formData.city,
        address: formData.address,
        company: formData.company,
        position: formData.position,
        sector: formData.sector,
        expertise: formData.expertise,
        bio: formData.bio,
        website: formData.website,
        socialLinks: {
          linkedin: formData.linkedin,
          facebook: formData.facebook,
          instagram: formData.instagram,
          twitter: formData.twitter,
          whatsapp: formData.whatsapp
        },
        updatedAt: Date.now()
      };

      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, updates);
      
      setProfile({ ...userProfile, ...updates });
      setIsDirty(false);
      setMessage({ type: 'success', text: 'Profil mis à jour avec succès.' });
      
      // Clear message after 3s
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde. Veuillez réessayer.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!currentUser?.email) return;
    try {
      await sendPasswordResetEmail(auth, currentUser.email);
      setMessage({ type: 'success', text: 'Un email de réinitialisation vous a été envoyé.' });
    } catch (error) {
      console.error('Error sending reset email', error);
      setMessage({ type: 'error', text: 'Erreur lors de l\'envoi de l\'email.' });
    }
  };

  if (!userProfile) return null;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 space-y-8 animate-fade-in">
      {/* Header Profile & Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Main Profile Actions */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-[#6B3E1E] to-[#E67E22]"></div>
            <CardContent className="pt-0 relative px-6 pb-6 text-center">
              <div className="relative w-32 h-32 mx-auto -mt-16 mb-4">
                <div className="w-full h-full rounded-full border-4 border-white bg-stone-100 overflow-hidden shadow-md flex items-center justify-center">
                  {isUploading ? (
                    <Loader2 className="w-8 h-8 animate-spin text-[#E67E22]" />
                  ) : userProfile.photoURL ? (
                    <img src={userProfile.photoURL} alt="Profil" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-16 h-16 text-stone-300" />
                  )}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-[#E67E22] text-white rounded-full shadow-lg hover:bg-[#c96a1a] transition-colors"
                  title="Modifier la photo"
                >
                  <Camera className="w-5 h-5" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handlePhotoUpload} 
                  accept="image/jpeg, image/png, image/webp" 
                  className="hidden" 
                />
              </div>
              
              <h2 className="text-xl font-bold font-heading text-[#6B3E1E]">
                {userProfile.firstName} {userProfile.lastName}
              </h2>
              <p className="text-stone-500 text-sm mb-4">{userProfile.email}</p>
              
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm px-4 py-2 bg-stone-50 rounded-lg">
                  <span className="text-stone-500">Statut Compte</span>
                  <span className="font-bold text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Actif
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm px-4 py-2 bg-stone-50 rounded-lg">
                  <span className="text-stone-500">Adhésion</span>
                  {userProfile.membershipStatus === 'ACTIVE' ? (
                    <span className="font-bold text-green-600">Active</span>
                  ) : userProfile.membershipStatus ? (
                    <span className="font-bold text-orange-600">En attente</span>
                  ) : (
                    <span className="font-bold text-stone-500">Non membre</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Member Card (Digital) */}
          {userProfile.membershipStatus === 'ACTIVE' && (
            <Card className="bg-gradient-to-br from-[#6B3E1E] to-[#4A2A14] text-white border-0 shadow-lg overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37] rounded-full mix-blend-overlay opacity-20 -mr-10 -mt-10"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-bold font-heading mb-0.5">Carte Membre</h3>
                    <p className="text-[#D4AF37] text-xs font-bold tracking-widest uppercase">FAFE Network</p>
                  </div>
                  <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <CreditCard className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] text-white/60 uppercase tracking-wider">Membre</p>
                    <p className="font-bold">{userProfile.firstName} {userProfile.lastName}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-white/60 uppercase tracking-wider">Pays</p>
                      <p className="font-medium text-sm">{userProfile.country || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/60 uppercase tracking-wider">Statut</p>
                      <p className="font-medium text-sm text-[#D4AF37]">Vérifié</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Col: Forms */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-sm">
            {/* Custom Tabs Navigation */}
            <div className="flex overflow-x-auto border-b border-stone-100 p-2 gap-2 hide-scrollbar">
              <button 
                onClick={() => setActiveTab('infos')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === 'infos' ? 'bg-[#E67E22]/10 text-[#E67E22]' : 'text-stone-500 hover:bg-stone-50 hover:text-[#6B3E1E]'}`}
              >
                <UserIcon className="w-4 h-4" /> Infos Personnelles
              </button>
              <button 
                onClick={() => setActiveTab('pro')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === 'pro' ? 'bg-[#E67E22]/10 text-[#E67E22]' : 'text-stone-500 hover:bg-stone-50 hover:text-[#6B3E1E]'}`}
              >
                <Briefcase className="w-4 h-4" /> Profil Professionnel
              </button>
              <button 
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === 'security' ? 'bg-[#E67E22]/10 text-[#E67E22]' : 'text-stone-500 hover:bg-stone-50 hover:text-[#6B3E1E]'}`}
              >
                <Lock className="w-4 h-4" /> Sécurité
              </button>
            </div>

            <CardContent className="p-6">
              
              {/* Messages */}
              {message.text && (
                <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'error' ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
                  {message.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
                  <p className="text-sm font-medium">{message.text}</p>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* TAB: INFOS PERSONNELLES */}
                {activeTab === 'infos' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-[#6B3E1E] mb-2">Prénom</label>
                        <Input name="firstName" value={formData.firstName} onChange={handleChange} required />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#6B3E1E] mb-2">Nom</label>
                        <Input name="lastName" value={formData.lastName} onChange={handleChange} required />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-[#6B3E1E] mb-2">Email</label>
                      <Input value={userProfile.email} disabled className="bg-stone-50 text-stone-500 cursor-not-allowed" />
                      <p className="text-xs text-stone-500 mt-1">L'adresse email est liée à votre authentification et ne peut être modifiée ici.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-[#6B3E1E] mb-2">Téléphone</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                          <Input name="phone" value={formData.phone} onChange={handleChange} className="pl-9" placeholder="+33 6 00 00 00 00" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#6B3E1E] mb-2">Pays de résidence</label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                          <select 
                            name="country" 
                            value={formData.country} 
                            onChange={handleChange}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E67E22]"
                          >
                            <option value="">Sélectionner un pays</option>
                            {AFRICAN_COUNTRIES.map(c => (
                              <option key={c.id} value={c.name}>{c.name}</option>
                            ))}
                            <option value="France">France</option>
                            <option value="Autre">Autre</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-[#6B3E1E] mb-2">Ville</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                          <Input name="city" value={formData.city} onChange={handleChange} className="pl-9" placeholder="Ex: Dakar, Paris..." />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#6B3E1E] mb-2">Adresse</label>
                        <Input name="address" value={formData.address} onChange={handleChange} placeholder="Numéro et nom de rue" />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB: PROFIL PROFESSIONNEL */}
                {activeTab === 'pro' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="bg-[#E67E22]/5 border border-[#E67E22]/20 p-4 rounded-lg mb-6">
                      <p className="text-sm text-[#6B3E1E]">
                        <strong>Profil Annuaire :</strong> Ces informations professionnelles permettront de compléter votre fiche dans l'Annuaire Panafricain FAFE (disponible prochainement).
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-[#6B3E1E] mb-2">Nom de l'entreprise</label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                          <Input name="company" value={formData.company} onChange={handleChange} className="pl-9" placeholder="Votre entreprise" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#6B3E1E] mb-2">Poste / Fonction</label>
                        <Input name="position" value={formData.position} onChange={handleChange} placeholder="Ex: Fondatrice, CEO..." />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-[#6B3E1E] mb-2">Secteur d'activité</label>
                        <select 
                          name="sector" 
                          value={formData.sector} 
                          onChange={handleChange}
                          className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E67E22]"
                        >
                          <option value="">Sélectionner un secteur</option>
                          {SECTORS.map(s => (
                            <option key={s.id} value={s.name}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#6B3E1E] mb-2">Domaine d'expertise principal</label>
                        <Input name="expertise" value={formData.expertise} onChange={handleChange} placeholder="Ex: Marketing Digital, Finance, Agro-business..." />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-[#6B3E1E] mb-2">Présentation de l'activité</label>
                      <Textarea 
                        name="bio" 
                        value={formData.bio} 
                        onChange={handleChange} 
                        placeholder="Décrivez votre activité, vos produits/services et votre vision..."
                        className="min-h-[100px]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-stone-100">
                      <div>
                        <label className="block text-sm font-bold text-[#6B3E1E] mb-2">Site Web</label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                          <Input name="website" type="url" value={formData.website} onChange={handleChange} className="pl-9" placeholder="https://" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#6B3E1E] mb-2">LinkedIn</label>
                        <div className="relative">
                          <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                          <Input name="linkedin" type="url" value={formData.linkedin} onChange={handleChange} className="pl-9" placeholder="URL du profil" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#6B3E1E] mb-2">Instagram</label>
                        <div className="relative">
                          <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                          <Input name="instagram" type="url" value={formData.instagram} onChange={handleChange} className="pl-9" placeholder="URL du compte" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#6B3E1E] mb-2">Facebook</label>
                        <div className="relative">
                          <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                          <Input name="facebook" type="url" value={formData.facebook} onChange={handleChange} className="pl-9" placeholder="URL de la page" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB: SÉCURITÉ */}
                {activeTab === 'security' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="bg-stone-50 p-6 rounded-xl border border-stone-200">
                      <h3 className="font-bold text-[#6B3E1E] mb-2 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-[#E67E22]" /> Mot de passe
                      </h3>
                      <p className="text-sm text-stone-500 mb-4">
                        Vous pouvez demander un email sécurisé pour réinitialiser ou modifier votre mot de passe d'authentification.
                      </p>
                      <Button type="button" variant="outline" onClick={handlePasswordReset} className="border-[#E67E22] text-[#E67E22] hover:bg-[#E67E22]/10">
                        Envoyer le lien de réinitialisation
                      </Button>
                    </div>

                    <div className="bg-red-50 p-6 rounded-xl border border-red-100 mt-8">
                      <h3 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" /> Zone dangereuse
                      </h3>
                      <p className="text-sm text-red-600 mb-4">
                        La suppression de votre compte est définitive. Toutes vos données seront perdues et votre adhésion FAFE sera révoquée.
                      </p>
                      <Button type="button" variant="outline" disabled className="border-red-200 text-red-400 bg-white opacity-50 cursor-not-allowed">
                        Supprimer mon compte (Indisponible)
                      </Button>
                      <p className="text-xs text-red-500 mt-2">
                        Veuillez contacter l'administration pour procéder à la suppression complète de votre dossier (dons, adhésions, historique).
                      </p>
                    </div>
                  </div>
                )}

                {/* Submit Action (Only for Info & Pro tabs) */}
                {activeTab !== 'security' && (
                  <div className="mt-8 flex items-center gap-4 pt-6 border-t border-stone-100">
                    <Button 
                      type="submit" 
                      disabled={isLoading || !isDirty} 
                      className="bg-[#E67E22] hover:bg-[#c96a1a] text-white px-8"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Enregistrement...
                        </>
                      ) : (
                        'Enregistrer les modifications'
                      )}
                    </Button>
                    
                    {isDirty && !isLoading && (
                      <span className="text-sm text-orange-500 flex items-center gap-1 font-medium animate-pulse">
                        <AlertCircle className="w-4 h-4" /> Modifications non sauvegardées
                      </span>
                    )}
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
