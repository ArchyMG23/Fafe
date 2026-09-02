import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, addDoc, updateDoc, doc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import { db } from '../../../lib/firebase';
import { MarketplaceCategory } from '../../../types';
import { Button } from '../../../components/ui/Button';

export function AdminMarketplaceCategories() {
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<MarketplaceCategory> | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'marketplace_categories'), orderBy('order', 'asc'));
      const snap = await getDocs(q);
      const cats: MarketplaceCategory[] = [];
      snap.forEach(doc => cats.push({ id: doc.id, ...doc.data() } as MarketplaceCategory));
      setCategories(cats);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name) return;

    try {
      setLoading(true);
      const slug = editingCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      if (editingCategory.id) {
        await updateDoc(doc(db, 'marketplace_categories', editingCategory.id), {
          ...editingCategory,
          slug,
          updatedAt: Date.now()
        });
      } else {
        await addDoc(collection(db, 'marketplace_categories'), {
          ...editingCategory,
          slug,
          isActive: true,
          order: categories.length,
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
      }
      
      setIsEditing(false);
      setEditingCategory(null);
      await fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Confirmer la suppression ? (Vérifiez qu\'aucun produit n\'utilise cette catégorie)')) return;
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'marketplace_categories', id));
      await fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-heading text-stone-800">Catégories Boutique</h1>
          <p className="text-stone-500">Gérez les catégories de la marketplace</p>
        </div>
        <Button onClick={() => { setEditingCategory({ name: '', description: '' }); setIsEditing(true); }} className="bg-[#6B3E1E] text-white">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Catégorie
        </Button>
      </div>

      {isEditing && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
          <h2 className="text-lg font-bold mb-4">{editingCategory?.id ? 'Modifier' : 'Créer'} une catégorie</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nom</label>
              <input
                type="text"
                required
                value={editingCategory?.name || ''}
                onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })}
                className="w-full p-2 border border-stone-200 rounded-lg focus:ring-[#E67E22] focus:border-[#E67E22]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description (optionnelle)</label>
              <textarea
                value={editingCategory?.description || ''}
                onChange={e => setEditingCategory({ ...editingCategory, description: e.target.value })}
                className="w-full p-2 border border-stone-200 rounded-lg focus:ring-[#E67E22] focus:border-[#E67E22]"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={() => setIsEditing(false)}>Annuler</Button>
              <Button type="submit" disabled={loading} className="bg-[#E67E22] text-white">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <table className="w-full text-left text-sm text-stone-600">
          <thead className="bg-stone-50 border-b border-stone-200 text-stone-800">
            <tr>
              <th className="px-6 py-4 font-bold">Nom</th>
              <th className="px-6 py-4 font-bold">Slug</th>
              <th className="px-6 py-4 font-bold">Statut</th>
              <th className="px-6 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-stone-50 transition-colors">
                <td className="px-6 py-4 font-medium text-stone-800">{cat.name}</td>
                <td className="px-6 py-4">{cat.slug}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${cat.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-600'}`}>
                    {cat.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => { setEditingCategory(cat); setIsEditing(true); }} className="p-2 text-stone-400 hover:text-[#6B3E1E] transition-colors rounded-lg hover:bg-stone-100">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(cat.id)} className="p-2 text-stone-400 hover:text-red-500 transition-colors rounded-lg hover:bg-stone-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && !loading && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-stone-500">Aucune catégorie trouvée</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
