import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Entrepreneur, EntrepreneurStatus, VerificationStatus } from '../../types';
import { ArrowLeft, Loader2, CheckCircle2, XCircle, ShieldCheck, ShieldAlert, Globe, MapPin, Briefcase, Mail } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function AdminEntrepreneurDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Entrepreneur | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'entrepreneurs', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProfile({ id: docSnap.id, ...docSnap.data() } as Entrepreneur);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [id]);

  const handleUpdateStatus = async (status: EntrepreneurStatus) => {
    if (!id || !profile) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'entrepreneurs', id), { status, updatedAt: Date.now() });
      setProfile({ ...profile, status });
    } catch (error) {
      console.error("Error updating status", error);
      alert("Erreur lors de la mise à jour du statut.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateVerification = async (verificationStatus: VerificationStatus) => {
    if (!id || !profile) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'entrepreneurs', id), { verificationStatus, updatedAt: Date.now() });
      setProfile({ ...profile, verificationStatus });
    } catch (error) {
      console.error("Error updating verification", error);
      alert("Erreur lors de la mise à jour de la vérification.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-stone-600 mb-4">Profil introuvable</h2>
        <Link to="/admin/entrepreneures">
          <Button variant="outline">Retour à la liste</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/entrepreneures">
          <Button variant="ghost" size="sm" className="text-stone-500">
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour
          </Button>
        </Link>
        <h1 className="text-2xl font-bold font-heading text-stone-900">Détails du profil</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Core Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-stone-100 overflow-hidden mb-4 border-2 border-white shadow-sm">
                {profile.professionalPhoto ? (
                  <img src={profile.professionalPhoto} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-stone-400 flex items-center justify-center h-full">
                    {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-stone-900">{profile.firstName} {profile.lastName}</h2>
              <p className="text-sm font-medium text-stone-500 mb-4">{profile.position}</p>
              
              <div className="w-full pt-4 border-t border-stone-100 space-y-3 text-sm text-left">
                <div className="flex items-center gap-3 text-stone-600">
                  <Briefcase className="w-4 h-4 text-stone-400" />
                  <span className="font-medium">{profile.company}</span>
                </div>
                <div className="flex items-center gap-3 text-stone-600">
                  <MapPin className="w-4 h-4 text-stone-400" />
                  <span>{profile.city}, {profile.country}</span>
                </div>
                {profile.website && (
                  <div className="flex items-center gap-3 text-stone-600">
                    <Globe className="w-4 h-4 text-stone-400" />
                    <a href={profile.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{profile.website}</a>
                  </div>
                )}
                <div className="flex items-center gap-3 text-stone-600">
                  <Mail className="w-4 h-4 text-stone-400" />
                  <span className="text-xs">ID Propriétaire: {profile.ownerId}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
            <h3 className="font-bold text-stone-900 mb-4">Statut Annuaire</h3>
            <div className="space-y-4">
              <div className="p-3 rounded-lg border border-stone-100 bg-stone-50">
                <p className="text-xs text-stone-500 uppercase tracking-wider font-bold mb-2">Visibilité (Statut)</p>
                <div className="flex gap-2">
                  <Button 
                    size="sm"
                    className={`flex-1 ${profile.status === 'APPROVED' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'}`}
                    variant={profile.status === 'APPROVED' ? 'default' : 'outline'}
                    onClick={() => handleUpdateStatus('APPROVED')}
                    disabled={saving}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> Approuver
                  </Button>
                  <Button 
                    size="sm"
                    className={`flex-1 ${profile.status === 'REJECTED' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'}`}
                    variant={profile.status === 'REJECTED' ? 'default' : 'outline'}
                    onClick={() => handleUpdateStatus('REJECTED')}
                    disabled={saving}
                  >
                    <XCircle className="w-4 h-4 mr-1.5" /> Rejeter
                  </Button>
                </div>
                <div className="mt-2">
                  <Button 
                    size="sm"
                    className={`w-full ${profile.status === 'SUSPENDED' ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'}`}
                    variant={profile.status === 'SUSPENDED' ? 'default' : 'outline'}
                    onClick={() => handleUpdateStatus('SUSPENDED')}
                    disabled={saving}
                  >
                    Suspendre le profil
                  </Button>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-stone-100 bg-stone-50">
                <p className="text-xs text-stone-500 uppercase tracking-wider font-bold mb-2">Vérification Institutionnelle</p>
                <div className="flex gap-2 mb-3">
                  <Button 
                    size="sm"
                    className={`flex-1 ${profile.verificationStatus === 'VERIFIED' ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'}`}
                    variant={profile.verificationStatus === 'VERIFIED' ? 'default' : 'outline'}
                    onClick={() => handleUpdateVerification('VERIFIED')}
                    disabled={saving}
                  >
                    <ShieldCheck className="w-4 h-4 mr-1.5" /> Vérifier
                  </Button>
                  <Button 
                    size="sm"
                    className={`flex-1 ${profile.verificationStatus === 'UNVERIFIED' ? 'bg-stone-600 hover:bg-stone-700 text-white' : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'}`}
                    variant={profile.verificationStatus === 'UNVERIFIED' ? 'default' : 'outline'}
                    onClick={() => handleUpdateVerification('UNVERIFIED')}
                    disabled={saving}
                  >
                    <ShieldAlert className="w-4 h-4 mr-1.5" /> Révoquer
                  </Button>
                </div>

                <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between">
                  <span className="text-xs font-medium text-stone-700">Mettre en vedette (Accueil)</span>
                  <Button
                    size="sm"
                    variant={profile.isFeatured ? 'default' : 'outline'}
                    className={`text-xs px-2.5 py-1 h-7 ${profile.isFeatured ? 'bg-[#E67E22] text-white hover:bg-[#c96a1a]' : 'border-stone-300 text-stone-600'}`}
                    onClick={async () => {
                      if (!id || !profile) return;
                      setSaving(true);
                      try {
                        const newFeatured = !profile.isFeatured;
                        await updateDoc(doc(db, 'entrepreneurs', id), { isFeatured: newFeatured, updatedAt: Date.now() });
                        setProfile({ ...profile, isFeatured: newFeatured });
                      } catch (e) {
                        console.error(e);
                      } finally {
                        setSaving(false);
                      }
                    }}
                    disabled={saving}
                  >
                    {profile.isFeatured ? '★ En vedette' : '☆ Standard'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
            <h3 className="font-bold text-stone-900 mb-4 pb-2 border-b border-stone-100">Détails de l'entreprise</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-bold text-stone-500 mb-1">Secteur</p>
                <p className="text-stone-900">{profile.sector}</p>
              </div>
              
              <div>
                <p className="text-sm font-bold text-stone-500 mb-1">Description</p>
                <p className="text-stone-900 text-sm leading-relaxed whitespace-pre-wrap">{profile.description || 'Non renseignée'}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-stone-100">
                <div>
                  <p className="text-sm font-bold text-stone-500 mb-2">Expertise</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.expertise && profile.expertise.length > 0 ? profile.expertise.map((exp, i) => (
                      <span key={i} className="px-2 py-1 bg-stone-100 text-stone-700 text-xs rounded-md">{exp}</span>
                    )) : <span className="text-sm text-stone-400 italic">Non renseignée</span>}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-stone-500 mb-2">Produits / Services</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.productsServices && profile.productsServices.length > 0 ? profile.productsServices.map((prod, i) => (
                      <span key={i} className="px-2 py-1 bg-stone-100 text-stone-700 text-xs rounded-md">{prod}</span>
                    )) : <span className="text-sm text-stone-400 italic">Non renseignés</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
            <h3 className="font-bold text-stone-900 mb-4 pb-2 border-b border-stone-100">Réseaux Sociaux</h3>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-bold text-stone-500 mb-1">LinkedIn</p>
                {profile.socialLinks?.linkedin ? (
                  <a href={profile.socialLinks.linkedin} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all">{profile.socialLinks.linkedin}</a>
                ) : <span className="text-stone-400 italic">Non renseigné</span>}
              </div>
              <div>
                <p className="font-bold text-stone-500 mb-1">Twitter</p>
                {profile.socialLinks?.twitter ? (
                  <a href={profile.socialLinks.twitter} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all">{profile.socialLinks.twitter}</a>
                ) : <span className="text-stone-400 italic">Non renseigné</span>}
              </div>
              <div>
                <p className="font-bold text-stone-500 mb-1">Facebook</p>
                {profile.socialLinks?.facebook ? (
                  <a href={profile.socialLinks.facebook} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all">{profile.socialLinks.facebook}</a>
                ) : <span className="text-stone-400 italic">Non renseigné</span>}
              </div>
              <div>
                <p className="font-bold text-stone-500 mb-1">Instagram</p>
                {profile.socialLinks?.instagram ? (
                  <a href={profile.socialLinks.instagram} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all">{profile.socialLinks.instagram}</a>
                ) : <span className="text-stone-400 italic">Non renseigné</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
