import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, setDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Category } from '../../../types';
import { AdminPageHeader } from '../../../components/admin/AdminPageHeader';
import { DataTable, Column } from '../../../components/admin/DataTable';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Plus, Edit, XCircle, CheckCircle2 } from 'lucide-react';

export function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const q = query(collection(db, 'categories'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
    } catch (error) {
      console.error("Error fetching categories", error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (text: string) => {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')           
      .replace(/[^\w\-]+/g, '')       
      .replace(/\-\-+/g, '-')         
      .replace(/^-+/, '')             
      .replace(/-+$/, '');            
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (!editingId) {
      setSlug(generateSlug(e.target.value));
    }
  };

  const handleEdit = (c: Category) => {
    setEditingId(c.id);
    setName(c.name);
    setSlug(c.slug);
    setDescription(c.description || '');
    setStatus(c.status);
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        name,
        slug,
        description,
        status,
        updatedAt: Date.now()
      };
      if (editingId) {
        await updateDoc(doc(db, 'categories', editingId), data);
      } else {
        const newId = doc(collection(db, 'categories')).id;
        await setDoc(doc(db, 'categories', newId), {
          ...data,
          createdAt: Date.now()
        });
      }
      setIsFormOpen(false);
      fetchCategories();
    } catch (e) {
      console.error(e);
      alert("Erreur");
    }
  };

  const toggleStatus = async (c: Category) => {
    await updateDoc(doc(db, 'categories', c.id), { status: c.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE', updatedAt: Date.now() });
    fetchCategories();
  };

  const columns: Column<Category>[] = [
    { header: 'Nom', accessor: (c) => <span className="font-bold text-[#6B3E1E]">{c.name}</span> },
    { header: 'Slug', accessor: 'slug' },
    { header: 'Description', accessor: 'description' },
    { 
      header: 'Statut', 
      accessor: (c) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${c.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-stone-100 text-stone-800'}`}>
          {c.status === 'ACTIVE' ? 'Actif' : 'Inactif'}
        </span>
      ) 
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (c) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); toggleStatus(c); }} className="text-stone-500 hover:text-stone-700 hover:bg-stone-100 p-2">
            {c.status === 'ACTIVE' ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleEdit(c); }} className="text-[#E67E22] hover:text-[#c96a1a] hover:bg-orange-50 p-2">
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Catégories"
        description="Gérez les catégories d'articles."
        action={
          <Button onClick={() => { setEditingId(null); setName(''); setSlug(''); setDescription(''); setIsFormOpen(true); }} className="bg-[#E67E22] text-white">
            <Plus className="w-4 h-4 mr-2" /> Ajouter
          </Button>
        }
      />

      {isFormOpen && (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm mb-6 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-[#6B3E1E]">{editingId ? 'Éditer la catégorie' : 'Nouvelle catégorie'}</h3>
            <button type="button" onClick={() => setIsFormOpen(false)} className="text-stone-400 hover:text-stone-600"><XCircle className="w-5 h-5"/></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-bold text-stone-700 mb-1">Nom *</label><Input value={name} onChange={handleNameChange} required /></div>
            <div><label className="block text-sm font-bold text-stone-700 mb-1">Slug *</label><Input value={slug} onChange={e => setSlug(e.target.value)} required /></div>
          </div>
          <div><label className="block text-sm font-bold text-stone-700 mb-1">Description</label><Input value={description} onChange={e => setDescription(e.target.value)} /></div>
          <div className="flex justify-end pt-4"><Button type="submit" className="bg-[#E67E22] text-white">Enregistrer</Button></div>
        </form>
      )}

      <DataTable columns={columns} data={categories} loading={loading} keyExtractor={(c) => c.id} />
    </div>
  );
}
