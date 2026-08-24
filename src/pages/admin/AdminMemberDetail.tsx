import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { UserProfile, Role, UserStatus } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Loader2, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../store/auth';

export function AdminMemberDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userProfile: currentUser } = useAuthStore();
  
  const [member, setMember] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [role, setRole] = useState<Role>('MEMBER');
  const [status, setStatus] = useState<UserStatus>('ACTIVE');

  useEffect(() => {
    const fetchMember = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'users', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          setMember(data);
          setRole(data.role || 'MEMBER');
          setStatus(data.status || 'ACTIVE');
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
    
    fetchMember();
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
      // Prevent changing own role or status
      if (id === currentUser?.id) {
        throw new Error("Vous ne pouvez pas modifier votre propre rôle ou statut.");
      }

      await updateDoc(doc(db, 'users', id), {
        role,
        status,
        updatedAt: Date.now()
      });
      
      setMember(prev => prev ? { ...prev, role, status } : null);
      setMessage({ type: 'success', text: 'Membre mis à jour avec succès.' });
    } catch (error: any) {
      console.error("Error updating member", error);
      setMessage({ type: 'error', text: error.message || 'Erreur lors de la mise à jour.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-stone-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#E67E22]" />
        Chargement...
      </div>
    );
  }

  if (!member) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/membres">
          <Button variant="ghost" className="p-2 h-auto text-stone-500 hover:text-stone-900">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold font-heading text-stone-900">Détails du Membre</h1>
      </div>
      
      {message.text && (
        <div className={`p-4 rounded-xl flex items-center gap-3 font-medium ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm md:col-span-2">
          <CardHeader className="border-b border-stone-100">
            <CardTitle className="text-stone-900">Informations Personnelles</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
              <div>
                <dt className="text-sm font-medium text-stone-500">Prénom</dt>
                <dd className="mt-1 font-medium text-stone-900">{member.firstName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-stone-500">Nom</dt>
                <dd className="mt-1 font-medium text-stone-900">{member.lastName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-stone-500">Email</dt>
                <dd className="mt-1 font-medium text-stone-900">{member.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-stone-500">Téléphone</dt>
                <dd className="mt-1 font-medium text-stone-900">{member.phone || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-stone-500">Pays</dt>
                <dd className="mt-1 font-medium text-stone-900">{member.country || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-stone-500">Ville</dt>
                <dd className="mt-1 font-medium text-stone-900">{member.city || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-stone-500">Date d'inscription</dt>
                <dd className="mt-1 font-medium text-stone-900">{new Date(member.createdAt).toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-stone-500">Dernière connexion</dt>
                <dd className="mt-1 font-medium text-stone-900">{member.lastLoginAt ? new Date(member.lastLoginAt).toLocaleString() : '-'}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b border-stone-100 bg-stone-50">
            <CardTitle className="text-stone-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#E67E22]" /> Administration
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Rôle système</label>
              <select 
                className="w-full h-10 rounded-md border border-stone-200 bg-white px-3 text-sm focus:ring-[#E67E22] focus:border-[#E67E22]"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                disabled={id === currentUser?.id}
              >
                <option value="MEMBER">MEMBER (Membre standard)</option>
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
              <label className="block text-sm font-bold text-stone-700 mb-2">Statut du compte</label>
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
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
            
            {id === currentUser?.id && (
              <p className="text-xs text-stone-500 text-center">Vous ne pouvez pas modifier vos propres droits.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
