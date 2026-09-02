import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { Plus, Edit2, Trash2, Loader2, Search, Filter } from 'lucide-react';
import { db } from '../../../lib/firebase';
import { Product, MarketplaceCategory } from '../../../types';
import { Button } from '../../../components/ui/Button';

export function AdminMarketplaceProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const catsSnap = await getDocs(query(collection(db, 'marketplace_categories')));
      const cats: MarketplaceCategory[] = [];
      catsSnap.forEach(doc => cats.push({ id: doc.id, ...doc.data() } as MarketplaceCategory));
      setCategories(cats);

      const prodsSnap = await getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc')));
      const prods: Product[] = [];
      prodsSnap.forEach(doc => prods.push({ id: doc.id, ...doc.data() } as Product));
      setProducts(prods);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct.categoryId) return;

    try {
      setLoading(true);
      const slug = editingProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      const productData = {
        ...editingProduct,
        slug,
        price: Number(editingProduct.price),
        promotionalPrice: editingProduct.promotionalPrice ? Number(editingProduct.promotionalPrice) : null,
        stock: Number(editingProduct.stock),
        currency: editingProduct.currency || 'XAF',
        status: editingProduct.status || 'DRAFT',
        isFeatured: editingProduct.isFeatured || false,
        updatedAt: Date.now()
      };
      
      if (editingProduct.id) {
        await updateDoc(doc(db, 'products', editingProduct.id), productData);
      } else {
        await addDoc(collection(db, 'products'), {
          ...productData,
          images: [],
          createdAt: Date.now()
        });
      }
      
      setIsEditing(false);
      setEditingProduct(null);
      await fetchData();
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Confirmer la suppression ?')) return;
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'products', id));
      await fetchData();
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDemoData = async () => {
    if (!window.confirm("Générer des données de démonstration ?")) return;
    try {
      setLoading(true);
      // Create a category
      const catRef = await addDoc(collection(db, 'marketplace_categories'), {
        name: 'Artisanat & Mode',
        slug: 'artisanat-mode',
        description: 'Créations authentiques et mode africaine.',
        isActive: true,
        order: 0,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });

      // Create products
      const demoProducts = [
        {
          name: 'Sac en Cuir Panafricain',
          slug: 'sac-cuir-panafricain',
          shortDescription: 'Sac en cuir véritable fait main avec motifs traditionnels.',
          fullDescription: 'Ce magnifique sac en cuir a été confectionné à la main par nos artisanes. Il allie modernité et tradition avec des finitions de haute qualité et des motifs inspirés de l\'art africain.',
          price: 45000,
          promotionalPrice: 39000,
          stock: 12,
          currency: 'XAF',
          status: 'PUBLISHED',
          isFeatured: true,
          categoryId: catRef.id,
          images: ['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=800'],
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        {
          name: 'Collier Perles Royales',
          slug: 'collier-perles-royales',
          shortDescription: 'Collier de perles fait main, idéal pour les grandes occasions.',
          fullDescription: 'Un bijou exceptionnel créé avec soin. Chaque perle est choisie minutieusement pour offrir un rendu royal.',
          price: 15000,
          stock: 5,
          currency: 'XAF',
          status: 'PUBLISHED',
          isFeatured: true,
          categoryId: catRef.id,
          images: ['https://images.unsplash.com/photo-1599643478524-fb66f70a00ba?auto=format&fit=crop&q=80&w=800'],
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        {
          name: 'Tissu Wax Premium',
          slug: 'tissu-wax-premium',
          shortDescription: '6 yards de tissu wax 100% coton de qualité supérieure.',
          fullDescription: 'Parfait pour vos créations sur-mesure. Ce tissu wax aux couleurs vibrantes ne déteint pas au lavage.',
          price: 25000,
          stock: 20,
          currency: 'XAF',
          status: 'PUBLISHED',
          isFeatured: false,
          categoryId: catRef.id,
          images: ['https://images.unsplash.com/photo-1622396090075-ab1b4c379a54?auto=format&fit=crop&q=80&w=800'],
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      ];

      for (const p of demoProducts) {
        await addDoc(collection(db, 'products'), p);
      }

      await fetchData();
    } catch (error) {
      console.error(error);
      alert('Erreur lors de la génération.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-heading text-stone-800">Produits</h1>
          <p className="text-stone-500">Gérez le catalogue de la marketplace</p>
        </div>
        <div className="flex items-center gap-3">
          {products.length === 0 && (
            <Button onClick={generateDemoData} variant="outline" className="text-stone-600 border-stone-200">
              Générer Données Démo
            </Button>
          )}
          <Button onClick={() => { setEditingProduct({ name: '', price: 0, stock: 0, status: 'DRAFT', currency: 'XAF', shortDescription: '', fullDescription: '' }); setIsEditing(true); }} className="bg-[#6B3E1E] text-white">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Produit
          </Button>
        </div>
      </div>

      {isEditing && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
          <h2 className="text-lg font-bold mb-4">{editingProduct?.id ? 'Modifier' : 'Créer'} un produit</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom du produit</label>
                <input
                  type="text"
                  required
                  value={editingProduct?.name || ''}
                  onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full p-2 border border-stone-200 rounded-lg focus:ring-[#E67E22] focus:border-[#E67E22]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Catégorie</label>
                <select
                  required
                  value={editingProduct?.categoryId || ''}
                  onChange={e => setEditingProduct({ ...editingProduct, categoryId: e.target.value })}
                  className="w-full p-2 border border-stone-200 rounded-lg focus:ring-[#E67E22] focus:border-[#E67E22]"
                >
                  <option value="">Sélectionner...</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Prix</label>
                <input
                  type="number"
                  required
                  value={editingProduct?.price || ''}
                  onChange={e => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                  className="w-full p-2 border border-stone-200 rounded-lg focus:ring-[#E67E22] focus:border-[#E67E22]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Prix Promo (optionnel)</label>
                <input
                  type="number"
                  value={editingProduct?.promotionalPrice || ''}
                  onChange={e => setEditingProduct({ ...editingProduct, promotionalPrice: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full p-2 border border-stone-200 rounded-lg focus:ring-[#E67E22] focus:border-[#E67E22]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Stock</label>
                <input
                  type="number"
                  required
                  value={editingProduct?.stock || ''}
                  onChange={e => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                  className="w-full p-2 border border-stone-200 rounded-lg focus:ring-[#E67E22] focus:border-[#E67E22]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Statut</label>
                <select
                  value={editingProduct?.status || 'DRAFT'}
                  onChange={e => setEditingProduct({ ...editingProduct, status: e.target.value as Product['status'] })}
                  className="w-full p-2 border border-stone-200 rounded-lg focus:ring-[#E67E22] focus:border-[#E67E22]"
                >
                  <option value="DRAFT">Brouillon</option>
                  <option value="PUBLISHED">Publié</option>
                  <option value="SUSPENDED">Suspendu</option>
                  <option value="OUT_OF_STOCK">Rupture</option>
                  <option value="ARCHIVED">Archivé</option>
                </select>
              </div>
              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct?.isFeatured || false}
                    onChange={e => setEditingProduct({ ...editingProduct, isFeatured: e.target.checked })}
                    className="rounded border-stone-300 text-[#E67E22] focus:ring-[#E67E22]"
                  />
                  <span className="text-sm font-medium">Produit en vedette (Accueil)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description courte</label>
              <input
                type="text"
                required
                value={editingProduct?.shortDescription || ''}
                onChange={e => setEditingProduct({ ...editingProduct, shortDescription: e.target.value })}
                className="w-full p-2 border border-stone-200 rounded-lg focus:ring-[#E67E22] focus:border-[#E67E22]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description complète</label>
              <textarea
                required
                value={editingProduct?.fullDescription || ''}
                onChange={e => setEditingProduct({ ...editingProduct, fullDescription: e.target.value })}
                className="w-full p-2 border border-stone-200 rounded-lg focus:ring-[#E67E22] focus:border-[#E67E22]"
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
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
              <th className="px-6 py-4 font-bold">Produit</th>
              <th className="px-6 py-4 font-bold">Prix</th>
              <th className="px-6 py-4 font-bold">Stock</th>
              <th className="px-6 py-4 font-bold">Statut</th>
              <th className="px-6 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {products.map((prod) => (
              <tr key={prod.id} className="hover:bg-stone-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-stone-800">{prod.name}</div>
                  <div className="text-xs text-stone-400">{categories.find(c => c.id === prod.categoryId)?.name || 'Sans catégorie'}</div>
                </td>
                <td className="px-6 py-4 font-medium">
                  {prod.promotionalPrice ? (
                    <div>
                      <span className="text-[#E67E22]">{prod.promotionalPrice} {prod.currency}</span>
                      <span className="text-xs text-stone-400 line-through ml-1">{prod.price}</span>
                    </div>
                  ) : (
                    <span>{prod.price} {prod.currency}</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`font-medium ${prod.stock <= 5 ? 'text-red-500' : 'text-stone-700'}`}>{prod.stock}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    prod.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' : 
                    prod.status === 'DRAFT' ? 'bg-stone-100 text-stone-600' :
                    prod.status === 'OUT_OF_STOCK' ? 'bg-red-100 text-red-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {prod.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => { setEditingProduct(prod); setIsEditing(true); }} className="p-2 text-stone-400 hover:text-[#6B3E1E] transition-colors rounded-lg hover:bg-stone-100">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(prod.id)} className="p-2 text-stone-400 hover:text-red-500 transition-colors rounded-lg hover:bg-stone-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-stone-500">Aucun produit trouvé</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
