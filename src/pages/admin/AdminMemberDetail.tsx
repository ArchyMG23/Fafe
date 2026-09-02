import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { UserProfile, Role, UserStatus, Membership, Entrepreneur, MembershipStatus } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  ArrowLeft, Loader2, ShieldAlert, CheckCircle2, ShieldCheck, 
  ExternalLink, Briefcase, FileText, Check, X, AlertTriangle 
} from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import { approveMembership, rejectMembership, suspendMembership, reactivateMembership } from '../../lib/memberships';

export function AdminMemberDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userProfile: currentUser } = useAuthStore();
  
  const [member, setMember] = useState<UserProfile | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [entrepreneurProfile, setEntrepreneurProfile] = useState<Entrepreneur | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [role, setRole] = useState<Role>('MEMBER');
  const [status, setStatus] = useState<UserStatus>('ACTIVE');

  const fetchMemberData = async () => {
    if (!id) return;
    try {
      // 1. Fetch user doc
      const docRef = doc(db, 'users', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() } as UserProfile;
        setMember(data);
        setRole(data.role || 'MEMBER');
        setStatus(data.status || 'ACTIVE');

        // 2. Fetch membership
        const memQ = query(collection(db, 'memberships'), where('userId', '==', id));
        const memSnap = await getDocs(memQ);
        if (!memSnap.empty) {
          setMembership({ id: memSnap.docs[0].id, ...memSnap.docs[0].data() } as Membership);
        } else {
          setMembership(null);
        }

        // 3. Fetch entrepreneur profile
        const entQ = query(collection(db, 'entrepreneurs'), where('ownerId', '==', id));
        const entSnap = await getDocs(entQ);
        if (!entSnap.empty) {
          setEntrepreneurProfile({ id: entSnap.docs[0].id, ...entSnap.docs[0].data() } as Entrepreneur);
        } else {
          setEntrepreneurProfile(null);
        }
      } else {
        navigate('/admin/membres');
      }
    } catch (error) {
      console.error("Error fetching member", error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des informations.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberData();
  }, [id, navigate]);

  const handleUpdate = async () => {
    if (status !== member?.status || role !== member?.role) {
      if (!window.confirm("Êtes-vous sûr de vouloir enregistrer ces modifications de statut ou de rôle ?")) {
        return;
      }
    }
    if (!id || !member) return;
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      if (id === currentUser?.id) {
        throw new Error("Vous ne pouvez pas modifier votre propre rôle ou statut.");
      }

      await updateDoc(doc(db, 'users', id), {
        role,
        status,
        updatedAt: Date.now()
      });
      
      setMember(prev => prev ? { ...prev, role, status } : null);
      setMessage({ type: 'success', text: 'Compte utilisateur mis à jour avec succès.' });
    } catch (error: any) {
      console.error("Error updating member", error);
      setMessage({ type: 'error', text: error.message || 'Erreur lors de la mise à jour.' });
    } finally {
      setSaving(false);
    }
  };

  const handleApproveMembership = async () => {
    if (!membership || !id) return;
    if (!confirm("Approuver l'adhésion et publier automatiquement la fiche dans l'Annuaire Panafricain ?")) return;
    setActionLoading(true);
    try {
      const res = await approveMembership(membership.id, id, currentUser?.id);
      setMessage({ type: 'success', text: `Adhésion validée avec succès ! N° FAFE : ${res.membershipNumber}` });
      await fetchMemberData();
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || "Erreur lors de l'approbation." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectMembership = async () => {
    if (!membership || !id) return;
    const reason = prompt("Motif du rejet :");
    if (reason === null) return;
    setActionLoading(true);
    try {
      await rejectMembership(membership.id, id, currentUser?.id, reason);
      setMessage({ type: 'success', text: "Adhésion rejetée et fiche annuaire retirée." });
      await fetchMemberData();
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || "Erreur lors du rejet." });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-stone-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#E67E22]" />
        Chargement des informations du membre...
      </div>
    );
  }

  if (!member) return null;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link to="/admin/membres">
            <Button variant="ghost" className="p-2 h-auto text-stone-500 hover:text-stone-900">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold font-heading text-stone-900">
              {member.firstName} {member.lastName}
            </h1>
            <p className="text-sm text-stone-500">
              Inscrit(e) le {new Date(member.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {member.membershipStatus === 'ACTIVE' && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <ShieldCheck className="w-4 h-4 mr-1" /> Membre Officielle Active
          </span>
        )}
      </div>
      
      {message.text && (
        <div className={`p-4 rounded-xl flex items-center gap-3 font-medium ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <ShieldAlert className="w-5 h-5 shrink-0" />}
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* User Information */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-stone-100">
              <CardTitle className="text-stone-900 text-lg">Informations Personnelles</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                <div>
                  <dt className="text-xs font-bold uppercase text-stone-400">Prénom & Nom</dt>
                  <dd className="mt-1 font-semibold text-stone-900">{member.firstName} {member.lastName}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase text-stone-400">Email</dt>
                  <dd className="mt-1 font-semibold text-stone-900">{member.email}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase text-stone-400">Téléphone</dt>
                  <dd className="mt-1 font-semibold text-stone-900">{member.phone || '-'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase text-stone-400">Localisation</dt>
                  <dd className="mt-1 font-semibold text-stone-900">{member.city ? `${member.city}, ` : ''}{member.country || '-'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase text-stone-400">Entreprise</dt>
                  <dd className="mt-1 font-semibold text-stone-900">{member.company || 'Non renseignée'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase text-stone-400">Numéro Membre FAFE</dt>
                  <dd className="mt-1 font-mono font-bold text-[#6B3E1E]">
                    {member.membershipNumber || 'Aucun (en attente)'}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Membership Dossier & Actions */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-stone-100 bg-stone-50/50">
              <CardTitle className="text-stone-900 text-lg flex items-center justify-between">
                <span>Dossier d'Adhésion FAFE</span>
                {membership && (
                  <span className="text-xs font-normal font-mono bg-stone-200/80 px-2 py-0.5 rounded">
                    Statut: {membership.status}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {membership ? (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-stone-400 font-bold uppercase">Montant</p>
                      <p className="font-bold text-stone-900">{membership.amount?.toLocaleString()} {membership.currency}</p>
                    </div>
                    <div>
                      <p className="text-xs text-stone-400 font-bold uppercase">Méthode de paiement</p>
                      <p className="font-medium text-stone-800">{membership.paymentMethod || 'Virement bancaire'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-stone-400 font-bold uppercase">Référence bancaire</p>
                      <p className="font-mono text-stone-800">{membership.bankReference || 'Aucune référence'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-stone-400 font-bold uppercase">Preuve transmise</p>
                      {membership.proofUrl ? (
                        <a 
                          href={membership.proofUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center text-xs text-blue-600 hover:underline font-medium mt-0.5"
                        >
                          <ExternalLink className="w-3.5 h-3.5 mr-1" /> Consulter le justificatif
                        </a>
                      ) : (
                        <span className="text-stone-400 italic">Pas de fichier</span>
                      )}
                    </div>
                  </div>

                  {/* Actions for Membership */}
                  <div className="pt-4 border-t border-stone-100 flex flex-wrap gap-3 items-center">
                    {membership.status !== 'ACTIVE' ? (
                      <Button 
                        onClick={handleApproveMembership}
                        disabled={actionLoading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                      >
                        <Check className="w-4 h-4 mr-2" /> Valider l'Adhésion & Publier
                      </Button>
                    ) : (
                      <Button 
                        onClick={async () => {
                          const reason = prompt("Motif de suspension :");
                          if (!reason) return;
                          setActionLoading(true);
                          await suspendMembership(membership.id, member.id, currentUser?.id, reason);
                          await fetchMemberData();
                          setActionLoading(false);
                        }}
                        disabled={actionLoading}
                        variant="outline"
                        className="border-orange-200 text-orange-700 hover:bg-orange-50"
                      >
                        Suspendre l'adhésion
                      </Button>
                    )}

                    {membership.status !== 'REJECTED' && membership.status !== 'ACTIVE' && (
                      <Button 
                        onClick={handleRejectMembership}
                        disabled={actionLoading}
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <X className="w-4 h-4 mr-2" /> Rejeter
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-stone-500 text-sm py-4">
                  Aucune demande d'adhésion formelle n'a encore été initiée par cet utilisateur.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Entrepreneur Directory Profile Link */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-stone-100">
              <CardTitle className="text-stone-900 text-lg flex items-center justify-between">
                <span>Fiche Annuaire Panafricain</span>
                {entrepreneurProfile && (
                  <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                    entrepreneurProfile.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {entrepreneurProfile.status === 'APPROVED' ? 'Publiée' : entrepreneurProfile.status}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {entrepreneurProfile ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-stone-900">{entrepreneurProfile.company}</p>
                    <p className="text-xs text-[#E67E22] font-bold uppercase">{entrepreneurProfile.sector}</p>
                    <p className="text-xs text-stone-500 mt-1">{entrepreneurProfile.position}</p>
                  </div>
                  <Link to={`/admin/entrepreneures/${entrepreneurProfile.id}`}>
                    <Button variant="outline" size="sm" className="text-[#E67E22] border-[#E67E22]/30 hover:bg-orange-50">
                      Gérer la fiche annuaire <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-stone-500">
                  Pas encore de fiche annuaire distincte. La fiche sera automatiquement créée dès validation de l'adhésion.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Administration Sidebar */}
        <div className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-stone-100 bg-stone-50">
              <CardTitle className="text-stone-900 flex items-center gap-2 text-base">
                <ShieldAlert className="w-5 h-5 text-[#E67E22]" /> Paramètres Système
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase text-stone-600 mb-2">Rôle système</label>
                <select 
                  className="w-full h-10 rounded-md border border-stone-200 bg-white px-3 text-sm focus:ring-[#E67E22] focus:border-[#E67E22]"
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  disabled={id === currentUser?.id}
                >
                  <option value="MEMBER">MEMBER (Membre)</option>
                  <option value="ENTREPRENEUR">ENTREPRENEUR</option>
                  <option value="TRAINER">TRAINER</option>
                  <option value="MODERATOR">MODERATOR</option>
                  <option value="CONTENT_MANAGER">CONTENT_MANAGER</option>
                  <option value="FINANCE_MANAGER">FINANCE_MANAGER</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-stone-600 mb-2">Statut du compte</label>
                <select 
                  className="w-full h-10 rounded-md border border-stone-200 bg-white px-3 text-sm focus:ring-[#E67E22] focus:border-[#E67E22]"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as UserStatus)}
                  disabled={id === currentUser?.id}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                  <option value="PENDING">PENDING</option>
                </select>
              </div>

              <Button 
                className="w-full bg-[#E67E22] hover:bg-[#c96a1a] text-white" 
                onClick={handleUpdate}
                disabled={saving || id === currentUser?.id}
              >
                {saving ? 'Enregistrement...' : 'Enregistrer les rôles'}
              </Button>
              
              {id === currentUser?.id && (
                <p className="text-xs text-stone-500 text-center">Vous ne pouvez pas modifier vos propres droits.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
