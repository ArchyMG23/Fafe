import { FafeImage } from '../../../components/ui/FafeImage';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag, ArrowLeft, AlertCircle } from 'lucide-react';
import { useCartStore } from '../../../store/cart';
import { Button } from '../../../components/ui/Button';

export function MarketplaceCart() {
  const { items, updateQuantity, removeItem, getTotalPrice } = useCartStore();
  const navigate = useNavigate();

  const total = getTotalPrice();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 py-20 flex flex-col items-center justify-center px-4">
        <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-6 text-stone-400">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#063F3A] mb-3 text-center">
          Votre panier est vide
        </h1>
        <p className="text-stone-500 mb-8 max-w-md text-center text-sm sm:text-base">
          Explorez le catalogue FAFE et soutenez les créations de nos entrepreneures.
        </p>
        <Link to="/marketplace">
          <Button className="bg-[#00843D] hover:bg-[#006830] text-white px-8 py-3 rounded-full shadow-sm font-bold text-sm sm:text-base">
            Découvrir la boutique
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-10 sm:py-12">
      <div className="w-full max-w-7xl mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold font-heading text-[#063F3A]">
            Votre Panier
          </h1>
          <Link to="/marketplace" className="inline-flex items-center text-sm font-medium text-stone-500 hover:text-[#00843D] transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Poursuivre vos achats
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const productUrl = `/marketplace/produit/${item.slug || item.productId}`;
              const isMaxStock = item.stock ? item.quantity >= item.stock : false;

              return (
                <div 
                  key={item.productId} 
                  className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-stone-200/70 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 relative group"
                >
                  <Link 
                    to={productUrl} 
                    className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 bg-stone-50 rounded-xl overflow-hidden border border-stone-100"
                  >
                    {item.image ? (
                      <FafeImage src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300">
                        <ShoppingBag className="w-8 h-8" />
                      </div>
                    )}
                  </Link>

                  <div className="flex-grow flex flex-col w-full">
                    <Link to={productUrl}>
                      <h2 className="text-base sm:text-lg font-bold text-stone-800 hover:text-[#00843D] transition-colors mb-1 pr-8 line-clamp-1">
                        {item.name}
                      </h2>
                    </Link>
                    <p className="font-bold text-[#063F3A] text-sm sm:text-base mb-3">
                      {item.price.toLocaleString()} XAF <span className="text-xs text-stone-400 font-normal">/ unité</span>
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center">
                        <div className="flex items-center bg-stone-50 border border-stone-200 rounded-lg overflow-hidden h-9">
                          <button 
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="px-3 text-stone-500 hover:bg-stone-200 hover:text-stone-800 transition-colors font-medium h-full"
                            title="Diminuer"
                          >
                            -
                          </button>
                          <span className="px-3 font-bold text-stone-800 border-x border-stone-200 min-w-[2.5rem] text-center bg-white h-full flex items-center justify-center text-sm">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            disabled={isMaxStock}
                            className={`px-3 transition-colors font-medium h-full ${
                              isMaxStock 
                                ? 'text-stone-300 cursor-not-allowed' 
                                : 'text-stone-500 hover:bg-stone-200 hover:text-stone-800'
                            }`}
                            title={isMaxStock ? 'Stock maximum atteint' : 'Augmenter'}
                          >
                            +
                          </button>
                        </div>
                        {isMaxStock && (
                          <span className="text-[11px] text-amber-700 ml-2 font-medium flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Max
                          </span>
                        )}
                      </div>
                      
                      <span className="font-bold text-base sm:text-lg text-[#063F3A]">
                        {(item.price * item.quantity).toLocaleString()} XAF
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={() => removeItem(item.productId)}
                    className="absolute top-4 right-4 text-stone-300 hover:text-[#C8102E] transition-colors p-2 rounded-full hover:bg-red-50"
                    aria-label="Supprimer l'article"
                    title="Supprimer du panier"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-stone-200/70 sticky top-24">
              <h2 className="text-lg sm:text-xl font-bold font-heading text-[#063F3A] mb-5">
                Récapitulatif de commande
              </h2>
              
              <div className="space-y-3.5 mb-6 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Articles ({items.reduce((acc, item) => acc + item.quantity, 0)})</span>
                  <span className="font-semibold text-stone-800">{total.toLocaleString()} XAF</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Frais de livraison</span>
                  <span className="text-xs text-stone-500">Calculés à l'étape suivante</span>
                </div>
              </div>
              
              <div className="border-t border-stone-100 pt-5 mb-6">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-stone-800">Total estimé</span>
                  <span className="text-2xl font-bold text-[#00843D]">{total.toLocaleString()} XAF</span>
                </div>
              </div>

              <Button 
                onClick={() => navigate('/marketplace/commande')}
                className="w-full bg-[#00843D] hover:bg-[#006830] text-white py-3.5 rounded-xl font-bold text-base shadow-sm flex items-center justify-center group"
              >
                Valider ma commande
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
