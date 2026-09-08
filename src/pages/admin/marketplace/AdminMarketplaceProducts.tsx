import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, Search, Filter, Image as ImageIcon, CheckCircle, AlertCircle, X } from 'lucide-react';
import { Product, MarketplaceCategory } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { marketplaceService } from '../../../services/marketplace';

export function AdminMarketplaceProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prods, cats] = await Promise.all([
        marketplaceService.getProducts(),
        marketplaceService.getCategories()
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (error) {
      console.error('Error fetching admin marketplace data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct.categoryId) return;

    try {
      setLoading(true);
      const cleanedSlug = editingProduct.slug && editingProduct.slug.trim() 
        ? editingProduct.slug.trim() 
        : editingProduct.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

      const productPayload: Omit<Product, 'id'> = {
        name: editingProduct.name.trim(),
        slug: cleanedSlug,
        categoryId: editingProduct.categoryId,
        price: Math.max(0, Number(editingProduct.price) || 0),
        promotionalPrice: editingProduct.promotionalPrice ? Math.max(0, Number(editingProduct.promotionalPrice)) : null,
        stock: Math.max(0, Number(editingProduct.stock) || 0),
        currency: editingProduct.currency || 'XAF',
        status: editingProduct.status || 'PUBLISHED',
        isFeatured: Boolean(editingProduct.isFeatured),
        shortDescription: editingProduct.shortDescription || '',
        fullDescription: editingProduct.fullDescription || '',
        images: editingProduct.images && editingProduct.images.length > 0 
          ? editingProduct.images 
          : ['https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=1000&q=80'],
        createdAt: editingProduct.createdAt || Date.now(),
        updatedAt: Date.now()
      };

      await marketplaceService.saveProduct({
        ...productPayload,
        id: editingProduct.id
      });

      setActionSuccess(editingProduct.id ? 'Produit mis à jour avec succès.' : 'Nouveau produit créé avec succès.');
      setTimeout(() => setActionSuccess(null), 3000);

      setIsEditing(false);
      setEditingProduct(null);
      setNewImageUrl('');
      await fetchData();
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await marketplaceService.deleteProduct(id);
      setDeleteConfirmId(null);
      setActionSuccess('Produit retiré du catalogue.');
      setTimeout(() => setActionSuccess(null), 3000);
      await fetchData();
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    const current = editingProduct?.images || [];
    setEditingProduct({
      ...editingProduct,
      images: [...current, newImageUrl.trim()]
    });
    setNewImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    const current = editingProduct?.images || [];
    setEditingProduct({
      ...editingProduct,
      images: current.filter((_, i) => i !== index)
    });
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = !search || 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.shortDescription?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = !categoryFilter || p.categoryId === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-stone-900">Gestion des Produits</h1>
          <p className="text-sm text-stone-500">Ajoutez, modifiez et gérez le catalogue d'articles du Marketplace FAFE</p>
        </div>
        <Button 
          onClick={() => {
            setEditingProduct({
              name: '',
              slug: '',
              categoryId: categories[0]?.id || '',
              price: 15000,
              stock: 10,
              currency: 'XAF',
              status: 'PUBLISHED',
              isFeatured: false,
              shortDescription: '',
              fullDescription: '',
              images: []
            });
            setIsEditing(true);
          }}
          className="bg-[#00843D] hover:bg-[#006830] text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Ajouter un produit
        </Button>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          {actionSuccess}
        </div>
      )}

      {/* Product Edit / Create Modal or Card */}
      {isEditing && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
            <h2 className="text-lg font-bold text-stone-900">
              {editingProduct?.id ? 'Modifier le produit' : 'Nouveau produit du catalogue'}
            </h2>
            <button 
              onClick={() => setIsEditing(false)}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Nom de l'article *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Sac en Cuir Panafricain"
                  value={editingProduct?.name || ''}
                  onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-[#00843D] focus:ring-1 focus:ring-[#00843D] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Catégorie *
                </label>
                <select
                  required
                  value={editingProduct?.categoryId || ''}
                  onChange={e => setEditingProduct({ ...editingProduct, categoryId: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-[#00843D] focus:ring-1 focus:ring-[#00843D] outline-none"
                >
                  <option value="">Sélectionnez une catégorie</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Prix standard (XAF) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={editingProduct?.price ?? ''}
                  onChange={e => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-[#00843D] focus:ring-1 focus:ring-[#00843D] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Prix promotionnel (XAF)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Optionnel"
                  value={editingProduct?.promotionalPrice ?? ''}
                  onChange={e => setEditingProduct({ ...editingProduct, promotionalPrice: e.target.value ? Number(e.target.value) : null })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-[#00843D] focus:ring-1 focus:ring-[#00843D] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Quantité en stock *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={editingProduct?.stock ?? ''}
                  onChange={e => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-[#00843D] focus:ring-1 focus:ring-[#00843D] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Statut de mise en vente
                </label>
                <select
                  value={editingProduct?.status || 'PUBLISHED'}
                  onChange={e => setEditingProduct({ ...editingProduct, status: e.target.value as Product['status'] })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-[#00843D] focus:ring-1 focus:ring-[#00843D] outline-none"
                >
                  <option value="PUBLISHED">Publié (En ligne)</option>
                  <option value="DRAFT">Brouillon</option>
                  <option value="OUT_OF_STOCK">Rupture de stock</option>
                  <option value="ARCHIVED">Archivé</option>
                </select>
              </div>

              <div className="flex items-center sm:pt-6">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct?.isFeatured || false}
                    onChange={e => setEditingProduct({ ...editingProduct, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded border-stone-300 text-[#00843D] focus:ring-[#00843D]"
                  />
                  <span className="text-sm font-medium text-stone-800">Mettre en avant sur la page d'accueil</span>
                </label>
              </div>
            </div>

            {/* Images Management */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Visuels du produit
              </label>
              <div className="flex gap-2 mb-3">
                <input 
                  type="url"
                  placeholder="Coller l'URL d'une image (ex: https://...)"
                  value={newImageUrl}
                  onChange={e => setNewImageUrl(e.target.value)}
                  className="flex-grow p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-[#00843D]"
                />
                <Button 
                  type="button" 
                  onClick={handleAddImage}
                  variant="outline"
                  className="border-stone-300 text-stone-700 text-sm"
                >
                  Ajouter
                </Button>
              </div>

              {editingProduct?.images && editingProduct.images.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {editingProduct.images.map((img, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-stone-200 group">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Description courte *
              </label>
              <input
                type="text"
                required
                placeholder="Résumé visible sur la carte du produit"
                value={editingProduct?.shortDescription || ''}
                onChange={e => setEditingProduct({ ...editingProduct, shortDescription: e.target.value })}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-[#00843D] focus:ring-1 focus:ring-[#00843D] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Description détaillée
              </label>
              <textarea
                placeholder="Présentation des matériaux, provenance et spécificités..."
                value={editingProduct?.fullDescription || ''}
                onChange={e => setEditingProduct({ ...editingProduct, fullDescription: e.target.value })}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-[#00843D] focus:ring-1 focus:ring-[#00843D] outline-none"
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
              <Button variant="outline" type="button" onClick={() => setIsEditing(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={loading} className="bg-[#00843D] hover:bg-[#006830] text-white">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Enregistrer le produit
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input 
            type="text"
            placeholder="Rechercher par nom..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-sm outline-none focus:border-[#00843D]"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="p-2 bg-white border border-stone-200 rounded-xl text-sm outline-none focus:border-[#00843D] min-w-[200px]"
        >
          <option value="">Toutes les catégories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-red-800">
              Êtes-vous sûr de vouloir supprimer définitivement cet article ?
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

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-600">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-800">
              <tr>
                <th className="px-6 py-4 font-bold">Produit</th>
                <th className="px-6 py-4 font-bold">Prix</th>
                <th className="px-6 py-4 font-bold">Stock</th>
                <th className="px-6 py-4 font-bold">Statut</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredProducts.map((prod) => (
                <tr key={prod.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-stone-900">{prod.name}</div>
                    <div className="text-xs text-stone-500">
                      {categories.find(c => c.id === prod.categoryId)?.name || 'Catégorie standard'}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {prod.promotionalPrice ? (
                      <div>
                        <span className="text-[#00843D] font-bold">{prod.promotionalPrice.toLocaleString()} {prod.currency}</span>
                        <span className="text-xs text-stone-400 line-through ml-1.5">{prod.price.toLocaleString()}</span>
                      </div>
                    ) : (
                      <span className="font-semibold text-stone-800">{prod.price.toLocaleString()} {prod.currency}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${prod.stock <= 3 ? 'text-red-600' : 'text-stone-800'}`}>
                      {prod.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      prod.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800' : 
                      prod.status === 'DRAFT' ? 'bg-stone-100 text-stone-600' :
                      prod.status === 'OUT_OF_STOCK' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {prod.status === 'PUBLISHED' ? 'Publié' : 
                       prod.status === 'DRAFT' ? 'Brouillon' : 
                       prod.status === 'OUT_OF_STOCK' ? 'Rupture' : prod.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button 
                        onClick={() => { setEditingProduct(prod); setIsEditing(true); }} 
                        className="p-2 text-stone-500 hover:text-[#00843D] transition-colors rounded-lg hover:bg-stone-100"
                        title="Modifier"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setDeleteConfirmId(prod.id)} 
                        className="p-2 text-stone-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-stone-500">
                    Aucun article ne correspond à votre sélection.
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
