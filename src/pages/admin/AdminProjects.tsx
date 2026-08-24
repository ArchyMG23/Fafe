import { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Project } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Plus, Loader2, Edit, CheckCircle2, XCircle } from 'lucide-react';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { DataTable, Column } from '../../components/admin/DataTable';
import React from 'react'; // Added to fix potential lint error

export function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create/Edit state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE' | 'ARCHIVED'>('ACTIVE');
  const [donationEnabled, setDonationEnabled] = useState(true);
  const [country, setCountry] = useState('Panafricain');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const q = query(collection(db, 'projects'));
      const snap = await getDocs(q);
      const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      fetched.sort((a, b) => b.createdAt - a.createdAt);
      setProjects(fetched);
    } catch (error) {
      console.error("Error fetching projects", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (p: Project) => {
    setEditingId(p.id);
    setTitle(p.title);
    setDescription(p.description);
    setStatus(p.status);
    setDonationEnabled(p.donationEnabled);
    setCountry(p.country);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setStatus('ACTIVE');
    setDonationEnabled(true);
    setCountry('Panafricain');
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const pData = {
        title,
        description,
        status,
        donationEnabled,
        country,
        image: 'https://images.unsplash.com/photo-1531206715517-5c0ba140b4b8?auto=format&fit=crop&q=80',
        updatedAt: Date.now()
      };

      if (editingId) {
        await updateDoc(doc(db, 'projects', editingId), pData);
      } else {
        await addDoc(collection(db, 'projects'), {
          ...pData,
          createdAt: Date.now()
        });
      }
      
      await fetchProjects();
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error saving project", error);
      alert("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  const toggleDonation = async (p: Project) => {
    try {
      await updateDoc(doc(db, 'projects', p.id), { donationEnabled: !p.donationEnabled, updatedAt: Date.now() });
      await fetchProjects();
    } catch(e) {
      console.error("Error", e);
    }
  };

  const columns: Column<Project>[] = [
    {
      header: 'Titre',
      accessor: (p) => <span className="font-bold text-[#6B3E1E] max-w-xs truncate">{p.title}</span>
    },
    {
      header: 'Périmètre',
      accessor: (p) => <span className="text-stone-600">{p.country}</span>
    },
    {
      header: 'Statut',
      accessor: (p) => {
        if (p.status === 'ACTIVE') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">Actif</span>;
        if (p.status === 'ARCHIVED') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-stone-100 text-stone-800">Archivé</span>;
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">Inactif</span>;
      }
    },
    {
      header: 'Dons',
      accessor: (p) => (
        <button 
          onClick={(e) => { e.stopPropagation(); toggleDonation(p); }}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold border transition-colors ${p.donationEnabled ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100'}`}
        >
          {p.donationEnabled ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
          {p.donationEnabled ? 'Activés' : 'Désactivés'}
        </button>
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (p) => (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={(e) => { e.stopPropagation(); handleEdit(p); }} 
          className="text-[#E67E22] hover:text-[#c96a1a] hover:bg-orange-50"
        >
          <Edit className="w-4 h-4" />
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Gestion des Projets"
        description="Gérez les projets sociaux et leur éligibilité aux dons."
        action={
          <Button onClick={handleCreate} className="bg-[#E67E22] hover:bg-[#c96a1a] text-white">
            <Plus className="w-4 h-4 mr-2" /> Nouveau Projet
          </Button>
        }
      />

      {isFormOpen && (
        <div className="bg-white p-6 rounded-xl border border-[#E67E22]/30 shadow-md mb-6 relative">
          <button onClick={() => setIsFormOpen(false)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600">
            <XCircle className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-bold text-[#6B3E1E] mb-4">{editingId ? 'Modifier le projet' : 'Nouveau projet'}</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">Titre</label>
                <Input value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">Périmètre / Pays</label>
                <Input value={country} onChange={e => setCountry(e.target.value)} required />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1">Description</label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} required rows={4} />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">Statut d'affichage</label>
                <select 
                  className="w-full h-10 px-3 rounded-md border border-stone-200 bg-white text-sm"
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                >
                  <option value="ACTIVE">Actif (Visible)</option>
                  <option value="INACTIVE">Inactif (Brouillon)</option>
                  <option value="ARCHIVED">Archivé</option>
                </select>
              </div>
              <div className="flex items-center mt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={donationEnabled}
                    onChange={e => setDonationEnabled(e.target.checked)}
                    className="rounded border-stone-300 text-green-600 focus:ring-green-600"
                  />
                  <span className="text-sm font-bold text-stone-700">Activer les dons pour ce projet</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={saving} className="bg-[#E67E22] text-white">
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Enregistrer
              </Button>
            </div>
          </form>
        </div>
      )}

      <DataTable
        columns={columns}
        data={projects}
        loading={loading}
        keyExtractor={(p) => p.id}
        emptyMessage="Aucun projet trouvé."
      />
    </div>
  );
}
