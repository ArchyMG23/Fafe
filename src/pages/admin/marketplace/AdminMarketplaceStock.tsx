import { useState, useEffect } from 'react';
import { 
  Boxes, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle, 
  Loader2, 
  Save, 
  AlertCircle,
  PackageX,
  Plus,
  Minus
} from 'lucide-react';
import { Product, MarketplaceCategory } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { marketplaceService } from '../../../services/marketplace';

export function AdminMarketplaceStock() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'OUT' | 'LOW' | 'IN'>('ALL');
  const [stockInputs, setStockInputs] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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

      // Initialize local input values
      const initialMap: Record<string, number> = {};
      prods.forEach(p => {
        initialMap[p.id] = p.stock;
      });
      setStockInputs(initialMap);
    } catch (error) {
      console.error('Error fetching stock data:', error);
      setFeedback({ type: 'error', message: 'Impossible de récupérer les niveaux de stock.' });
    } finally {
      setLoading(false);
    }
  };

  const handleStockChange = (productId: string, value: number) => {
    setStockInputs(prev => ({
      ...prev,
      [productId]: Math.max(0, value)
    }));
  };

  const handleQuickAdjust = (productId: string, delta: number) => {
    const current = stockInputs[productId] ?? products.find(p => p.id === productId)?.stock ?? 0;
    handleStockChange(productId, Math.max(0, current + delta));
  };

  const handleSaveStock = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newStock = stockInputs[productId] ?? product.stock;
    try {
      setSavingId(productId);
      setFeedback(null);
      await marketplaceService.setExactStock(productId, newStock);
      
      setProducts(prev => prev.map(p => {
        if (p.id === productId) {
          const status = newStock === 0 ? 'OUT_OF_STOCK' : (p.status === 'OUT_OF_STOCK' ? 'PUBLISHED' : p.status);
          return { ...p, stock: newStock, status };
        }
        return p;
      }));

      setFeedback({ 
        type: 'success', 
        message: `Stock mis à jour pour "${product.name}" (${newStock} unités). Enregistré dans Firebase.` 
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (error: any) {
      console.error('Error saving stock:', error);
      setFeedback({ 
        type: 'error', 
        message: `Erreur lors de la mise à jour du stock : ${error.message || 'Échec de connexion'}` 
      });
    } finally {
      setSavingId(null);
    }
  };

  const filteredProducts = products.filter(p => {
    const term = search.toLowerCase();
    const matchesSearch = !term ||
      p.name.toLowerCase().includes(term) ||
      (p.sku && p.sku.toLowerCase().includes(term));
    const matchesCat = !categoryFilter || p.categoryId === categoryFilter;
    
    let matchesStock = true;
    if (stockFilter === 'OUT') matchesStock = p.stock === 0 || p.status === 'OUT_OF_STOCK';
    else if (stockFilter === 'LOW') matchesStock = p.stock > 0 && p.stock <= 5;
    else if (stockFilter === 'IN') matchesStock = p.stock > 5;

    return matchesSearch && matchesCat && matchesStock;
  });

  const outOfStockCount = products.filter(p => p.stock === 0 || p.status === 'OUT_OF_STOCK').length;
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 5).length;
  const totalStockCount = products.reduce((acc, p) => acc + p.stock, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-stone-900 flex items-center gap-2">
            <Boxes className="w-6 h-6 text-[#00843D]" />
            Gestion des Stocks & Disponibilités
          </h1>
          <p className="text-sm text-stone-500">
            Ajustez en temps réel le stock des produits. Lorsqu'un article atteint 0, il passe automatiquement en « Rupture de stock ».
          </p>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {feedback.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-1">
              Unités totales en stock
            </span>
            <span className="text-2xl font-bold text-stone-900">{totalStockCount.toLocaleString()}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Boxes className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-1">
              Stock critique (&le; 5)
            </span>
            <span className="text-2xl font-bold text-amber-600">{lowStockCount}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-1">
              En rupture de stock (0)
            </span>
            <span className="text-2xl font-bold text-[#C8102E]">{outOfStockCount}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 text-[#C8102E] flex items-center justify-center">
            <PackageX className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Rechercher par nom de produit ou SKU..."
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
          value={stockFilter}
          onChange={e => setStockFilter(e.target.value as any)}
          className="p-2.5 bg-white border border-stone-200 rounded-xl text-sm outline-none focus:border-[#00843D] text-stone-700"
        >
          <option value="ALL">Tous les statuts de stock</option>
          <option value="OUT">En rupture uniquement (0)</option>
          <option value="LOW">Stock faible (&le; 5)</option>
          <option value="IN">Stock normal (&gt; 5)</option>
        </select>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-stone-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#00843D] mb-2" />
            <p className="text-sm">Chargement des niveaux de stocks...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-stone-500">
            Aucun produit ne correspond aux filtres de stock actuels.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-600">
              <thead className="bg-stone-50 border-b border-stone-200 text-xs font-bold text-stone-500 uppercase tracking-wider">
                <tr>
                  <th className="p-4">Produit</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Prix</th>
                  <th className="p-4">Statut Actuel</th>
                  <th className="p-4 text-center">Ajuster la quantité</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredProducts.map(product => {
                  const currentInput = stockInputs[product.id] ?? product.stock;
                  const hasModified = currentInput !== product.stock;
                  const isZero = currentInput === 0;
                  const isLow = currentInput > 0 && currentInput <= 5;
                  const isSavingThis = savingId === product.id;

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
                            <div className="text-xs text-stone-400">
                              {categories.find(c => c.id === product.categoryId)?.name || 'Catégorie standard'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-mono text-xs text-stone-600">
                        {product.sku || '—'}
                      </td>

                      <td className="p-4 font-bold text-stone-900 whitespace-nowrap">
                        {product.price.toLocaleString()} {product.currency}
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        {product.stock === 0 || product.status === 'OUT_OF_STOCK' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                            Rupture de stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                            Stock critique ({product.stock})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            En stock ({product.stock})
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(product.id, -1)}
                            className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors"
                            title="Diminuer de 1"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          <input
                            type="number"
                            min="0"
                            value={currentInput}
                            onChange={e => handleStockChange(product.id, Number(e.target.value))}
                            className={`w-20 text-center font-bold px-2 py-1.5 border rounded-lg text-sm outline-none transition-colors ${
                              isZero 
                                ? 'border-red-300 bg-red-50 text-red-800' 
                                : isLow 
                                ? 'border-amber-300 bg-amber-50 text-amber-800'
                                : 'border-stone-200 bg-white text-stone-900 focus:border-[#00843D]'
                            }`}
                          />

                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(product.id, 1)}
                            className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors"
                            title="Augmenter de 1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      <td className="p-4 text-right whitespace-nowrap">
                        <Button
                          size="sm"
                          onClick={() => handleSaveStock(product.id)}
                          disabled={!hasModified || isSavingThis}
                          className={`font-semibold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 ml-auto ${
                            hasModified 
                              ? 'bg-[#00843D] hover:bg-[#006830] text-white shadow-sm' 
                              : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                          }`}
                        >
                          {isSavingThis ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Sauvegarde...
                            </>
                          ) : (
                            <>
                              <Save className="w-3.5 h-3.5" />
                              Enregistrer
                            </>
                          )}
                        </Button>
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
