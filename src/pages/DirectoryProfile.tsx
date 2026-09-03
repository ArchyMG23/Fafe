import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MapPin, Briefcase, Globe, ArrowLeft, CheckCircle2, Loader2, ShieldCheck, Mail, Linkedin, Twitter, Facebook, Instagram } from 'lucide-react';
import { FafeImage } from '../components/ui/FafeImage';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { DEMO_ENTREPRENEURS } from '../lib/mockData';
import { Entrepreneur } from '../types';
import { AFRICAN_COUNTRIES, SECTORS } from '../lib/constants';
import { useAuthStore } from '../store/auth';

export function DirectoryProfile() {
  const { id } = useParams();
  const { userProfile } = useAuthStore();
  const [profile, setProfile] = useState<Entrepreneur | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [contacting, setContacting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'entrepreneurs', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProfile({ id: docSnap.id, ...docSnap.data() } as Entrepreneur);
        } else {
          // Fallback to demo data
          const demoProfile = DEMO_ENTREPRENEURS.find(e => e.id === id);
          if (demoProfile) {
            setProfile({...demoProfile, status: 'APPROVED', verificationStatus: 'VERIFIED'} as Entrepreneur);
          }
        }
      } catch (error) {
        console.error("Error fetching profile", error);
        const demoProfile = DEMO_ENTREPRENEURS.find(e => e.id === id);
        if (demoProfile) {
          setProfile({...demoProfile, status: 'APPROVED', verificationStatus: 'VERIFIED'} as Entrepreneur);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  useEffect(() => {
    if (profile) {
      document.title = `${profile.firstName} ${profile.lastName} — ${profile.company} | Annuaire FAFE`;
    }
  }, [profile]);

  const getCountryName = (code: string) => {
    const country = AFRICAN_COUNTRIES.find(c => c.code === code || c.name === code);
    return country ? country.name : code;
  };

  const getSectorName = (id: string) => {
    const sector = SECTORS.find(s => s.id === id || s.name === id);
    return sector ? sector.name : id;
  };

  const handleContact = async () => {
    if (!userProfile) {
      alert("Veuillez vous connecter pour contacter cette entrepreneure.");
      return;
    }
    
    setContacting(true);
    try {
      await addDoc(collection(db, 'contactRequests'), {
        senderId: userProfile.id,
        recipientEntrepreneurId: profile?.id,
        message: "Demande de contact automatique via l'annuaire FAFE.",
        status: 'PENDING',
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      setContactSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'envoi de la demande. Fonctionnalité bientôt disponible.");
    } finally {
      setContacting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <Loader2 className="w-12 h-12 border-4 border-[#E67E22]/20 border-t-[#E67E22] rounded-full animate-spin mb-4" />
      </div>
    );
  }

  if (!profile || profile.status !== 'APPROVED') {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-heading text-[#6B3E1E] mb-4">Profil introuvable ou en attente de validation</h2>
        <Link to="/hub/annuaire">
          <Button className="bg-[#E67E22] hover:bg-[#c96a1a] text-white">Retour à l'annuaire</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF9F6] min-h-screen py-12">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 max-w-5xl">
        <Link to="/hub/annuaire" className="inline-flex items-center text-sm font-medium text-[#6B3E1E]/60 hover:text-[#E67E22] mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à l'annuaire
        </Link>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column: Photo & Quick Info */}
          <div className="md:col-span-1 space-y-6">
            <Card className="overflow-hidden border border-[#6B3E1E]/5 shadow-lg rounded-2xl bg-white">
              <div className="aspect-[4/5] relative bg-stone-100">
                <FafeImage 
                  src={profile.professionalPhoto || "https://images.unsplash.com/photo-1531123414708-5369786a5f54?q=80&w=600&auto=format&fit=crop"} 
                  alt={`${profile.firstName} ${profile.lastName}`} 
                  className="w-full h-full object-cover"
                />
                {profile.verificationStatus === 'VERIFIED' && (
                  <div className="absolute top-4 right-4 bg-[#D4AF37] text-white px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide">
                    <ShieldCheck className="w-4 h-4" /> Vérifié
                  </div>
                )}
              </div>
              <CardContent className="p-6">
                <h1 className="text-2xl font-bold font-heading text-[#6B3E1E] mb-1">
                  {profile.firstName} {profile.lastName}
                </h1>
                <p className="text-[10px] uppercase tracking-widest text-[#E67E22] font-bold mb-3">{profile.position || 'Fondatrice'}</p>
                
                {profile.membershipNumber && (
                  <div className="mb-6 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 border border-amber-200/80 text-[#6B3E1E] text-xs font-mono font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>N° {profile.membershipNumber}</span>
                  </div>
                )}
                
                <div className="space-y-4 text-sm font-medium">
                  <div className="flex items-center gap-3 text-[#6B3E1E]/80">
                    <Briefcase className="w-4 h-4 text-[#D4AF37]" />
                    <span className="text-[#6B3E1E]">{profile.company}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#6B3E1E]/80">
                    <MapPin className="w-4 h-4 text-[#E67E22]" />
                    <span>{profile.city}, {getCountryName(profile.country)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#6B3E1E]/80">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-[#D4AF37]"></div>
                    </div>
                    <span>{getSectorName(profile.sector)}</span>
                  </div>
                  {profile.website && (
                    <div className="flex items-center gap-3 text-[#E67E22]">
                      <Globe className="w-4 h-4" />
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:underline truncate max-w-[200px]">
                        {profile.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                </div>

                {/* Social Links */}
                {profile.socialLinks && Object.values(profile.socialLinks).some(val => !!val) && (
                  <div className="mt-6 pt-6 border-t border-[#6B3E1E]/10 flex gap-3">
                    {profile.socialLinks.linkedin && (
                      <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-[#6B3E1E] hover:bg-[#E67E22] hover:text-white transition-colors">
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                    {profile.socialLinks.twitter && (
                      <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-[#6B3E1E] hover:bg-[#E67E22] hover:text-white transition-colors">
                        <Twitter className="w-4 h-4" />
                      </a>
                    )}
                    {profile.socialLinks.facebook && (
                      <a href={profile.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-[#6B3E1E] hover:bg-[#E67E22] hover:text-white transition-colors">
                        <Facebook className="w-4 h-4" />
                      </a>
                    )}
                    {profile.socialLinks.instagram && (
                      <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-[#6B3E1E] hover:bg-[#E67E22] hover:text-white transition-colors">
                        <Instagram className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                )}

                <div className="mt-8 pt-6 border-t border-[#6B3E1E]/10">
                  {contactSuccess ? (
                    <div className="w-full bg-green-50 text-green-700 py-3 rounded-xl flex justify-center items-center gap-2 text-sm font-bold">
                      <CheckCircle2 className="w-4 h-4" /> Demande envoyée
                    </div>
                  ) : (
                    <Button 
                      className="w-full bg-[#E67E22] hover:bg-[#c96a1a] text-white rounded-xl py-6 font-bold shadow-md"
                      onClick={handleContact}
                      disabled={contacting}
                    >
                      {contacting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
                        <>
                          <Mail className="w-5 h-5 mr-2" />
                          Contacter
                        </>
                      )}
                    </Button>
                  )}
                  {!userProfile && !contactSuccess && (
                    <p className="text-center text-[10px] text-[#6B3E1E]/60 mt-3 uppercase tracking-wider">
                      Connexion requise
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Details */}
          <div className="md:col-span-2 space-y-8">
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-[#6B3E1E]/5">
              <h2 className="text-xl font-bold font-heading text-[#6B3E1E] mb-6 flex items-center gap-3">
                <span className="text-[10px] uppercase tracking-widest text-[#E67E22] font-bold">Présentation</span>
                <div className="flex-grow h-px bg-[#D4AF37]/20"></div>
              </h2>
              <p className="text-[#6B3E1E]/80 leading-relaxed whitespace-pre-wrap text-[15px]">
                {profile.description || "Aucune description fournie."}
              </p>
            </section>

            <div className="grid sm:grid-cols-2 gap-6">
              <section className="bg-white p-8 rounded-2xl shadow-sm border border-[#6B3E1E]/5">
                <h2 className="text-xl font-bold font-heading text-[#6B3E1E] mb-6 flex items-center gap-3">
                  <span className="text-[10px] uppercase tracking-widest text-[#E67E22] font-bold">Expertise</span>
                  <div className="flex-grow h-px bg-[#D4AF37]/20"></div>
                </h2>
                <ul className="space-y-4">
                  {profile.expertise && profile.expertise.length > 0 ? (
                    profile.expertise.map((item, index) => (
                      <li key={index} className="flex items-start gap-3 text-[#6B3E1E]/80 text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4 text-[#E67E22] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-[#6B3E1E]/50 italic">Non renseigné</li>
                  )}
                </ul>
              </section>

              <section className="bg-white p-8 rounded-2xl shadow-sm border border-[#6B3E1E]/5">
                <h2 className="text-xl font-bold font-heading text-[#6B3E1E] mb-6 flex items-center gap-3">
                  <span className="text-[10px] uppercase tracking-widest text-[#E67E22] font-bold">Produits & Services</span>
                  <div className="flex-grow h-px bg-[#D4AF37]/20"></div>
                </h2>
                <ul className="space-y-4">
                  {profile.productsServices && profile.productsServices.length > 0 ? (
                    profile.productsServices.map((item, index) => (
                      <li key={index} className="flex items-start gap-3 text-[#6B3E1E]/80 text-sm font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shrink-0 mt-1.5"></div>
                        <span>{item}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-[#6B3E1E]/50 italic">Non renseigné</li>
                  )}
                </ul>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
