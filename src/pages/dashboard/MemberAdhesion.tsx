import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, CheckCircle, Clock, AlertTriangle, FileText, Upload, Shield, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/auth';
import { useLanguageStore } from '../../store/language';
import { createMembershipRequest, getUserMemberships, submitMembershipPayment } from '../../lib/memberships';
import { getCMSGlobal, defaultBankDetails } from '../../lib/cms';
import { Membership, CMSBankDetails } from '../../types';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, db } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export function MemberAdhesion() {
  const { currentUser: user, userProfile, setProfile } = useAuthStore();
  const { language } = useLanguageStore();
  
  const [membership, setMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(true);
  const [bankDetails, setBankDetails] = useState<CMSBankDetails>(defaultBankDetails);
  
  const [bankReference, setBankReference] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    try {
      const cms = await getCMSGlobal();
      if (cms && cms.bankDetails) {
        setBankDetails(cms.bankDetails);
      }
      const memberships = await getUserMemberships(user.uid);
      if (memberships.length > 0) {
        setMembership(memberships[0]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const hasRequiredFields = () => {
    if (!userProfile) return false;
    const required = ['firstName', 'lastName', 'email', 'phone', 'country', 'city'];
    return required.every(field => !!userProfile[field as keyof typeof userProfile]);
  };

  const handleCreateRequest = async () => {
    if (!user || !userProfile) return;
    
    if (!hasRequiredFields()) {
      setMessage({ type: 'error', text: 'Veuillez compléter toutes les informations obligatoires de votre profil avant de demander l\'adhésion.' });
      return;
    }
    
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Assuming a generic amount for now as requested (to be confirmed)
      const newMembership = await createMembershipRequest(user.uid, {
        membershipType: 'STANDARD',
        amount: 50000,
        currency: 'XAF',
        status: 'AWAITING_PAYMENT'
      });
      
      // Update user profile status
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { membershipStatus: 'AWAITING_PAYMENT' });
      setProfile({ ...userProfile, membershipStatus: 'AWAITING_PAYMENT' });
      
      setMembership(newMembership);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Une erreur est survenue. Veuillez réessayer.' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB) and format
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'La taille du fichier ne doit pas dépasser 5 Mo.' });
      return;
    }
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Format non supporté. Veuillez utiliser PDF, JPG ou PNG.' });
      return;
    }
    
    setProofFile(file);
    setMessage({ type: '', text: '' });
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!membership || !bankReference || !proofFile || !user) {
      setMessage({ type: 'error', text: 'Veuillez fournir la référence du virement et le justificatif.' });
      return;
    }
    
    setIsUploading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // 1. Upload proof file
      const fileExt = proofFile.name.split('.').pop();
      const storageRef = ref(storage, `memberships/${user.uid}/proof_${Date.now()}.${fileExt}`);
      await uploadBytes(storageRef, proofFile);
      const downloadURL = await getDownloadURL(storageRef);
      
      // 2. Submit payment and update membership
      await submitMembershipPayment(membership.id, bankReference, downloadURL);
      
      // 3. Update user profile status
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { membershipStatus: 'PAYMENT_SUBMITTED' });
      setProfile({ ...userProfile, membershipStatus: 'PAYMENT_SUBMITTED' });
      
      setMessage({ type: 'success', text: 'Votre preuve de paiement a bien été transmise. Votre demande sera vérifiée par l\'équipe FAFE.' });
      await loadData();
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Erreur lors de l\'envoi du paiement.' });
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#E67E22] mb-4" />
        <p className="text-stone-500">Chargement de votre dossier...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold font-heading text-[#6B3E1E]">Adhésion FAFE</h1>
        <p className="text-stone-500 mt-2">Gérez votre statut de membre et accédez à tous les avantages du réseau.</p>
      </div>
      
      {message.text && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-100' : 'bg-green-50 text-green-800 border border-green-100'}`}>
          {message.type === 'error' ? <AlertTriangle className="w-5 h-5 shrink-0" /> : <CheckCircle className="w-5 h-5 shrink-0" />}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      {!membership ? (
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-stone-200">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-bold font-heading text-[#6B3E1E] mb-4">Rejoignez le réseau Panafricain</h2>
              <p className="text-stone-600 mb-6">
                En devenant membre du FAFE, vous accédez à un écosystème exclusif d'entrepreneures, de formations, et d'opportunités d'affaires à travers tout le continent.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Accès complet au FAFE Hub et à l\'annuaire',
                  'Participation prioritaire aux événements et formations',
                  'Mise en réseau avec des partenaires et investisseurs',
                  'Accompagnement et mentorat personnalisé'
                ].map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-stone-600">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    {benefit}
                  </li>
                ))}
              </ul>
              
              {!hasRequiredFields() ? (
                <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl">
                  <p className="text-sm text-orange-800 mb-3 flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <span>Vous devez compléter les informations obligatoires de votre profil avant de demander l'adhésion (Téléphone, Pays, Ville...).</span>
                  </p>
                  <Link to="/hub/profil">
                    <Button variant="outline" className="w-full border-orange-300 text-orange-700 bg-white hover:bg-orange-50">
                      Compléter mon profil <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <Button onClick={handleCreateRequest} className="w-full md:w-auto bg-[#E67E22] hover:bg-[#c96a1a] text-white px-8">
                  Soumettre ma demande d'adhésion
                </Button>
              )}
            </div>
            
            <div className="bg-stone-50 p-6 rounded-xl border border-stone-200 text-center">
              <div className="w-16 h-16 bg-[#E67E22]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-[#E67E22]" />
              </div>
              <h3 className="font-bold text-[#6B3E1E] mb-2">Processus d'adhésion</h3>
              <div className="space-y-4 text-sm text-stone-500 mt-6 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center font-bold text-xs shrink-0">1</div>
                  <p>Soumission de la demande</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center font-bold text-xs shrink-0">2</div>
                  <p>Paiement des frais (Montant à confirmer)</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center font-bold text-xs shrink-0">3</div>
                  <p>Validation par le comité FAFE</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center font-bold text-xs shrink-0">4</div>
                  <p>Activation du compte Membre</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Status Column */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
              <h3 className="font-bold text-[#6B3E1E] mb-6 border-b border-stone-100 pb-2">Statut du dossier</h3>
              
              {membership.status === 'PENDING' && (
                <div className="flex flex-col items-center justify-center py-6 text-center text-stone-600">
                  <Clock className="w-12 h-12 text-stone-300 mb-3" />
                  <p className="font-bold">Demande en préparation</p>
                </div>
              )}
              {membership.status === 'AWAITING_PAYMENT' && (
                <div className="flex flex-col items-center justify-center py-6 text-center text-orange-600">
                  <CreditCard className="w-12 h-12 text-orange-400 mb-3" />
                  <p className="font-bold">En attente de paiement</p>
                  <p className="text-sm mt-2 text-stone-500">Veuillez effectuer le virement bancaire pour finaliser votre demande.</p>
                </div>
              )}
              {membership.status === 'PAYMENT_SUBMITTED' && (
                <div className="flex flex-col items-center justify-center py-6 text-center text-blue-600">
                  <FileText className="w-12 h-12 text-blue-400 mb-3" />
                  <p className="font-bold">Paiement transmis</p>
                  <p className="text-sm mt-2 text-stone-500">Votre preuve de paiement a bien été transmise. Votre demande sera vérifiée par l'équipe FAFE.</p>
                </div>
              )}
              {membership.status === 'UNDER_REVIEW' && (
                <div className="flex flex-col items-center justify-center py-6 text-center text-purple-600">
                  <Shield className="w-12 h-12 text-purple-400 mb-3" />
                  <p className="font-bold">En cours d'examen</p>
                  <p className="text-sm mt-2 text-stone-500">L'équipe FAFE examine actuellement votre dossier administratif.</p>
                </div>
              )}
              {membership.status === 'ACTIVE' && (
                <div className="flex flex-col items-center justify-center py-6 text-center text-green-600">
                  <CheckCircle className="w-12 h-12 text-green-400 mb-3" />
                  <p className="font-bold">Adhésion Active</p>
                  <p className="text-sm mt-2 text-stone-500">Félicitations, vous êtes membre à part entière du FAFE.</p>
                </div>
              )}
              {membership.status === 'REJECTED' && (
                <div className="flex flex-col items-center justify-center py-6 text-center text-red-600">
                  <AlertTriangle className="w-12 h-12 text-red-400 mb-3" />
                  <p className="font-bold">Demande rejetée</p>
                  <p className="text-sm mt-2 text-stone-500">Votre demande d'adhésion nécessite une action ou n'a pas été retenue. Veuillez contacter l'administration.</p>
                </div>
              )}
              {membership.status === 'EXPIRED' && (
                <div className="flex flex-col items-center justify-center py-6 text-center text-stone-500">
                  <Clock className="w-12 h-12 text-stone-400 mb-3" />
                  <p className="font-bold">Adhésion Expirée</p>
                  <p className="text-sm mt-2 text-stone-400">Votre période d'adhésion est terminée. Vous devez procéder à un renouvellement.</p>
                </div>
              )}
              
              <div className="mt-6 bg-stone-50 p-4 rounded-xl text-sm space-y-2 text-stone-600 border border-stone-100">
                <div className="flex justify-between">
                  <span>Date de la demande</span>
                  <span className="font-medium">{new Date(membership.createdAt).toLocaleDateString()}</span>
                </div>
                {membership.membershipNumber && (
                  <div className="flex justify-between">
                    <span>Numéro Membre</span>
                    <span className="font-mono font-bold text-[#6B3E1E]">{membership.membershipNumber}</span>
                  </div>
                )}
                {membership.expiresAt && (
                  <div className="flex justify-between">
                    <span>Valide jusqu'au</span>
                    <span className="font-medium">{new Date(membership.expiresAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Column */}
          <div className="space-y-6">
            {(membership.status === 'PENDING' || membership.status === 'AWAITING_PAYMENT') && (
              <>
                <div className="bg-orange-50 border border-orange-100 p-6 rounded-2xl">
                  <h3 className="font-bold text-orange-800 mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" /> Instructions de virement
                  </h3>
                  <div className="space-y-2 text-sm text-orange-900 bg-white p-4 rounded-xl">
                    <div className="flex justify-between border-b border-orange-50 pb-2">
                      <span className="text-orange-500">Banque</span>
                      <span className="font-bold">{bankDetails.bankName}</span>
                    </div>
                    <div className="flex justify-between border-b border-orange-50 py-2">
                      <span className="text-orange-500">Bénéficiaire</span>
                      <span className="font-bold">Réseau FAFE</span>
                    </div>
                    <div className="flex justify-between border-b border-orange-50 py-2">
                      <span className="text-orange-500">Numéro de compte</span>
                      <span className="font-bold">{bankDetails.accountNumber}</span>
                    </div>
                    <div className="flex justify-between border-b border-orange-50 py-2">
                      <span className="text-orange-500">IBAN</span>
                      <span className="font-bold">{bankDetails.iban}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-orange-500">SWIFT/BIC</span>
                      <span className="font-bold">{bankDetails.swift}</span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-orange-100 rounded-lg text-sm text-orange-800 flex justify-between items-center">
                    <span>Montant à régler :</span>
                    <span className="font-bold text-lg">Montant à confirmer</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
                  <h3 className="font-bold text-[#6B3E1E] mb-4">Transmettre la preuve de paiement</h3>
                  <form onSubmit={handleSubmitPayment} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Référence du virement (facultatif)</label>
                      <input 
                        type="text" 
                        value={bankReference}
                        onChange={(e) => setBankReference(e.target.value)}
                        className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67E22]"
                        placeholder="Ex: VIR-FAFE-1234"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Justificatif de virement *</label>
                      <div 
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${proofFile ? 'border-green-400 bg-green-50' : 'border-stone-300 hover:border-[#E67E22] bg-stone-50'}`}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {proofFile ? (
                          <div className="flex flex-col items-center">
                            <FileText className="w-8 h-8 text-green-500 mb-2" />
                            <p className="text-sm font-medium text-green-800">{proofFile.name}</p>
                            <p className="text-xs text-green-600 mt-1">Cliquez pour modifier</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center text-stone-500">
                            <Upload className="w-8 h-8 mb-2 text-stone-400" />
                            <p className="text-sm font-medium">Cliquez pour ajouter un fichier</p>
                            <p className="text-xs mt-1">PDF, JPG ou PNG (Max 5 Mo)</p>
                          </div>
                        )}
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleFileChange} 
                          accept=".pdf,image/jpeg,image/png,image/webp" 
                          className="hidden" 
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={!proofFile || isUploading}
                      className="w-full bg-[#E67E22] hover:bg-[#c96a1a] text-white"
                    >
                      {isUploading ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Envoi en cours...</>
                      ) : (
                        'Transmettre le paiement'
                      )}
                    </Button>
                  </form>
                </div>
              </>
            )}

            {membership.status === 'ACTIVE' && (
              <div className="bg-gradient-to-br from-[#6B3E1E] to-[#4A2A14] p-8 rounded-2xl text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37] rounded-full mix-blend-overlay opacity-20 -mr-10 -mt-10"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h3 className="text-xl font-bold font-heading mb-1">Carte Membre</h3>
                      <p className="text-[#D4AF37] text-sm font-bold tracking-widest uppercase">FAFE Network</p>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#6B3E1E] font-bold text-xl overflow-hidden shadow-inner">
                      {userProfile?.photoURL ? (
                         <img src={userProfile.photoURL} alt="Photo" className="w-full h-full object-cover" />
                      ) : (
                         <span className="text-[#6B3E1E]">F</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-white/60 uppercase tracking-wider">Membre</p>
                      <p className="font-bold text-lg">{userProfile?.firstName} {userProfile?.lastName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60 uppercase tracking-wider">Numéro</p>
                      <p className="font-mono text-[#D4AF37] font-bold text-lg">{membership.membershipNumber || 'En cours d\'attribution'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-white/60 uppercase tracking-wider">Validité</p>
                        <p className="font-bold text-sm">
                          {membership.expiresAt ? new Date(membership.expiresAt).toLocaleDateString() : 'Membre Officielle'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-white/60 uppercase tracking-wider">Pays</p>
                        <p className="font-bold text-sm">{userProfile?.country || '-'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-3">
                    <Link to="/hub/dashboard/entrepreneure" className="flex-1">
                      <Button className="w-full bg-[#D4AF37] hover:bg-[#c49f2e] text-[#4A2A14] font-bold text-xs py-2.5">
                        Ma fiche Entrepreneure
                      </Button>
                    </Link>
                    <Link to="/hub/annuaire" className="flex-1">
                      <Button variant="outline" className="w-full border-white/30 text-white hover:bg-white/10 font-bold text-xs py-2.5">
                        Annuaire Panafricain
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
            
            {/* Display message for other statuses where no action is needed */}
            {['PAYMENT_SUBMITTED', 'UNDER_REVIEW'].includes(membership.status) && (
              <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200">
                <h3 className="font-bold text-[#6B3E1E] mb-2 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#E67E22]" /> Prochaine étape
                </h3>
                <p className="text-sm text-stone-600">
                  Aucune action de votre part n'est requise. Vous recevrez une notification par email dès que le statut de votre adhésion sera mis à jour par l'administration FAFE.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
