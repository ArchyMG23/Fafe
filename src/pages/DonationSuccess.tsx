import { useEffect, useState } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, FileText, Loader2, Info } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Donation } from '../types';

export function DonationSuccess() {
  const location = useLocation();
  const state = location.state as { donationId?: string; reference?: string; email?: string } | null;
  const [donation, setDonation] = useState<Donation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonation = async () => {
      if (!state?.donationId) {
        setLoading(false);
        return;
      }
      try {
        const docRef = doc(db, 'donations', state.donationId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setDonation({ id: docSnap.id, ...docSnap.data() } as Donation);
        }
      } catch (error) {
        console.error("Error fetching donation details", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDonation();
  }, [state]);

  if (!state?.donationId && !loading) {
    return <Navigate to="/dons" replace />;
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] pt-32 pb-20 flex flex-col items-center justify-center">
      <div className="max-w-xl w-full px-4 text-center">
        {loading ? (
          <div className="flex flex-col items-center gap-4 text-stone-500 py-12">
            <Loader2 className="w-12 h-12 animate-spin" />
            <p>Vérification de votre paiement...</p>
          </div>
        ) : donation?.paymentStatus === 'SUCCESS' ? (
          <>
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold font-heading text-[#6B3E1E] mb-4">Merci pour votre soutien !</h1>
            <p className="text-lg text-stone-600 mb-8">
              Votre don de <strong className="text-stone-900">{donation.amount.toLocaleString('fr-FR')} {donation.currency}</strong> a bien été confirmé. Un reçu fiscal a été envoyé à {donation.donorEmail}.
            </p>

            <div className="bg-white p-6 rounded-xl border border-stone-200 text-left mb-8 space-y-3">
              <div className="flex justify-between border-b border-stone-100 pb-2">
                <span className="text-stone-500 text-sm">Référence transaction</span>
                <span className="font-mono font-medium text-sm text-stone-900">{state?.reference || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-stone-100 pb-2">
                <span className="text-stone-500 text-sm">Date</span>
                <span className="font-medium text-sm text-stone-900">{new Date(donation.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-stone-500 text-sm">Statut</span>
                <span className="font-medium text-sm text-green-600">Confirmé</span>
              </div>
            </div>
          </>
        ) : donation?.paymentStatus === 'FAILED' ? (
          <>
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Info className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold font-heading text-red-700 mb-4">Paiement échoué</h1>
            <p className="text-lg text-stone-600 mb-8">
              Votre paiement n'a pas pu être confirmé.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/dons">
                <Button variant="outline" className="h-12 border-stone-300 text-stone-600">
                  Retour aux dons
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 animate-spin" />
            </div>
            <h1 className="text-3xl font-bold font-heading text-[#6B3E1E] mb-4">Paiement en cours de confirmation...</h1>
            <p className="text-lg text-stone-600 mb-8">
              Votre paiement est en cours de traitement par notre prestataire. Si vous avez fourni une adresse e-mail, vous recevrez une confirmation et votre reçu une fois la transaction validée.
            </p>
            
            <div className="bg-white p-6 rounded-xl border border-stone-200 text-left mb-8 space-y-3">
              <div className="flex justify-between border-b border-stone-100 pb-2">
                <span className="text-stone-500 text-sm">Référence temporaire</span>
                <span className="font-mono font-medium text-sm text-stone-900">{state?.reference || donation?.id}</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-stone-500 text-sm">Statut</span>
                <span className="font-medium text-sm text-yellow-600">En attente (PENDING)</span>
              </div>
            </div>
          </>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button variant="outline" className="w-full sm:w-auto h-12 border-stone-300 text-stone-600 hover:bg-stone-50">
              Retour à l'accueil
            </Button>
          </Link>
          <Link to="/entrepreneures">
            <Button variant="gold" className="w-full sm:w-auto h-12 bg-[#E67E22] hover:bg-[#c96a1a] text-white">
              Découvrir l'Annuaire <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
