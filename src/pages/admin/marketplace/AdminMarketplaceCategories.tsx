import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, AlertCircle, CheckCircle, X, Layers } from 'lucide-react';
import { MarketplaceCategory } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { marketplaceService } from '../../../services/marketplace';

export function AdminMarketplaceCategories() {
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<MarketplaceCategory> | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const cats = await marketplaceService.getCategories();
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
      const cleanedSlug = editingCategory.slug && editingCategory.slug.trim()
        ? editingCategory.slug.trim()
        : editingCategory.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

      const payload: Omit<MarketplaceCategory, 'id'> = {
        name: editingCategory.name.trim(),
        slug: cleanedSlug,
        description: editingCategory.description || '',
        isActive: editingCategory.isActive ?? true,
        order: editingCategory.order ?? categories.length,
        createdAt: editingCategory.createdAt || Date.now(),
        updatedAt: Date.now()
      };

      await marketplaceService.saveCategory({
        ...payload,
        id: editingCategory.id
      });

      setNotice(editingCategory.id ? 'Catégorie modifiée avec succès.' : 'Nouvelle catégorie créée avec succès.');
      setTimeout(() => setNotice(null), 3000);

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
    try {
      setLoading(true);
      await marketplaceService.deleteCategory(id);
      setDeleteConfirmId(null);
      setNotice('Catégorie supprimée.');
      setTimeout(() => setNotice(null), 3000);
      await fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-stone-900">Catégories de Produits</h1>
          <p className="text-sm text-stone-500">Structurez et organisez les rayons de la boutique FAFE</p>
        </div>
        <Button 
          onClick={() => { 
            setEditingCategory({ 
              name: '', 
              description: '', 
              isActive: true, 
              order: categories.length 
            }); 
            setIsEditing(true); 
          }} 
          className="bg-[#00843D] hover:bg-[#006830] text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouvelle Catégorie
        </Button>
      </div>

      {notice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          {notice}
        </div>
      )}

      {/* Edit modal / card */}
      {isEditing && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-stone-100">
            <h2 className="text-lg font-bold text-stone-900">
              {editingCategory?.id ? 'Modifier la catégorie' : 'Créer une nouvelle catégorie'}
            </h2>
            <button 
              onClick={() => setIsEditing(false)}
              className="p-1 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Nom de la catégorie *
              </label>
              <input
                type="text"
                required
                placeholder="ex: Artisanat & Maroquinerie"
                value={editingCategory?.name || ''}
                onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-[#00843D] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Description
              </label>
              <textarea
                placeholder="Brève description de la typologie d'articles..."
                value={editingCategory?.description || ''}
                onChange={e => setEditingCategory({ ...editingCategory, description: e.target.value })}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-[#00843D] outline-none"
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm font-medium text-stone-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingCategory?.isActive ?? true}
                  onChange={e => setEditingCategory({ ...editingCategory, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-[#00843D] focus:ring-[#00843D]"
                />
                Catégorie active (visible dans les filtres publics)
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-stone-100">
              <Button variant="outline" type="button" onClick={() => setIsEditing(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={loading} className="bg-[#00843D] hover:bg-[#006830] text-white">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Enregistrer
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Delete confirmation banner */}
      {deleteConfirmId && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-red-800">
              Supprimer cette catégorie ? Les articles associés resteront dans le catalogue.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setDeleteConfirmId(null)}
              className="px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-white rounded-lg"
            >
              Annuler
            </button>
            <button 
              onClick={() => handleDelete(deleteConfirmId)}
              className="px-3 py-1.5 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Supprimer
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-600">
          <thead className="bg-stone-50 border-b border-stone-200 text-stone-800">
            <tr>
              <th className="px-6 py-4 font-bold">Catégorie</th>
              <th className="px-6 py-4 font-bold">Identifiant / Slug</th>
              <th className="px-6 py-4 font-bold">Statut</th>
              <th className="px-6 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-stone-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-semibold text-stone-900">{cat.name}</div>
                  {cat.description && <div className="text-xs text-stone-500 line-clamp-1">{cat.description}</div>}
                </td>
                <td className="px-6 py-4 font-mono text-xs text-stone-500">
                  {cat.slug}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    cat.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'
                  }`}>
                    {cat.isActive ? 'Active' : 'Masquée'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-1">
                    <button 
                      onClick={() => { setEditingCategory(cat); setIsEditing(true); }} 
                      className="p-2 text-stone-500 hover:text-[#00843D] transition-colors rounded-lg hover:bg-stone-100"
                      title="Modifier"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setDeleteConfirmId(cat.id)} 
                      className="p-2 text-stone-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && !loading && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-stone-500">
                  Aucune catégorie configurée pour le moment.
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
