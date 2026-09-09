import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Loader2, CheckCircle2, ShieldCheck, Tag, Check } from 'lucide-react';
import { FafeImage } from '../../../components/ui/FafeImage';
import { Product } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { useCartStore } from '../../../store/cart';
import { marketplaceService } from '../../../services/marketplace';

export function MarketplaceProduct() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedNotice, setAddedNotice] = useState(false);
  
  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    if (slug) {
      fetchProduct(slug);
    }

    const handleUpdate = () => {
      if (slug) fetchProduct(slug);
    };

    window.addEventListener('fafe_marketplace_updated', handleUpdate);
    return () => {
      window.removeEventListener('fafe_marketplace_updated', handleUpdate);
    };
  }, [slug]);

  const fetchProduct = async (productSlug: string) => {
    try {
      setLoading(true);
      const found = await marketplaceService.getProductBySlug(productSlug);
      setProduct(found);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="w-10 h-10 text-[#00843D] animate-spin" />
      </div>
    );
  }

  if (!product || product.status === 'DRAFT' || product.status === 'ARCHIVED') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-stone-50 px-4 text-center">
        <h2 className="text-2xl font-bold font-heading text-[#063F3A] mb-4">Produit introuvable</h2>
        <p className="text-stone-500 mb-8 max-w-md">Le produit que vous recherchez n'existe pas ou n'est plus disponible dans le catalogue.</p>
        <Link to="/marketplace">
          <Button className="bg-[#00843D] hover:bg-[#006830] text-white">
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour au catalogue
          </Button>
        </Link>
      </div>
    );
  }

  const stock = typeof product.stock === 'number' ? product.stock : 0;
  const isOutOfStock = product.status === 'OUT_OF_STOCK' || stock <= 0;
  const price = typeof product.price === 'number' ? product.price : 0;
  const promoPrice = product.promotionalPrice;
  const hasPromo = typeof promoPrice === 'number' && promoPrice > 0 && promoPrice < price;
  const currentPrice = hasPromo ? promoPrice! : price;
  const currency = product.currency || 'XAF';
  const images = Array.isArray(product.images) && product.images.length > 0 
    ? product.images 
    : ['https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=1000&q=80'];

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2500);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/marketplace/panier');
  };

  return (
    <div className="min-h-screen bg-stone-50 py-10 sm:py-12">
      <div className="w-full max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <Link to="/marketplace" className="inline-flex items-center text-sm font-medium text-stone-500 hover:text-[#00843D] transition-colors mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour au catalogue
        </Link>

        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-stone-200/70">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-square rounded-2xl bg-stone-50 overflow-hidden border border-stone-100 relative">
                <FafeImage 
                  src={images[selectedImage] || images[0]} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center">
                    <span className="bg-stone-900 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg uppercase tracking-wider text-sm">
                      Rupture de stock
                    </span>
                  </div>
                )}
              </div>
              
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImage === idx ? 'border-[#00843D] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <FafeImage src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {hasPromo && !isOutOfStock && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#C8102E]/10 text-[#C8102E] text-xs font-bold uppercase tracking-wider">
                    <Tag className="w-3.5 h-3.5" />
                    Offre Promotionnelle
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-heading text-[#063F3A] mb-4">
                {product.name}
              </h1>

              {/* Price */}
              <div className="mb-6 flex items-baseline gap-4">
                <span className="text-2xl sm:text-3xl font-bold text-[#063F3A]">
                  {currentPrice.toLocaleString()} {currency}
                </span>
                {hasPromo && (
                  <span className="text-lg text-stone-400 line-through">
                    {price.toLocaleString()} {currency}
                  </span>
                )}
              </div>

              <p className="text-stone-600 text-sm md:text-base leading-relaxed mb-8">
                {product.shortDescription || product.fullDescription || ''}
              </p>

              {/* Purchase Box */}
              <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200/70 mb-8">
                <div className="flex items-center justify-between mb-5">
                  <span className="font-semibold text-stone-700 text-sm">Disponibilité :</span>
                  {isOutOfStock ? (
                    <span className="text-[#C8102E] font-bold text-xs bg-red-100 px-3 py-1 rounded-full uppercase tracking-wider">
                      Rupture de stock
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-bold text-xs bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> En stock ({stock} disponibles)
                    </span>
                  )}
                </div>

                {isOutOfStock ? (
                  <div className="space-y-3">
                    <Button 
                      disabled 
                      className="w-full bg-stone-200 text-stone-500 hover:bg-stone-200 cursor-not-allowed py-3.5 h-auto font-bold text-sm"
                    >
                      Rupture de stock
                    </Button>
                    <p className="text-xs text-stone-500 text-center">
                      Cet article n'est actuellement plus disponible à la commande.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-4 mb-6">
                      <span className="font-semibold text-stone-700 text-sm">Quantité :</span>
                      <div className="flex items-center bg-white border border-stone-200 rounded-lg overflow-hidden">
                        <button 
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-3.5 py-2 text-stone-500 hover:bg-stone-50 hover:text-stone-800 transition-colors"
                        >
                          -
                        </button>
                        <span className="px-4 py-2 font-bold text-stone-800 border-x border-stone-200 min-w-[3rem] text-center text-sm">
                          {quantity}
                        </span>
                        <button 
                          onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                          className="px-3.5 py-2 text-stone-500 hover:bg-stone-50 hover:text-stone-800 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Button 
                        onClick={handleAddToCart}
                        variant="outline"
                        className="border-[#063F3A] text-[#063F3A] hover:bg-[#00843D]/10 py-3 h-auto font-bold text-sm"
                      >
                        {addedNotice ? (
                          <span className="text-emerald-600 flex items-center justify-center gap-1.5">
                            <Check className="w-4 h-4" /> Ajouté au panier
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            <ShoppingCart className="w-4 h-4" /> Ajouter au panier
                          </span>
                        )}
                      </Button>
                      <Button 
                        onClick={handleBuyNow}
                        className="bg-[#00843D] hover:bg-[#006830] text-white py-3 h-auto font-bold text-sm shadow-sm"
                      >
                        Acheter maintenant
                      </Button>
                    </div>
                  </>
                )}
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm font-medium text-stone-500 pt-2 border-t border-stone-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                  <span>Commande sécurisée</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Soutien aux entrepreneures</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full Description */}
        {product.fullDescription && (
          <div className="mt-8 bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-stone-200/70">
            <h3 className="text-xl sm:text-2xl font-bold font-heading text-[#063F3A] mb-4">Description détaillée</h3>
            <div className="text-stone-600 text-sm sm:text-base leading-relaxed space-y-3">
              {product.fullDescription.split('\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
