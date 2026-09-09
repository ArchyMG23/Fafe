import { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2, 
  Search, 
  Filter, 
  Image as ImageIcon, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Upload, 
  Eye, 
  EyeOff,
  Boxes
} from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../lib/firebase';
import { Product, MarketplaceCategory, ProductStatus } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { marketplaceService } from '../../../services/marketplace';

export function AdminMarketplaceProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prods, cats] = await Promise.all([
        marketplaceService.getProducts({ includeAllStatus: true }),
        marketplaceService.getCategories()
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (error: any) {
      console.error('Error fetching admin marketplace data:', error);
      setActionError('Impossible de charger les données du catalogue.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setActionError("L'image est trop volumineuse. Taille maximale : 5 Mo.");
      return;
    }

    try {
      setIsUploadingImage(true);
      setActionError(null);

      // Clean file name
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storageRef = ref(storage, `products/${Date.now()}_${safeName}`);
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      const currentImages = editingProduct?.images || [];
      setEditingProduct({
        ...editingProduct,
        images: [...currentImages, downloadURL]
      });

      setActionSuccess('Image téléchargée et hébergée sur Firebase Storage.');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (error: any) {
      console.error('Error uploading image to Firebase Storage:', error);
      // Fallback: If Firebase storage is not activated or blocked by security rules, convert to high-res data URL safely
      try {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const currentImages = editingProduct?.images || [];
          setEditingProduct({
            ...editingProduct,
            images: [...currentImages, result]
          });
          setActionSuccess('Image importée localement avec succès.');
          setTimeout(() => setActionSuccess(null), 3000);
        };
        reader.readAsDataURL(file);
      } catch (fallbackErr) {
        setActionError("Échec du téléversement de l'image. Veuillez vérifier la connexion.");
      }
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct.categoryId) {
      setActionError("Veuillez renseigner au minimum le nom et la catégorie de l'article.");
      return;
    }

    try {
      setLoading(true);
      setActionError(null);

      const cleanedSlug = editingProduct.slug && editingProduct.slug.trim() 
        ? editingProduct.slug.trim() 
        : editingProduct.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

      const stockNum = Math.max(0, Number(editingProduct.stock) || 0);
      let statusVal: ProductStatus = editingProduct.status || 'PUBLISHED';
      if (stockNum === 0 && statusVal === 'PUBLISHED') {
        statusVal = 'OUT_OF_STOCK';
      }

      const productPayload: Omit<Product, 'id'> = {
        name: editingProduct.name.trim(),
        slug: cleanedSlug,
        sku: editingProduct.sku ? editingProduct.sku.trim().toUpperCase() : undefined,
        categoryId: editingProduct.categoryId,
        price: Math.max(0, Number(editingProduct.price) || 0),
        promotionalPrice: editingProduct.promotionalPrice ? Math.max(0, Number(editingProduct.promotionalPrice)) : undefined,
        stock: stockNum,
        currency: editingProduct.currency || 'XAF',
        status: statusVal,
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

      setActionSuccess(editingProduct.id 
        ? `Produit "${editingProduct.name}" mis à jour avec succès dans Firebase.` 
        : `Nouveau produit "${editingProduct.name}" créé avec succès dans Firebase.`
      );
      setTimeout(() => setActionSuccess(null), 4000);

      setIsEditing(false);
      setEditingProduct(null);
      setNewImageUrl('');
      await fetchData();
    } catch (error: any) {
      console.error('Error saving product:', error);
      setActionError(`Erreur lors de l'enregistrement dans Firebase : ${error.message || 'Vérifiez vos permissions'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (product: Product) => {
    try {
      setLoading(true);
      const newStatus: ProductStatus = product.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
      await marketplaceService.saveProduct({
        ...product,
        status: newStatus
      });
      setActionSuccess(`Statut mis à jour : article désormais ${newStatus === 'PUBLISHED' ? 'PUBLIÉ (visible)' : 'INACTIF (masqué)'}.`);
      setTimeout(() => setActionSuccess(null), 3000);
      await fetchData();
    } catch (error: any) {
      setActionError(`Erreur de modification : ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await marketplaceService.deleteProduct(id);
      setDeleteConfirmId(null);
      setActionSuccess('Produit supprimé définitivement de Firebase.');
      setTimeout(() => setActionSuccess(null), 3000);
      await fetchData();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      setActionError(`Erreur de suppression : ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddImageUrl = () => {
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
    const term = search.toLowerCase();
    const matchesSearch = !term || 
      p.name.toLowerCase().includes(term) || 
      (p.sku && p.sku.toLowerCase().includes(term)) ||
      p.shortDescription?.toLowerCase().includes(term);
    const matchesCat = !categoryFilter || p.categoryId === categoryFilter;
    const matchesStatus = !statusFilter || p.status === statusFilter;
    return matchesSearch && matchesCat && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-stone-900">Catalogue des Produits</h1>
          <p className="text-sm text-stone-500">
            Gestion complète des articles de la Marketplace FAFE. Les modifications sont enregistrées en direct dans Firebase.
          </p>
        </div>
        <Button 
          onClick={() => {
            setEditingProduct({
              name: '',
              slug: '',
              sku: `FAFE-${Math.floor(1000 + Math.random() * 9000)}`,
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
            setActionError(null);
          }}
          className="bg-[#00843D] hover:bg-[#006830] text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Ajouter un produit
        </Button>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Product Edit / Create Modal or Card */}
      {isEditing && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                {editingProduct?.id ? `Modifier : ${editingProduct.name}` : 'Créer un nouveau produit'}
              </h2>
              <p className="text-xs text-stone-500">
                Renseignez tous les attributs exigés pour l'exposition sur le Marketplace.
              </p>
            </div>
            <button 
              onClick={() => setIsEditing(false)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Nom du produit *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Robe Wax Authentique FAFE"
                  value={editingProduct?.name || ''}
                  onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-[#00843D] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Référence / SKU *
                </label>
                <input
                  type="text"
                  placeholder="ex: FAFE-ART-001"
                  value={editingProduct?.sku || ''}
                  onChange={e => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-[#00843D] outline-none font-mono uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Catégorie du rayon *
                </label>
                <select
                  required
                  value={editingProduct?.categoryId || ''}
                  onChange={e => setEditingProduct({ ...editingProduct, categoryId: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-[#00843D] outline-none"
                >
                  <option value="">Sélectionnez une catégorie</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Statut de mise en ligne *
                </label>
                <select
                  value={editingProduct?.status || 'PUBLISHED'}
                  onChange={e => setEditingProduct({ ...editingProduct, status: e.target.value as ProductStatus })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-[#00843D] outline-none font-medium"
                >
                  <option value="PUBLISHED">Publié (Actif et visible au public)</option>
                  <option value="DRAFT">Inactif / Non publié (Masqué du public)</option>
                  <option value="OUT_OF_STOCK">Rupture de stock</option>
                  <option value="ARCHIVED">Archivé</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Prix standard *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={editingProduct?.price ?? ''}
                  onChange={e => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-[#00843D] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Prix promotionnel
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Optionnel"
                  value={editingProduct?.promotionalPrice ?? ''}
                  onChange={e => setEditingProduct({ ...editingProduct, promotionalPrice: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-[#00843D] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Devise *
                </label>
                <select
                  value={editingProduct?.currency || 'XAF'}
                  onChange={e => setEditingProduct({ ...editingProduct, currency: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-[#00843D] outline-none"
                >
                  <option value="XAF">FCFA (XAF)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="USD">Dollar ($)</option>
                </select>
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
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-[#00843D] outline-none"
                />
              </div>
            </div>

            <div className="flex items-center pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingProduct?.isFeatured || false}
                  onChange={e => setEditingProduct({ ...editingProduct, isFeatured: e.target.checked })}
                  className="w-4 h-4 rounded border-stone-300 text-[#00843D] focus:ring-[#00843D]"
                />
                <span className="text-sm font-medium text-stone-800">Mettre en avant sur la page d'accueil de la Marketplace</span>
              </label>
            </div>

            {/* Images Management with Firebase Storage Uploader */}
            <div className="border-t border-stone-100 pt-4">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Images du produit (Firebase Storage)
              </label>

              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                {/* File picker */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="border-dashed border-2 border-stone-300 hover:border-[#00843D] text-stone-700 flex items-center justify-center gap-2 py-2.5"
                >
                  {isUploadingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#00843D]" />
                      Téléversement vers Firebase Storage...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-[#00843D]" />
                      Uploader un fichier image
                    </>
                  )}
                </Button>

                {/* URL input */}
                <div className="flex flex-grow gap-2">
                  <input 
                    type="url"
                    placeholder="Ou coller une URL d'image (https://...)"
                    value={newImageUrl}
                    onChange={e => setNewImageUrl(e.target.value)}
                    className="flex-grow p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-[#00843D]"
                  />
                  <Button 
                    type="button" 
                    onClick={handleAddImageUrl}
                    variant="outline"
                    className="border-stone-300 text-stone-700 text-sm"
                  >
                    Ajouter URL
                  </Button>
                </div>
              </div>

              {editingProduct?.images && editingProduct.images.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {editingProduct.images.map((img, idx) => (
                    <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border border-stone-200 group bg-stone-50">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-90 group-hover:opacity-100 transition-opacity"
                        title="Supprimer cette photo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 bg-[#00843D] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          Principale
                        </span>
                      )}
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
                placeholder="Résumé visible sur la fiche du catalogue..."
                value={editingProduct?.shortDescription || ''}
                onChange={e => setEditingProduct({ ...editingProduct, shortDescription: e.target.value })}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-[#00843D] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Description détaillée
              </label>
              <textarea
                placeholder="Détails complets sur la matière, l'artisane, les dimensions..."
                value={editingProduct?.fullDescription || ''}
                onChange={e => setEditingProduct({ ...editingProduct, fullDescription: e.target.value })}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-[#00843D] outline-none"
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditing(false)}
                className="border-stone-300 text-stone-700"
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={loading || isUploadingImage}
                className="bg-[#00843D] hover:bg-[#006830] text-white flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Enregistrer dans Firebase
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Delete confirmation banner */}
      {deleteConfirmId && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="text-sm font-medium text-red-800">
              Supprimer définitivement ce produit du Marketplace ? Cette opération efface le document dans Firebase.
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
              className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs"
            >
              Confirmer la suppression
            </button>
          </div>
        </div>
      )}

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, référence SKU ou description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm outline-none focus:border-[#00843D]"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="p-2.5 bg-white border border-stone-200 rounded-xl text-sm outline-none focus:border-[#00843D] text-stone-700"
        >
          <option value="">Toutes les catégories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="p-2.5 bg-white border border-stone-200 rounded-xl text-sm outline-none focus:border-[#00843D] text-stone-700"
        >
          <option value="">Tous les statuts</option>
          <option value="PUBLISHED">Publiés uniquement</option>
          <option value="DRAFT">Inactifs / Non publiés</option>
          <option value="OUT_OF_STOCK">Rupture de stock</option>
          <option value="ARCHIVED">Archivés</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-stone-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#00843D] mb-2" />
            <p className="text-sm">Chargement des articles...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-stone-500">
            Aucun produit trouvé dans le catalogue avec ces filtres.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-600">
              <thead className="bg-stone-50 border-b border-stone-200 text-xs font-bold text-stone-500 uppercase tracking-wider">
                <tr>
                  <th className="p-4">Article</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Prix</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredProducts.map(product => {
                  const cat = categories.find(c => c.id === product.categoryId);
                  const isPublished = product.status === 'PUBLISHED';
                  const isOut = product.stock === 0 || product.status === 'OUT_OF_STOCK';

                  return (
                    <tr key={product.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.images[0] || 'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=100&q=80'}
                            alt={product.name}
                            className="w-12 h-12 rounded-xl object-cover border border-stone-200 flex-shrink-0"
                          />
                          <div>
                            <div className="font-bold text-stone-900 line-clamp-1">{product.name}</div>
                            <div className="text-xs text-stone-400">{cat?.name || 'Catégorie standard'}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-mono text-xs text-stone-600">
                        {product.sku || '—'}
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <div className="font-bold text-stone-900">
                          {product.price.toLocaleString()} {product.currency}
                        </div>
                        {product.promotionalPrice && (
                          <div className="text-xs text-[#C8102E] font-medium">
                            Promo: {product.promotionalPrice.toLocaleString()} {product.currency}
                          </div>
                        )}
                      </td>

                      <td className="p-4 whitespace-nowrap font-medium">
                        {isOut ? (
                          <span className="text-[#C8102E] font-bold text-xs bg-red-50 px-2 py-0.5 rounded">
                            0 (Rupture)
                          </span>
                        ) : (
                          <span className="text-emerald-700 text-xs bg-emerald-50 px-2 py-0.5 rounded font-bold">
                            {product.stock} en stock
                          </span>
                        )}
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(product)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                            isPublished 
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                              : isOut 
                              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                          }`}
                          title="Cliquer pour basculer Actif / Inactif"
                        >
                          {isPublished ? (
                            <>
                              <Eye className="w-3 h-3 text-emerald-600" />
                              Publié (En ligne)
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3 text-stone-500" />
                              Inactif (Masqué)
                            </>
                          )}
                        </button>
                      </td>

                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingProduct({ ...product });
                              setIsEditing(true);
                              setActionError(null);
                            }}
                            className="p-1.5 text-stone-400 hover:text-[#00843D] hover:bg-stone-100 rounded-lg transition-colors"
                            title="Modifier ce produit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(product.id)}
                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
