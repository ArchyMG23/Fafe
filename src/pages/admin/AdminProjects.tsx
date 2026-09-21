import { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, addDoc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Project } from '../../types';
import { DEMO_PROJECTS } from '../../lib/mockData';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Plus, Loader2, Edit, CheckCircle2, XCircle, Trash2, ExternalLink, RefreshCw } from 'lucide-react';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { DataTable, Column } from '../../components/admin/DataTable';
import React from 'react';

export function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create/Edit state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE' | 'ARCHIVED'>('ACTIVE');
  const [donationEnabled, setDonationEnabled] = useState(true);
  const [country, setCountry] = useState('Panafricain');
  const [impact, setImpact] = useState('');
  const [objectivesText, setObjectivesText] = useState('');
  const [targetAmount, setTargetAmount] = useState<number>(0);
  const [raisedAmount, setRaisedAmount] = useState<number>(0);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'projects'));
      const snap = await getDocs(q);
      let fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      
      // If Firestore is empty, auto-seed with default demo projects
      if (fetched.length === 0) {
        for (const demo of DEMO_PROJECTS) {
          try {
            await setDoc(doc(db, 'projects', demo.id), {
              ...demo,
              createdAt: Date.now(),
              updatedAt: Date.now()
            });
            fetched.push(demo);
          } catch (seedErr) {
            console.warn("Could not seed demo project:", seedErr);
            fetched.push(demo);
          }
        }
      }
      
      fetched.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setProjects(fetched);
    } catch (error) {
      console.error("Error fetching projects, fallback to defaults:", error);
      setProjects(DEMO_PROJECTS);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (p: Project) => {
    setEditingId(p.id);
    setTitle(p.title || '');
    setDescription(p.description || '');
    setImage(p.image || '');
    setStatus(p.status || 'ACTIVE');
    setDonationEnabled(p.donationEnabled ?? true);
    setCountry(p.country || 'Panafricain');
    setImpact(p.impact || '');
    setObjectivesText(Array.isArray(p.objectives) ? p.objectives.join('\n') : '');
    setTargetAmount(p.targetAmount || 0);
    setRaisedAmount(p.raisedAmount || 0);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setImage('https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=800');
    setStatus('ACTIVE');
    setDonationEnabled(true);
    setCountry('Panafricain');
    setImpact('');
    setObjectivesText('');
    setTargetAmount(5000000);
    setRaisedAmount(0);
    setIsFormOpen(true);
  };

  const handleDelete = async (p: Project) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le projet "${p.title}" ?`)) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'projects', p.id));
      await fetchProjects();
    } catch (err) {
      console.error("Error deleting project:", err);
      alert("Erreur lors de la suppression du projet.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const parsedObjectives = objectivesText
        .split('\n')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const pData: Partial<Project> = {
        title,
        description,
        status,
        donationEnabled,
        country,
        image: image || 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=800',
        impact: impact || undefined,
        objectives: parsedObjectives.length > 0 ? parsedObjectives : undefined,
        targetAmount: Number(targetAmount) || 0,
        raisedAmount: Number(raisedAmount) || 0,
        updatedAt: Date.now()
      };

      if (editingId) {
        await setDoc(doc(db, 'projects', editingId), pData, { merge: true });
      } else {
        const newDocRef = doc(collection(db, 'projects'));
        await setDoc(newDocRef, {
          ...pData,
          id: newDocRef.id,
          createdAt: Date.now()
        });
      }
      
      await fetchProjects();
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error saving project", error);
      alert("Erreur lors de la sauvegarde du projet.");
    } finally {
      setSaving(false);
    }
  };

  const toggleDonation = async (p: Project) => {
    try {
      await updateDoc(doc(db, 'projects', p.id), { donationEnabled: !p.donationEnabled, updatedAt: Date.now() });
      await fetchProjects();
    } catch(e) {
      console.error("Error toggling donation:", e);
    }
  };

  const columns: Column<Project>[] = [
    {
      header: 'Visuel',
      accessor: (p) => (
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
          <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
        </div>
      )
    },
    {
      header: 'Titre & Périmètre',
      accessor: (p) => (
        <div>
          <span className="font-bold text-[#063F3A] block max-w-sm line-clamp-1">{p.title}</span>
          <span className="text-xs text-stone-500">{p.country}</span>
        </div>
      )
    },
    {
      header: 'Statut',
      accessor: (p) => {
        if (p.status === 'ACTIVE') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">Actif (Accueil)</span>;
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
        <div className="flex items-center justify-end gap-1">
          <a
            href={`/projets-sociaux/${p.id}`}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 text-stone-400 hover:text-[#063F3A] hover:bg-stone-100 rounded-lg transition-colors"
            title="Voir la page publique détaillée"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => { e.stopPropagation(); handleEdit(p); }} 
            className="text-[#00843D] hover:text-[#006A31] hover:bg-green-50 p-1.5"
            title="Modifier"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => { e.stopPropagation(); handleDelete(p); }} 
            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Gestion des Projets Sociaux"
        description="Créez et mettez à jour les projets visibles sur la page d'accueil et leurs fiches détaillées respectives."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={fetchProjects} className="text-stone-600 border-stone-300">
              <RefreshCw className="w-4 h-4 mr-2" /> Actualiser
            </Button>
            <Button onClick={handleCreate} className="bg-[#00843D] hover:bg-[#006A31] text-white">
              <Plus className="w-4 h-4 mr-2" /> Nouveau Projet
            </Button>
          </div>
        }
      />

      {isFormOpen && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xl mb-6 relative">
          <button 
            type="button" 
            onClick={() => setIsFormOpen(false)} 
            className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 p-1 rounded-full hover:bg-stone-100"
          >
            <XCircle className="w-6 h-6" />
          </button>
          
          <div className="mb-6 pb-4 border-b border-stone-100">
            <h2 className="text-xl font-bold font-heading text-[#063F3A]">
              {editingId ? 'Modifier le projet' : 'Créer un nouveau projet'}
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Les modifications enregistrées ici sont directement publiées sur la page d'accueil et sur la page de détail.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Titre du Projet *
                </label>
                <Input 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  required 
                  placeholder="Ex: Programme d'Accélération Agri-Tech Féminine"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Périmètre Géographique / Pays *
                </label>
                <Input 
                  value={country} 
                  onChange={e => setCountry(e.target.value)} 
                  required 
                  placeholder="Ex: Panafricain, Sénégal, Côte d'Ivoire..."
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Image de couverture (URL) *
              </label>
              <div className="flex gap-4 items-start">
                <Input 
                  value={image} 
                  onChange={e => setImage(e.target.value)} 
                  required 
                  placeholder="https://images.unsplash.com/..." 
                  className="flex-1"
                />
                {image && (
                  <div className="w-20 h-14 rounded-lg overflow-hidden border border-stone-200 shrink-0 bg-stone-50">
                    <img src={image} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as any).style.display = 'none'; }} />
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Description synthétique (Affichée sur l'Accueil & en haut de fiche) *
              </label>
              <Textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                required 
                rows={3} 
                placeholder="Décrivez l'enjeu, le public cible et l'action concrète menée..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Objectifs du projet (1 par ligne)
                </label>
                <Textarea 
                  value={objectivesText} 
                  onChange={e => setObjectivesText(e.target.value)} 
                  rows={4} 
                  placeholder="Former 500 coopératives féminines&#10;Faciliter l'accès aux micro-crédits solaires&#10;Créer un réseau de distribution transfrontalier"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Impact visé / Mesurable
                </label>
                <Textarea 
                  value={impact} 
                  onChange={e => setImpact(e.target.value)} 
                  rows={4} 
                  placeholder="Plus de 2 000 emplois directs consolidés et une augmentation moyenne des revenus de 45% pour les bénéficiaires."
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Statut d'affichage
                </label>
                <select 
                  className="w-full h-10 px-3 rounded-lg border border-stone-200 bg-white text-sm focus:ring-2 focus:ring-[#00843D]"
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                >
                  <option value="ACTIVE">Actif (Visible sur l'Accueil)</option>
                  <option value="INACTIVE">Inactif (Masqué)</option>
                  <option value="ARCHIVED">Archivé</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Montant cible (XOF)
                </label>
                <Input 
                  type="number" 
                  value={targetAmount} 
                  onChange={e => setTargetAmount(Number(e.target.value))} 
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={donationEnabled}
                    onChange={e => setDonationEnabled(e.target.checked)}
                    className="w-4 h-4 rounded border-stone-300 text-[#00843D] focus:ring-[#00843D]"
                  />
                  <span className="text-xs font-bold text-stone-800">Éligible aux dons en ligne</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-5 border-t border-stone-100">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={saving} className="bg-[#00843D] hover:bg-[#006A31] text-white font-bold">
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingId ? 'Mettre à jour le projet' : 'Créer le projet'}
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
