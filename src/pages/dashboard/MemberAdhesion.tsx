import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, Clock, AlertTriangle, FileText, Upload, Shield } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/auth';
import { useLanguageStore } from '../../store/language';
import { createMembershipRequest, getUserMemberships, submitMembershipPayment } from '../../lib/memberships';
import { getCMSGlobal, defaultBankDetails } from '../../lib/cms';
import { Membership, CMSBankDetails } from '../../types';

export function MemberAdhesion() {
  const { currentUser: user, userProfile } = useAuthStore();
  const { language } = useLanguageStore();
  
  const [membership, setMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(true);
  const [bankDetails, setBankDetails] = useState<CMSBankDetails>(defaultBankDetails);
  
  const [bankReference, setBankReference] = useState('');
  const [proofUrl, setProofUrl] = useState(''); // Would ideally be a real upload

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

  const handleCreateRequest = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const newMembership = await createMembershipRequest(user.uid, {
        membershipType: 'STANDARD',
        amount: 50000,
        currency: 'XAF'
      });
      setMembership(newMembership);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!membership || !bankReference) return;
    setLoading(true);
    try {
      await submitMembershipPayment(membership.id, bankReference, proofUrl);
      await loadData();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-stone-500">Chargement...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold font-heading text-[#6B3E1E]">Mon Adhésion</h1>
          <p className="text-stone-500 mt-2">Gérez votre adhésion au réseau FAFE.</p>
        </div>
      </div>

      {!membership ? (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200 text-center">
          <div className="w-16 h-16 bg-[#E67E22]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-[#E67E22]" />
          </div>
          <h2 className="text-2xl font-bold text-[#6B3E1E] mb-2">Devenir Membre</h2>
          <p className="text-stone-600 mb-6 max-w-lg mx-auto">
            Soumettez votre demande d'adhésion pour rejoindre officiellement le Fonds d'Appui aux Femmes Entrepreneures.
          </p>
          <Button onClick={handleCreateRequest} className="bg-[#E67E22] hover:bg-[#c96a1a] text-white">
            Commencer ma demande
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Status Column */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
              <h3 className="font-bold text-[#6B3E1E] mb-4">Statut de la demande</h3>
              
              {membership.status === 'PENDING' && (
                <div className="flex flex-col items-center justify-center py-6 text-center text-stone-600">
                  <Clock className="w-12 h-12 text-stone-300 mb-3" />
                  <p>Votre demande est en préparation.</p>
                </div>
              )}

              {membership.status === 'AWAITING_PAYMENT' && (
                <div className="flex flex-col items-center justify-center py-6 text-center text-orange-600">
                  <CreditCard className="w-12 h-12 text-orange-400 mb-3" />
                  <p className="font-bold">En attente de paiement</p>
                  <p className="text-sm mt-2 text-stone-500">Veuillez effectuer le virement bancaire.</p>
                </div>
              )}

              {membership.status === 'PAYMENT_SUBMITTED' && (
                <div className="flex flex-col items-center justify-center py-6 text-center text-blue-600">
                  <FileText className="w-12 h-12 text-blue-400 mb-3" />
                  <p className="font-bold">Paiement transmis</p>
                  <p className="text-sm mt-2 text-stone-500">Votre paiement est en cours de vérification.</p>
                </div>
              )}

              {membership.status === 'UNDER_REVIEW' && (
                <div className="flex flex-col items-center justify-center py-6 text-center text-purple-600">
                  <Shield className="w-12 h-12 text-purple-400 mb-3" />
                  <p className="font-bold">En cours d'examen</p>
                  <p className="text-sm mt-2 text-stone-500">L'équipe FAFE examine votre dossier.</p>
                </div>
              )}

              {membership.status === 'ACTIVE' && (
                <div className="flex flex-col items-center justify-center py-6 text-center text-green-600">
                  <CheckCircle className="w-12 h-12 text-green-400 mb-3" />
                  <p className="font-bold">Adhésion Active</p>
                  <p className="text-sm mt-2 text-stone-500">Numéro: {membership.membershipNumber}</p>
                </div>
              )}

              {membership.status === 'REJECTED' && (
                <div className="flex flex-col items-center justify-center py-6 text-center text-red-600">
                  <AlertTriangle className="w-12 h-12 text-red-400 mb-3" />
                  <p className="font-bold">Demande rejetée</p>
                  <p className="text-sm mt-2 text-stone-500">Veuillez contacter le support.</p>
                </div>
              )}

            </div>
          </div>

          {/* Action Column */}
          <div className="space-y-6">
            {(membership.status === 'PENDING' || membership.status === 'AWAITING_PAYMENT') && (
              <>
                <div className="bg-orange-50 border border-orange-100 p-6 rounded-2xl">
                  <h3 className="font-bold text-orange-800 mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" /> Instructions de paiement
                  </h3>
                  <div className="space-y-2 text-sm text-orange-900 bg-white p-4 rounded-xl">
                    <div className="flex justify-between border-b border-orange-50 pb-2">
                      <span className="text-orange-500">Banque</span>
                      <span className="font-bold">{bankDetails.bankName}</span>
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
                  <div className="mt-4 p-3 bg-orange-100 rounded-lg text-sm text-orange-800">
                    Montant à régler : <span className="font-bold">{membership.amount} {membership.currency}</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
                  <h3 className="font-bold text-[#6B3E1E] mb-4">Confirmation du virement</h3>
                  <form onSubmit={handleSubmitPayment} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Référence du virement *</label>
                      <input 
                        type="text" 
                        required
                        value={bankReference}
                        onChange={(e) => setBankReference(e.target.value)}
                        className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                        placeholder="Ex: VIR-FAFE-1234"
                      />
                    </div>
                    
                    <Button type="submit" className="w-full bg-[#E67E22] hover:bg-[#c96a1a] text-white">
                      J'ai effectué le virement
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
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#6B3E1E] font-bold text-xl">
                      F
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-white/60 uppercase tracking-wider">Membre</p>
                      <p className="font-bold text-lg">{userProfile?.firstName} {userProfile?.lastName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60 uppercase tracking-wider">Numéro</p>
                      <p className="font-mono text-[#D4AF37]">{membership.membershipNumber}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-white/60 uppercase tracking-wider">Validité</p>
                        <p className="font-bold text-sm">
                          {membership.expiresAt ? new Date(membership.expiresAt).toLocaleDateString() : 'Active'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-white/60 uppercase tracking-wider">Pays</p>
                        <p className="font-bold text-sm">{userProfile?.country || '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
