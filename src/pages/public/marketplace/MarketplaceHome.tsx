import { FafeImage } from '../../../components/ui/FafeImage';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Search, Filter, ArrowRight, Tag, Loader2, Star, ShoppingBag } from 'lucide-react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Product, MarketplaceCategory } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { useCartStore } from '../../../store/cart';

export function MarketplaceHome() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    fetchMarketplaceData();
  }, []);

  const fetchMarketplaceData = async () => {
    try {
      setLoading(true);
      // Fetch Categories
      const categoriesRef = collection(db, 'marketplace_categories');
      const categoriesQuery = query(categoriesRef, where('isActive', '==', true), orderBy('order', 'asc'));
      const categoriesSnap = await getDocs(categoriesQuery);
      
      const cats: MarketplaceCategory[] = [];
      categoriesSnap.forEach(doc => cats.push({ id: doc.id, ...doc.data() } as MarketplaceCategory));
      setCategories(cats);

      // Fetch Products
      const productsRef = collection(db, 'products');
      const productsQuery = query(productsRef, where('status', 'in', ['PUBLISHED', 'OUT_OF_STOCK']), orderBy('createdAt', 'desc'));
      const productsSnap = await getDocs(productsQuery);
      
      const prods: Product[] = [];
      productsSnap.forEach(doc => prods.push({ id: doc.id, ...doc.data() } as Product));
      setProducts(prods);

    } catch (error) {
      console.error('Error fetching marketplace data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.shortDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? product.categoryId === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const featuredProducts = products.filter(p => p.isFeatured && p.status === 'PUBLISHED').slice(0, 4);

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* Header */}
      <div className="bg-[#6B3E1E] text-white py-16">
        <div className="w-full max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-white/90 mb-6 tracking-widest uppercase">
            <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
            FAFE Boutique
          </div>
          <h1 className="text-3xl md:text-5xl font-bold font-heading mb-4">La Marketplace Panafricaine</h1>
          <p className="text-white/80 max-w-2xl mx-auto mb-8 text-sm md:text-base">
            Découvrez et soutenez l'excellence de l'entrepreneuriat féminin. Des produits authentiques, créés par des femmes inspirantes.
          </p>
          
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="Rechercher un produit, un savoir-faire..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-full text-stone-800 placeholder-stone-400 border-0 focus:ring-4 focus:ring-[#D4AF37]/50 shadow-xl transition-all outline-none"
            />
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 mt-8 md:mt-12">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 text-[#E67E22] animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar / Filters */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#E67E22]" />
                  Catégories
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      selectedCategory === null ? 'bg-[#E67E22]/10 text-[#E67E22]' : 'text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    Toutes les catégories
                  </button>
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        selectedCategory === category.id ? 'bg-[#E67E22]/10 text-[#E67E22]' : 'text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Product Grid */}
            <div className="lg:col-span-3">
              {featuredProducts.length > 0 && !searchTerm && !selectedCategory && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold font-heading text-[#6B3E1E] mb-6 flex items-center gap-2">
                    <Star className="w-6 h-6 text-[#D4AF37]" />
                    Produits en vedette
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                    {featuredProducts.map(product => (
                      <ProductCard key={product.id} product={product} onAdd={() => addItem(product, 1)} />
                    ))}
                  </div>
                </div>
              )}

              <h2 className="text-xl font-bold font-heading text-stone-800 mb-6">
                {searchTerm || selectedCategory ? 'Résultats de recherche' : 'Tous les produits'}
                <span className="text-sm font-normal text-stone-500 ml-3">({filteredProducts.length})</span>
              </h2>

              {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-stone-100">
                  <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-stone-300" />
                  </div>
                  <h3 className="font-bold text-stone-800 mb-2">Aucun produit trouvé</h3>
                  <p className="text-sm text-stone-500">Essayez de modifier vos critères de recherche.</p>
                  <Button 
                    variant="outline" 
                    className="mt-6 border-stone-200 text-stone-600"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory(null);
                    }}
                  >
                    Réinitialiser les filtres
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} onAdd={() => addItem(product, 1)} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product, onAdd }: { product: Product, onAdd: () => void }) {
  const isOutOfStock = product.status === 'OUT_OF_STOCK' || product.stock <= 0;
  const hasPromo = !!product.promotionalPrice && product.promotionalPrice < product.price;

  return (
    <div className="group bg-white rounded-2xl border border-stone-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
      <Link to={`/marketplace/produit/${product.slug}`} className="block relative aspect-square bg-stone-50 overflow-hidden">
        {product.images && product.images[0] ? (
          <FafeImage 
            src={product.images[0]} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-300">
            <ShoppingBag className="w-12 h-12" />
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 items-start">
          {isOutOfStock ? (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">
              Rupture de stock
            </span>
          ) : (
            hasPromo && (
              <span className="bg-[#E67E22] text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm flex items-center gap-1">
                <Tag className="w-3 h-3" />
                Promo
              </span>
            )
          )}
        </div>
      </Link>

      <div className="p-5 flex-grow flex flex-col">
        <Link to={`/marketplace/produit/${product.slug}`} className="block mb-2">
          <h3 className="font-bold text-stone-800 line-clamp-1 group-hover:text-[#E67E22] transition-colors">{product.name}</h3>
        </Link>
        <p className="text-sm text-stone-500 line-clamp-2 mb-4 flex-grow">
          {product.shortDescription}
        </p>

        <div className="flex items-end justify-between mt-auto">
          <div>
            {hasPromo ? (
              <div className="flex flex-col">
                <span className="text-xs text-stone-400 line-through">{product.price.toLocaleString()} {product.currency}</span>
                <span className="font-bold text-lg text-[#6B3E1E]">{product.promotionalPrice?.toLocaleString()} {product.currency}</span>
              </div>
            ) : (
              <span className="font-bold text-lg text-[#6B3E1E]">{product.price.toLocaleString()} {product.currency}</span>
            )}
          </div>

          <Button 
            onClick={(e) => {
              e.preventDefault();
              onAdd();
            }}
            disabled={isOutOfStock}
            size="sm"
            className={`rounded-full w-10 h-10 p-0 flex items-center justify-center flex-shrink-0 shadow-sm ${
              isOutOfStock 
                ? 'bg-stone-100 text-stone-400' 
                : 'bg-[#6B3E1E] text-white hover:bg-[#E67E22]'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
