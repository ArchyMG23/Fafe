import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Search, Filter, Tag, Loader2, Star, ShoppingBag } from 'lucide-react';
import { FafeImage } from '../../../components/ui/FafeImage';
import { Product, MarketplaceCategory } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { useCartStore } from '../../../store/cart';
import { marketplaceService } from '../../../services/marketplace';

export function MarketplaceHome() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener('fafe_marketplace_updated', handleUpdate);
    return () => {
      window.removeEventListener('fafe_marketplace_updated', handleUpdate);
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prods, cats] = await Promise.all([
        marketplaceService.getProducts(),
        marketplaceService.getCategories()
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      console.warn('Could not load marketplace data:', err);
    } finally {
      setLoading(false);
    }
  };

  const term = (searchTerm || '').trim().toLowerCase();
  const filteredProducts = products.filter(product => {
    // Only display published or out of stock items (never DRAFT or ARCHIVED)
    if (product.status === 'DRAFT' || product.status === 'ARCHIVED') {
      return false;
    }
    const name = (product.name || '').toLowerCase();
    const shortDesc = (product.shortDescription || '').toLowerCase();
    const fullDesc = (product.fullDescription || '').toLowerCase();
    const sku = (product.sku || '').toLowerCase();
    
    const matchesSearch = !term || name.includes(term) || shortDesc.includes(term) || fullDesc.includes(term) || sku.includes(term);
    const matchesCategory = selectedCategory ? product.categoryId === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const featuredProducts = products.filter(p => p.isFeatured && p.status === 'PUBLISHED').slice(0, 4);

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* Header Banner */}
      <div className="bg-[#00843D] text-white py-14 sm:py-16">
        <div className="w-full max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-white/90 mb-6 tracking-widest uppercase">
            <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
            Boutique FAFE
          </div>
          <h1 className="text-3xl md:text-5xl font-bold font-heading mb-4">La Marketplace Panafricaine</h1>
          <p className="text-white/85 max-w-2xl mx-auto mb-8 text-sm md:text-base leading-relaxed">
            Découvrez et soutenez l'excellence de l'entrepreneuriat féminin. Des créations authentiques et des savoir-faire d'Afrique.
          </p>
          
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="Rechercher un produit, un savoir-faire..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 sm:py-4 rounded-full text-stone-800 placeholder-stone-400 bg-white border-0 focus:ring-4 focus:ring-[#D4AF37]/50 shadow-xl transition-all outline-none text-sm sm:text-base"
            />
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 mt-8 md:mt-12">
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="space-y-6 hidden lg:block">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 h-96 animate-pulse">
                <div className="h-6 w-32 bg-stone-200 rounded mb-6"></div>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-10 w-full bg-stone-100 rounded-xl"></div>)}
                </div>
              </div>
            </div>
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-white rounded-2xl border border-stone-100 overflow-hidden h-[380px] animate-pulse flex flex-col">
                    <div className="w-full aspect-square bg-stone-200"></div>
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="h-4 w-1/3 bg-stone-200 rounded mb-2"></div>
                      <div className="h-5 w-3/4 bg-stone-200 rounded mb-2"></div>
                      <div className="h-4 w-full bg-stone-100 rounded mb-auto"></div>
                      <div className="h-6 w-1/2 bg-stone-200 rounded mt-4"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar / Filters */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200/70">
                <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#00843D]" />
                  Catégories
                </h3>
                <div className="space-y-1.5">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      selectedCategory === null 
                        ? 'bg-[#00843D] text-white shadow-sm' 
                        : 'text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    Toutes les catégories
                  </button>
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        selectedCategory === category.id 
                          ? 'bg-[#00843D] text-white shadow-sm' 
                          : 'text-stone-600 hover:bg-stone-50'
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
                <div className="mb-10">
                  <h2 className="text-xl sm:text-2xl font-bold font-heading text-[#063F3A] mb-5 flex items-center gap-2">
                    <Star className="w-5 h-5 text-[#D4AF37] fill-[#D4AF37]" />
                    Sélections en vedette
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-6">
                    {featuredProducts.map(product => (
                      <ProductCard key={product.id} product={product} onAdd={() => addItem(product, 1)} />
                    ))}
                  </div>
                </div>
              )}

              <h2 className="text-xl font-bold font-heading text-stone-800 mb-6">
                {searchTerm || selectedCategory ? 'Résultats du catalogue' : 'Tous les articles'}
                <span className="text-sm font-normal text-stone-500 ml-3">({filteredProducts.length})</span>
              </h2>

              {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-stone-200/80">
                  <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400">
                    <Search className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-stone-800 mb-2">Aucun article trouvé</h3>
                  <p className="text-sm text-stone-500">Essayez de modifier vos critères de recherche ou de catégorie.</p>
                  <Button 
                    variant="outline" 
                    className="mt-6 border-stone-300 text-stone-700"
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

function ProductCard({ product, onAdd }: { product: Product; onAdd: () => void }) {
  const stock = typeof product.stock === 'number' ? product.stock : 0;
  const isOutOfStock = product.status === 'OUT_OF_STOCK' || stock <= 0;
  const price = typeof product.price === 'number' ? product.price : 0;
  const promoPrice = product.promotionalPrice;
  const hasPromo = typeof promoPrice === 'number' && promoPrice > 0 && promoPrice < price;
  const currency = product.currency || 'XAF';
  const displayImage = product.images?.[0] || 'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=1000&q=80';
  const productUrl = `/marketplace/produit/${product.slug || product.id}`;

  return (
    <div className="group bg-white rounded-2xl border border-stone-200/70 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col">
      <Link to={productUrl} className="block relative aspect-square bg-stone-50 overflow-hidden">
        <FafeImage 
          src={displayImage} 
          alt={product.name || 'Produit'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {isOutOfStock ? (
            <span className="bg-[#C8102E] text-white text-[11px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm">
              Rupture de stock
            </span>
          ) : (
            hasPromo && (
              <span className="bg-[#C8102E] text-white text-[11px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm flex items-center gap-1">
                <Tag className="w-3 h-3" />
                Promo
              </span>
            )
          )}
        </div>
      </Link>

      <div className="p-5 flex-grow flex flex-col">
        <Link to={productUrl} className="block mb-2">
          <h3 className="font-bold text-stone-800 line-clamp-1 group-hover:text-[#00843D] transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs sm:text-sm text-stone-500 line-clamp-2 mb-4 flex-grow">
          {product.shortDescription || product.fullDescription || ''}
        </p>

        <div className="flex items-end justify-between mt-auto pt-2 border-t border-stone-100">
          <div>
            {hasPromo ? (
              <div className="flex flex-col">
                <span className="text-xs text-stone-400 line-through">
                  {price.toLocaleString()} {currency}
                </span>
                <span className="font-bold text-lg text-[#063F3A]">
                  {promoPrice?.toLocaleString()} {currency}
                </span>
              </div>
            ) : (
              <span className="font-bold text-lg text-[#063F3A]">
                {price.toLocaleString()} {currency}
              </span>
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
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed' 
                : 'bg-[#00843D] text-white hover:bg-[#006830]'
            }`}
            title={isOutOfStock ? 'Indisponible' : 'Ajouter au panier'}
          >
            <ShoppingCart className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
