import { useState, useEffect } from 'react';
import { collection, query, getDocs, updateDoc, doc, orderBy, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Membership } from '../../types';
import { Eye, Check, X, ShieldAlert, Loader2, Download, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/auth';

export function AdminAdhesions() {
  const [memberships, setMemberships] = useState<any[]>([]); // Using any for UI purposes to inject user data
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { currentUser } = useAuthStore();
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadMemberships();
  }, []);

  const loadMemberships = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'memberships'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const membershipsData = await Promise.all(snapshot.docs.map(async (membershipDoc) => {
        const data = membershipDoc.data() as Membership;
        // Fetch user data for display
        const userDoc = await getDoc(doc(db, 'users', data.userId));
        const userData = userDoc.exists() ? userDoc.data() : null;
        
        return {
          ...data,
          user: userData
        };
      }));
      
      setMemberships(membershipsData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (membershipId: string, userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir approuver cette adhésion ? Cela donnera accès complet au Hub à cet utilisateur.')) return;
    
    setActionLoading(membershipId);
    setMessage({ type: '', text: '' });
    
    try {
      // 1. Update Membership doc
      const membershipNumber = `FAFE-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      
      // Define a 1-year expiration for instance, though the prompt says "ne pas inventer", but we have to set something or leave it undefined if policy not defined. Let's leave expiresAt empty or 1 year. The prompt said: "Si la durée officielle n'est pas encore définie: NE PAS inventer une durée." So we will just leave it undefined.
      await updateDoc(doc(db, 'memberships', membershipId), {
        status: 'ACTIVE',
        membershipNumber,
        verifiedAt: Date.now(),
        verifiedBy: currentUser?.uid,
        updatedAt: Date.now()
      });

      // 2. Update User doc
      await updateDoc(doc(db, 'users', userId), {
        membershipStatus: 'ACTIVE'
      });

      setMessage({ type: 'success', text: `Adhésion approuvée avec succès. Numéro: ${membershipNumber}` });
      await loadMemberships();
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Erreur lors de l\'approbation.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (membershipId: string, userId: string) => {
    const reason = prompt('Motif du rejet (interne) :');
    if (reason === null) return; // cancelled
    
    setActionLoading(membershipId);
    setMessage({ type: '', text: '' });
    
    try {
      await updateDoc(doc(db, 'memberships', membershipId), {
        status: 'REJECTED',
        rejectionReason: reason,
        verifiedAt: Date.now(),
        verifiedBy: currentUser?.uid,
        updatedAt: Date.now()
      });

      await updateDoc(doc(db, 'users', userId), {
        membershipStatus: 'REJECTED'
      });

      setMessage({ type: 'success', text: 'Adhésion rejetée.' });
      await loadMemberships();
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Erreur lors du rejet.' });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#E67E22] mb-4" />
        <p className="text-stone-500">Chargement des adhésions...</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PENDING': return <span className="px-2 py-1 bg-stone-100 text-stone-600 rounded-full text-xs font-bold">Préparation</span>;
      case 'AWAITING_PAYMENT': return <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">Attente Paiement</span>;
      case 'PAYMENT_SUBMITTED': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">Paiement Soumis</span>;
      case 'UNDER_REVIEW': return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">En révision</span>;
      case 'ACTIVE': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Active</span>;
      case 'REJECTED': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Rejetée</span>;
      case 'EXPIRED': return <span className="px-2 py-1 bg-stone-200 text-stone-700 rounded-full text-xs font-bold">Expirée</span>;
      default: return <span className="px-2 py-1 bg-stone-100 text-stone-600 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-heading text-[#6B3E1E]">Gestion des adhésions</h1>
          <p className="text-sm text-stone-500 mt-1">Examinez et validez les demandes d'adhésion au réseau.</p>
        </div>
      </div>
      
      {message.text && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'error' ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
          {message.type === 'error' ? <AlertTriangle className="w-5 h-5 shrink-0" /> : <Check className="w-5 h-5 shrink-0" />}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-medium">
              <tr>
                <th className="px-6 py-4">Utilisateur</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4">Date & Montant</th>
                <th className="px-6 py-4">Preuve & Réf</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {memberships.map((m) => (
                <tr key={m.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-[#6B3E1E]">{m.user ? `${m.user.firstName} ${m.user.lastName}` : 'Utilisateur inconnu'}</p>
                    <p className="text-xs text-stone-500">{m.user?.email}</p>
                    <p className="text-xs text-stone-400">{m.user?.country || '-'}</p>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(m.status)}
                    {m.membershipNumber && <p className="text-xs font-mono text-[#D4AF37] mt-1">{m.membershipNumber}</p>}
                  </td>
                  <td className="px-6 py-4">
                    <p>{new Date(m.createdAt).toLocaleDateString()}</p>
                    <p className="font-bold text-sm mt-1">{m.amount} {m.currency}</p>
                  </td>
                  <td className="px-6 py-4">
                    {m.bankReference && (
                      <p className="text-xs font-mono mb-1">Réf: {m.bankReference}</p>
                    )}
                    {m.proofUrl ? (
                      <a href={m.proofUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded">
                        <Eye className="w-3 h-3" /> Voir la preuve
                      </a>
                    ) : (
                      <span className="text-xs text-stone-400">Aucune preuve</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {actionLoading === m.id ? (
                       <Loader2 className="w-5 h-5 animate-spin text-[#E67E22] ml-auto" />
                    ) : (
                      <div className="flex justify-end gap-2">
                        {m.status !== 'ACTIVE' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => handleApprove(m.id, m.userId)}
                          >
                            <Check className="w-4 h-4 mr-1" /> Approuver
                          </Button>
                        )}
                        {m.status !== 'REJECTED' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleReject(m.id, m.userId)}
                          >
                            <X className="w-4 h-4 mr-1" /> Rejeter
                          </Button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              
              {memberships.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-stone-500">
                    Aucune demande d'adhésion trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
