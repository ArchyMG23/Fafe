import { FafeImage } from '../../../components/ui/FafeImage';
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Loader2, CheckCircle2, ShieldCheck, Tag } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Product } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { useCartStore } from '../../../store/cart';

export function MarketplaceProduct() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  
  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    if (slug) fetchProduct(slug);
  }, [slug]);

  const fetchProduct = async (productSlug: string) => {
    try {
      setLoading(true);
      const q = query(collection(db, 'products'), where('slug', '==', productSlug));
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        setProduct({ id: snap.docs[0].id, ...snap.docs[0].data() } as Product);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="w-10 h-10 text-[#E67E22] animate-spin" />
      </div>
    );
  }

  if (!product || product.status === 'DRAFT' || product.status === 'ARCHIVED') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-stone-50 px-4 text-center">
        <h2 className="text-2xl font-bold font-heading text-[#6B3E1E] mb-4">Produit introuvable</h2>
        <p className="text-stone-500 mb-8 max-w-md">Le produit que vous recherchez n'existe pas ou n'est plus disponible.</p>
        <Link to="/marketplace">
          <Button className="bg-[#6B3E1E] hover:bg-[#532f17] text-white">
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour à la boutique
          </Button>
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.status === 'OUT_OF_STOCK' || product.stock <= 0;
  const hasPromo = !!product.promotionalPrice && product.promotionalPrice < product.price;
  const currentPrice = hasPromo ? product.promotionalPrice! : product.price;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, quantity);
    // Optional: show a toast notification here
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/marketplace/panier');
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="w-full max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <Link to="/marketplace" className="inline-flex items-center text-sm font-medium text-stone-500 hover:text-[#E67E22] transition-colors mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour à la boutique
        </Link>

        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-stone-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-square rounded-2xl bg-stone-50 overflow-hidden border border-stone-100 relative">
                {product.images && product.images[selectedImage] ? (
                  <FafeImage 
                    src={product.images[selectedImage]} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-300">
                    <span className="text-sm uppercase tracking-widest font-bold">Sans image</span>
                  </div>
                )}
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                    <span className="bg-red-500 text-white font-bold px-4 py-2 rounded-lg shadow-lg uppercase tracking-wider transform -rotate-12">
                      Rupture de stock
                    </span>
                  </div>
                )}
              </div>
              
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImage === idx ? 'border-[#E67E22] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
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
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {hasPromo && !isOutOfStock && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#E67E22]/10 text-[#E67E22] text-xs font-bold uppercase tracking-wider">
                    <Tag className="w-3.5 h-3.5" />
                    Promotion
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold font-heading text-[#6B3E1E] mb-4">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-stone-100">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-stone-900">{currentPrice.toLocaleString()} {product.currency}</span>
                  {hasPromo && (
                    <span className="text-lg text-stone-400 line-through decoration-1">{product.price.toLocaleString()} {product.currency}</span>
                  )}
                </div>
              </div>

              <p className="text-stone-600 text-sm md:text-base leading-relaxed mb-8">
                {product.shortDescription}
              </p>

              {/* Purchase Box */}
              <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <span className="font-semibold text-stone-700">Disponibilité :</span>
                  {isOutOfStock ? (
                    <span className="text-red-600 font-bold text-sm bg-red-50 px-3 py-1 rounded-full">Indisponible</span>
                  ) : (
                    <span className="text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> En stock
                    </span>
                  )}
                </div>

                {!isOutOfStock && (
                  <>
                    <div className="flex items-center gap-4 mb-6">
                      <span className="font-semibold text-stone-700">Quantité :</span>
                      <div className="flex items-center bg-white border border-stone-200 rounded-lg overflow-hidden">
                        <button 
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-4 py-2 text-stone-500 hover:bg-stone-50 hover:text-stone-800 transition-colors"
                        >
                          -
                        </button>
                        <span className="px-4 py-2 font-bold text-stone-800 border-x border-stone-200 min-w-[3rem] text-center">
                          {quantity}
                        </span>
                        <button 
                          onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                          className="px-4 py-2 text-stone-500 hover:bg-stone-50 hover:text-stone-800 transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-xs text-stone-400 ml-2">Max {product.stock}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Button 
                        onClick={handleAddToCart}
                        variant="outline"
                        className="border-[#6B3E1E] text-[#6B3E1E] hover:bg-[#6B3E1E]/5 py-3 h-auto font-bold"
                      >
                        Ajouter au panier
                      </Button>
                      <Button 
                        onClick={handleBuyNow}
                        className="bg-[#E67E22] hover:bg-[#c96a1a] text-white py-3 h-auto font-bold shadow-md"
                      >
                        Acheter maintenant
                      </Button>
                    </div>
                  </>
                )}
              </div>

              {/* Trust badges */}
              <div className="flex items-center gap-6 text-sm font-medium text-stone-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                  <span>Paiement sécurisé</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span>Soutien l'entrepreneuriat</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full Description */}
        {product.fullDescription && (
          <div className="mt-12 bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-stone-100">
            <h3 className="text-2xl font-bold font-heading text-[#6B3E1E] mb-6">Description détaillée</h3>
            <div className="prose prose-stone max-w-none text-stone-600">
              {product.fullDescription.split('\n').map((paragraph, idx) => (
                <p key={idx} className="mb-4">{paragraph}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
