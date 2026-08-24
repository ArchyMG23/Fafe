import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Donation } from '../../types';
import { ArrowLeft, Loader2, CheckCircle2, XCircle, FileText, User, CreditCard } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/auth';

export function AdminDonationDetail() {
  const { id } = useParams();
  const { userProfile } = useAuthStore();
  const [donation, setDonation] = useState<Donation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchDonation = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'donations', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setDonation({ id: docSnap.id, ...docSnap.data() } as Donation);
        }
      } catch (error) {
        console.error("Error fetching donation:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDonation();
  }, [id]);

  const handleUpdateStatus = async (status: 'SUCCESS' | 'FAILED' | 'CANCELLED') => {
    if (!id || !donation || !userProfile) return;
    
    const confirmUpdate = window.confirm(`Êtes-vous sûr de vouloir forcer le statut à ${status} ? Cette action manuelle ne doit être faite qu'en cas d'erreur du prestataire de paiement.`);
    if (!confirmUpdate) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, 'donations', id), { 
        paymentStatus: status,
        donationStatus: status,
        updatedAt: Date.now() 
      });
      
      // Log action
      // In a real app we would write to auditLogs here.

      setDonation({ ...donation, paymentStatus: status, donationStatus: status });
    } catch (error) {
      console.error("Error updating status", error);
      alert("Erreur lors de la mise à jour du statut.");
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'SUCCESS': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-stone-100 text-stone-800';
      default: return 'bg-stone-100 text-stone-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-stone-600 mb-4">Don introuvable</h2>
        <Link to="/admin/dons">
          <Button variant="outline">Retour à la liste</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/dons">
          <Button variant="ghost" size="sm" className="text-stone-500">
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour
          </Button>
        </Link>
        <h1 className="text-2xl font-bold font-heading text-stone-900">Détails du don</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-stone-400" /> Informations de paiement
              </h3>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(donation.paymentStatus)}`}>
                {donation.paymentStatus}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <p className="text-sm font-bold text-stone-500 mb-1">Montant</p>
                <p className="text-2xl font-bold text-stone-900">{donation.amount.toLocaleString('fr-FR')} {donation.currency}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-stone-500 mb-1">Fréquence</p>
                <p className="font-medium text-stone-900">{donation.frequency}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-stone-500 mb-1">Date</p>
                <p className="font-medium text-stone-900">{new Date(donation.createdAt).toLocaleString('fr-FR')}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-stone-500 mb-1">Projet soutenu</p>
                <p className="font-medium text-stone-900">{donation.projectId === 'GENERAL' ? 'FAFE - Fonds général' : donation.projectId}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
            <h3 className="font-bold text-lg mb-6 pb-4 border-b border-stone-100 flex items-center gap-2">
              <User className="w-5 h-5 text-stone-400" /> Donateur
            </h3>
            
            <div className="grid sm:grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <p className="text-sm font-bold text-stone-500 mb-1">Nom complet</p>
                <p className="font-medium text-stone-900">{donation.donorFirstName} {donation.donorLastName} {donation.anonymous ? <span className="text-stone-400 text-xs ml-2">(Anonyme au public)</span> : ''}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-stone-500 mb-1">Email</p>
                <p className="font-medium text-stone-900">{donation.donorEmail}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-stone-500 mb-1">Téléphone</p>
                <p className="font-medium text-stone-900">{donation.donorPhone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-stone-500 mb-1">Pays</p>
                <p className="font-medium text-stone-900">{donation.donorCountry || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-stone-500 mb-1">Organisation</p>
                <p className="font-medium text-stone-900">{donation.organisation || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-stone-500 mb-1">Compte Utilisateur</p>
                <p className="font-medium text-stone-900">{donation.donorUserId ? 'Oui' : 'Invité'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-stone-400" /> Traces & Logs
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-stone-500 uppercase mb-1">ID du Don</p>
                <p className="text-sm font-mono bg-stone-50 p-2 rounded break-all">{donation.id}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-stone-500 uppercase mb-1">Réf. Transaction Prestataire</p>
                <p className="text-sm font-mono bg-stone-50 p-2 rounded break-all">{donation.transactionReference || 'Non défini'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-stone-500 uppercase mb-1">N° de Reçu</p>
                <p className="text-sm font-mono bg-stone-50 p-2 rounded break-all">{donation.receiptNumber || 'Non généré'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
            <h3 className="font-bold text-lg mb-4">Administration Manuelle</h3>
            <p className="text-xs text-stone-500 mb-4 leading-relaxed">
              En cas de dysfonctionnement du callback du prestataire de paiement, vous pouvez forcer le statut de la transaction.
            </p>
            <div className="space-y-3">
              <Button 
                className="w-full bg-green-600 hover:bg-green-700 text-white" 
                disabled={saving || donation.paymentStatus === 'SUCCESS'}
                onClick={() => handleUpdateStatus('SUCCESS')}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" /> Marquer comme Réussi
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-red-200 text-red-600 hover:bg-red-50"
                disabled={saving || donation.paymentStatus === 'FAILED' || donation.paymentStatus === 'SUCCESS'}
                onClick={() => handleUpdateStatus('FAILED')}
              >
                <XCircle className="w-4 h-4 mr-2" /> Marquer comme Échoué
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
