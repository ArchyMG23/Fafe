import { FafeImage } from '../../components/ui/FafeImage';
import { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Membership, MembershipStatus, UserProfile } from '../../types';
import { 
  Eye, Check, X, ShieldAlert, Loader2, Download, AlertTriangle, 
  Search, Filter, ShieldCheck, RefreshCw, ExternalLink, PauseCircle, PlayCircle 
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/auth';
import { 
  approveMembership, 
  rejectMembership, 
  suspendMembership, 
  reactivateMembership 
} from '../../lib/memberships';

interface MembershipWithUser extends Membership {
  user?: UserProfile | null;
}

export function AdminAdhesions() {
  const [memberships, setMemberships] = useState<MembershipWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);
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
        const data = { id: membershipDoc.id, ...membershipDoc.data() } as Membership;
        let userData: UserProfile | null = null;
        if (data.userId) {
          try {
            const userDoc = await getDoc(doc(db, 'users', data.userId));
            if (userDoc.exists()) {
              userData = { id: userDoc.id, ...userDoc.data() } as UserProfile;
            }
          } catch (e) {
            console.error("Error fetching user data", e);
          }
        }
        
        return {
          ...data,
          user: userData
        };
      }));
      
      setMemberships(membershipsData);
    } catch (error) {
      console.error("Error loading memberships:", error);
      setMessage({ type: 'error', text: 'Impossible de charger la liste des adhésions.' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (membershipId: string, userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir approuver cette adhésion ?\n\nCela va :\n1. Activer le compte membre\n2. Générer le numéro officiel FAFE\n3. Publier et activer automatiquement la fiche dans l\'Annuaire Panafricain.')) return;
    
    setActionLoading(membershipId);
    setMessage({ type: '', text: '' });
    
    try {
      const { membershipNumber } = await approveMembership(membershipId, userId, currentUser?.uid);
      setMessage({ 
        type: 'success', 
        text: `Adhésion approuvée avec succès ! Numéro officiel : ${membershipNumber}. Profil automatiquement publié dans l'Annuaire Panafricain.` 
      });
      await loadMemberships();
    } catch (error: any) {
      console.error(error);
      setMessage({ type: 'error', text: error.message || 'Erreur lors de l\'approbation.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (membershipId: string, userId: string) => {
    const reason = prompt('Motif du rejet (ex: référence virement introuvable, justificatif illisible) :');
    if (reason === null) return;
    
    setActionLoading(membershipId);
    setMessage({ type: '', text: '' });
    
    try {
      await rejectMembership(membershipId, userId, currentUser?.uid, reason);
      setMessage({ type: 'success', text: 'Adhésion marquée comme rejetée et fiche annuaire désactivée.' });
      await loadMemberships();
    } catch (error: any) {
      console.error(error);
      setMessage({ type: 'error', text: error.message || 'Erreur lors du rejet.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async (membershipId: string, userId: string) => {
    const reason = prompt('Motif de suspension :');
    if (reason === null) return;

    setActionLoading(membershipId);
    setMessage({ type: '', text: '' });

    try {
      await suspendMembership(membershipId, userId, currentUser?.uid, reason);
      setMessage({ type: 'success', text: 'Adhésion suspendue et fiche annuaire retirée de la vue publique.' });
      await loadMemberships();
    } catch (error: any) {
      console.error(error);
      setMessage({ type: 'error', text: error.message || 'Erreur lors de la suspension.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivate = async (membershipId: string, userId: string) => {
    if (!confirm('Réactiver cette adhésion et republier la fiche dans l\'Annuaire ?')) return;

    setActionLoading(membershipId);
    setMessage({ type: '', text: '' });

    try {
      await reactivateMembership(membershipId, userId, currentUser?.uid);
      setMessage({ type: 'success', text: 'Adhésion réactivée et fiche annuaire republiée avec succès.' });
      await loadMemberships();
    } catch (error: any) {
      console.error(error);
      setMessage({ type: 'error', text: error.message || 'Erreur lors de la réactivation.' });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: MembershipStatus | string) => {
    switch(status) {
      case 'PENDING':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700">En préparation</span>;
      case 'AWAITING_PAYMENT':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Attente Paiement</span>;
      case 'PAYMENT_SUBMITTED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 animate-pulse">Paiement Soumis (À valider)</span>;
      case 'UNDER_REVIEW':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">En révision</span>;
      case 'ACTIVE':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800"><ShieldCheck className="w-3 h-3 mr-1" /> Membre Actif</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">Rejetée</span>;
      case 'SUSPENDED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">Suspendue</span>;
      case 'EXPIRED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-200 text-stone-700">Expirée</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700">{status}</span>;
    }
  };

  const filteredMemberships = memberships.filter(m => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (m.user?.firstName || '').toLowerCase().includes(searchLower) ||
      (m.user?.lastName || '').toLowerCase().includes(searchLower) ||
      (m.user?.email || '').toLowerCase().includes(searchLower) ||
      (m.membershipNumber || '').toLowerCase().includes(searchLower) ||
      (m.bankReference || '').toLowerCase().includes(searchLower);

    const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const countPending = memberships.filter(m => m.status === 'PAYMENT_SUBMITTED').length;
  const countActive = memberships.filter(m => m.status === 'ACTIVE').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-[#6B3E1E]">Adhésions & Validations</h1>
          <p className="text-sm text-stone-500 mt-1">
            Gérez les demandes d'adhésion au réseau FAFE et la synchronisation avec l'Annuaire Panafricain.
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={loadMemberships} 
          disabled={loading}
          className="self-start sm:self-auto text-[#6B3E1E] border-stone-200 hover:bg-stone-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Total Adhésions</p>
            <p className="text-2xl font-bold text-[#6B3E1E] mt-1">{memberships.length}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center text-stone-600 font-bold">
            {memberships.length}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-blue-200 bg-blue-50/40 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-blue-800 uppercase tracking-wider">Paiements à vérifier</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">{countPending}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
            {countPending}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-emerald-200 bg-emerald-50/40 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Membres Actifs (Annuaire)</p>
            <p className="text-2xl font-bold text-emerald-900 mt-1">{countActive}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
            {countActive}
          </div>
        </div>
      </div>

      {/* Notifications */}
      {message.text && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'
        }`}>
          {message.type === 'error' ? <AlertTriangle className="w-5 h-5 shrink-0" /> : <Check className="w-5 h-5 shrink-0" />}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input 
            type="text" 
            placeholder="Rechercher par nom, email, réf ou n° FAFE..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-stone-200 focus:outline-none focus:border-[#E67E22] focus:ring-1 focus:ring-[#E67E22]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-stone-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-auto text-sm px-3 py-2 rounded-lg border border-stone-200 bg-white focus:outline-none focus:border-[#E67E22]"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="PAYMENT_SUBMITTED">Paiement Soumis (À valider)</option>
            <option value="AWAITING_PAYMENT">En attente de paiement</option>
            <option value="ACTIVE">Actives (Membres officiels)</option>
            <option value="REJECTED">Rejetées</option>
            <option value="SUSPENDED">Suspendues</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#E67E22] mb-3" />
            <p className="text-stone-500 text-sm">Chargement des dossiers d'adhésion...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-medium">
                <tr>
                  <th className="px-6 py-4">Entrepreneure / Membre</th>
                  <th className="px-6 py-4">Statut & N° FAFE</th>
                  <th className="px-6 py-4">Montant & Date</th>
                  <th className="px-6 py-4">Preuve & Réf</th>
                  <th className="px-6 py-4 text-right">Actions de Validation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredMemberships.map((m) => (
                  <tr key={m.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#E67E22]/10 text-[#E67E22] flex items-center justify-center font-bold text-sm shrink-0">
                          {m.user ? `${m.user.firstName?.charAt(0) || ''}${m.user.lastName?.charAt(0) || ''}` : 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-[#6B3E1E]">
                            {m.user ? `${m.user.firstName} ${m.user.lastName}` : 'Compte Inconnu'}
                          </p>
                          <p className="text-xs text-stone-500">{m.user?.email || '-'}</p>
                          <p className="text-xs text-stone-400">
                            {m.user?.company ? `${m.user.company} • ` : ''}{m.user?.country || '-'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(m.status)}
                      {m.membershipNumber && (
                        <p className="text-xs font-mono font-bold text-[#6B3E1E] mt-1.5 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 inline-block">
                          {m.membershipNumber}
                        </p>
                      )}
                      {m.rejectionReason && (
                        <p className="text-xs text-red-600 mt-1 italic max-w-xs truncate" title={m.rejectionReason}>
                          Motif : {m.rejectionReason}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-stone-900">{m.amount?.toLocaleString()} {m.currency}</p>
                      <p className="text-xs text-stone-400 mt-0.5">
                        Demandé le {new Date(m.createdAt).toLocaleDateString()}
                      </p>
                      {m.verifiedAt && (
                        <p className="text-[11px] text-emerald-600">
                          Validé le {new Date(m.verifiedAt).toLocaleDateString()}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {m.bankReference && (
                        <p className="text-xs font-mono text-stone-700 mb-1.5">
                          <span className="text-stone-400">Réf:</span> {m.bankReference}
                        </p>
                      )}
                      {m.proofUrl ? (
                        <button
                          type="button"
                          onClick={() => setSelectedProofUrl(m.proofUrl || null)}
                          className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 font-medium"
                        >
                          <Eye className="w-3.5 h-3.5" /> Voir la pièce jointe
                        </button>
                      ) : (
                        <span className="text-xs text-stone-400 italic">Aucune pièce jointe</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {actionLoading === m.id ? (
                        <Loader2 className="w-5 h-5 animate-spin text-[#E67E22] ml-auto" />
                      ) : (
                        <div className="flex justify-end items-center gap-2">
                          {m.status !== 'ACTIVE' && (
                            <Button 
                              size="sm" 
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-3 h-8 shadow-sm"
                              onClick={() => handleApprove(m.id, m.userId)}
                            >
                              <Check className="w-3.5 h-3.5 mr-1" />
                              {m.status === 'SUSPENDED' ? 'Réactiver' : 'Valider & Publier'}
                            </Button>
                          )}

                          {m.status === 'ACTIVE' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-orange-700 border-orange-200 hover:bg-orange-50 font-medium text-xs px-2.5 h-8"
                              onClick={() => handleSuspend(m.id, m.userId)}
                            >
                              <PauseCircle className="w-3.5 h-3.5 mr-1" /> Suspendre
                            </Button>
                          )}

                          {m.status !== 'REJECTED' && m.status !== 'ACTIVE' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600 border-red-200 hover:bg-red-50 font-medium text-xs px-2.5 h-8"
                              onClick={() => handleReject(m.id, m.userId)}
                            >
                              <X className="w-3.5 h-3.5 mr-1" /> Rejeter
                            </Button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}

                {filteredMemberships.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-stone-500">
                      Aucune demande d'adhésion trouvée avec ces critères.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Proof Modal */}
      {selectedProofUrl && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-stone-100">
              <h3 className="font-bold text-lg text-[#6B3E1E]">Justificatif de paiement</h3>
              <div className="flex items-center gap-2">
                <a 
                  href={selectedProofUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="p-2 text-stone-500 hover:text-[#E67E22] rounded-lg hover:bg-stone-100"
                  title="Ouvrir dans un nouvel onglet"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
                <button 
                  onClick={() => setSelectedProofUrl(null)} 
                  className="p-2 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto rounded-xl bg-stone-100 p-2 flex items-center justify-center">
              {selectedProofUrl.endsWith('.pdf') ? (
                <iframe 
                  src={selectedProofUrl} 
                  className="w-full h-[60vh] rounded-lg" 
                  title="Aperçu PDF"
                />
              ) : (
                <FafeImage 
                  src={selectedProofUrl} 
                  alt="Preuve de paiement" 
                  className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-sm" 
                />
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <Button onClick={() => setSelectedProofUrl(null)} variant="outline">
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
