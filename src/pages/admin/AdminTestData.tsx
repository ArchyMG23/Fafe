import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { UserProfile, Project } from '../../types';
import { Button } from '../../components/ui/Button';
import { Trash2, AlertTriangle, CheckSquare, Square } from 'lucide-react';
import { useAuthStore } from '../../store/auth';

export function AdminTestData() {
  const { userProfile } = useAuthStore();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [selectedProjectIds, setSelectedProjectIds] = useState<Set<string>>(new Set());
  
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmWord, setConfirmWord] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Security: only SUPER_ADMIN
  if (userProfile?.role !== 'SUPER_ADMIN') {
    return (
      <div className="p-8 text-center text-stone-500">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
        Accès restreint aux SUPER_ADMIN.
      </div>
    );
  }

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const uSnap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
      const pSnap = await getDocs(query(collection(db, 'projects'), orderBy('createdAt', 'desc')));
      
      const fetchedUsers: UserProfile[] = [];
      uSnap.forEach(d => fetchedUsers.push({ id: d.id, ...d.data() } as UserProfile));
      
      const fetchedProjects: Project[] = [];
      pSnap.forEach(d => fetchedProjects.push({ id: d.id, ...d.data() } as Project));
      
      setUsers(fetchedUsers);
      setProjects(fetchedProjects);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = (id: string) => {
    const next = new Set(selectedUserIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedUserIds(next);
  };

  const toggleProject = (id: string) => {
    const next = new Set(selectedProjectIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedProjectIds(next);
  };

  const handleDelete = async () => {
    if (confirmWord !== 'SUPPRIMER') return;
    setDeleting(true);
    try {
      // 1. Delete selected projects
      for (const pid of Array.from(selectedProjectIds)) {
        await deleteDoc(doc(db, 'projects', pid));
      }
      
      // 2. Delete selected users
      for (const uid of Array.from(selectedUserIds)) {
        await deleteDoc(doc(db, 'users', uid));
        // We could also delete related projects if we want, but they can select them manually.
      }
      
      // 3. Log to admin_logs
      if (selectedUserIds.size > 0 || selectedProjectIds.size > 0) {
        // Here we could add a log entry to admin_logs if we wanted
        // await addDoc(collection(db, 'admin_logs'), { ... })
      }

      setShowConfirm(false);
      setConfirmWord('');
      setSelectedUserIds(new Set());
      setSelectedProjectIds(new Set());
      await fetchData();
    } catch (error) {
      console.error('Error deleting data:', error);
      alert('Erreur lors de la suppression.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fade-in max-w-6xl mx-auto">
      <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-200 shadow-sm flex items-start gap-4">
        <AlertTriangle className="w-8 h-8 shrink-0" />
        <div>
          <h2 className="text-xl font-bold font-heading mb-2">Zone Dangereuse : Gestion des Données</h2>
          <p className="text-sm opacity-90">
            Cet outil vous permet de supprimer manuellement des comptes ou des projets de test. 
            <strong> Attention : Cette action est irréversible dans Firestore.</strong><br/>
            La suppression du compte Firebase Auth n'est pas effectuée ici (à faire dans la console Firebase pour éviter les erreurs).
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Users */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-stone-100 bg-stone-50/50">
            <h3 className="font-bold text-[#6B3E1E]">Comptes Membres ({users.length})</h3>
          </div>
          <div className="p-4 flex-1 overflow-y-auto max-h-[500px]">
            {users.map(u => (
              <div key={u.id} className="flex items-center gap-3 p-3 hover:bg-stone-50 rounded-xl transition-colors border border-transparent hover:border-stone-100 group">
                <button onClick={() => toggleUser(u.id)} className="text-stone-400 group-hover:text-[#E67E22] transition-colors">
                  {selectedUserIds.has(u.id) ? <CheckSquare className="w-5 h-5 text-[#E67E22]" /> : <Square className="w-5 h-5" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{u.firstName} {u.lastName}</div>
                  <div className="text-xs text-stone-500 truncate">{u.email}</div>
                </div>
                <div className="text-[10px] text-stone-400">
                  {new Date(u.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-stone-100 bg-stone-50/50">
            <h3 className="font-bold text-[#6B3E1E]">Projets / Entreprises ({projects.length})</h3>
          </div>
          <div className="p-4 flex-1 overflow-y-auto max-h-[500px]">
            {projects.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-3 hover:bg-stone-50 rounded-xl transition-colors border border-transparent hover:border-stone-100 group">
                <button onClick={() => toggleProject(p.id)} className="text-stone-400 group-hover:text-[#E67E22] transition-colors">
                  {selectedProjectIds.has(p.id) ? <CheckSquare className="w-5 h-5 text-[#E67E22]" /> : <Square className="w-5 h-5" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{p.title}</div>
                  <div className="text-xs text-stone-500 truncate">{p.country}</div>
                </div>
                <div className="text-[10px] text-stone-400">
                  {new Date(p.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 flex items-center justify-between">
        <div>
          <h4 className="font-bold text-stone-800">Action de suppression</h4>
          <p className="text-sm text-stone-500">
            Sélectionnés : {selectedUserIds.size} membre(s), {selectedProjectIds.size} projet(s)
          </p>
        </div>
        <Button 
          onClick={() => setShowConfirm(true)} 
          disabled={selectedUserIds.size === 0 && selectedProjectIds.size === 0}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Supprimer la sélection
        </Button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            
            <h2 className="text-xl font-bold text-center mb-4 text-stone-800">
              Confirmation de suppression
            </h2>
            
            <div className="bg-stone-50 p-4 rounded-xl mb-6">
              <p className="text-sm text-stone-600 text-center mb-2">Vous êtes sur le point de supprimer définitivement :</p>
              <ul className="text-sm font-bold text-center space-y-1">
                {selectedUserIds.size > 0 && <li className="text-red-600">{selectedUserIds.size} profil(s) membre</li>}
                {selectedProjectIds.size > 0 && <li className="text-red-600">{selectedProjectIds.size} projet(s)</li>}
              </ul>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1 text-center">
                  Tapez <strong>SUPPRIMER</strong> pour confirmer
                </label>
                <input 
                  type="text"
                  value={confirmWord}
                  onChange={(e) => setConfirmWord(e.target.value)}
                  className="w-full border-stone-200 rounded-xl focus:ring-red-500 focus:border-red-500 text-center font-bold"
                  placeholder="SUPPRIMER"
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowConfirm(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button 
                  onClick={handleDelete}
                  disabled={confirmWord !== 'SUPPRIMER' || deleting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {deleting ? 'Suppression...' : 'Confirmer'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
