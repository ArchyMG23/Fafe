import { FafeImage } from '../../../components/ui/FafeImage';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCartStore } from '../../../store/cart';
import { Button } from '../../../components/ui/Button';

export function MarketplaceCart() {
  const { items, updateQuantity, removeItem, getTotalPrice } = useCartStore();
  const navigate = useNavigate();

  const total = getTotalPrice();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 py-20 flex flex-col items-center">
        <div className="w-24 h-24 bg-stone-200 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-stone-400" />
        </div>
        <h2 className="text-3xl font-bold font-heading text-[#6B3E1E] mb-4">Votre panier est vide</h2>
        <p className="text-stone-500 mb-8 max-w-md text-center">Découvrez nos produits exclusifs et soutenez l'entrepreneuriat féminin.</p>
        <Link to="/marketplace">
          <Button className="bg-[#E67E22] hover:bg-[#c96a1a] text-white px-8 py-3 rounded-full shadow-md font-bold text-lg">
            Visiter la boutique
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="w-full max-w-7xl mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold font-heading text-[#6B3E1E]">Votre Panier</h1>
          <Link to="/marketplace" className="hidden sm:inline-flex items-center text-sm font-medium text-stone-500 hover:text-[#E67E22] transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Continuer vos achats
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.productId} className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-stone-100 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 relative group">
                
                <Link to={`/marketplace/produit/${item.productId}`} className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-stone-50 rounded-xl overflow-hidden border border-stone-100">
                  {item.image ? (
                    <FafeImage src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8 text-stone-300" />
                    </div>
                  )}
                </Link>

                <div className="flex-grow flex flex-col">
                  <Link to={`/marketplace/produit/${item.productId}`}>
                    <h3 className="text-lg font-bold text-stone-800 hover:text-[#E67E22] transition-colors mb-1 pr-8">{item.name}</h3>
                  </Link>
                  <p className="font-bold text-[#6B3E1E] mb-4">{item.price.toLocaleString()} XAF <span className="text-xs text-stone-400 font-normal">/ unité</span></p>
                  
                  <div className="flex items-center gap-6 mt-auto">
                    <div className="flex items-center bg-stone-50 border border-stone-200 rounded-lg overflow-hidden h-9">
                      <button 
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="px-3 text-stone-500 hover:bg-stone-200 hover:text-stone-800 transition-colors font-medium h-full"
                      >
                        -
                      </button>
                      <span className="px-3 font-bold text-stone-800 border-x border-stone-200 min-w-[2.5rem] text-center bg-white h-full flex items-center justify-center text-sm">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="px-3 text-stone-500 hover:bg-stone-200 hover:text-stone-800 transition-colors font-medium h-full"
                      >
                        +
                      </button>
                    </div>
                    
                    <span className="font-bold text-lg text-stone-800">
                      {(item.price * item.quantity).toLocaleString()} XAF
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => removeItem(item.productId)}
                  className="absolute top-4 right-4 sm:top-6 sm:right-6 text-stone-300 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                  aria-label="Supprimer l'article"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-100 sticky top-24">
              <h2 className="text-xl font-bold text-stone-800 mb-6">Récapitulatif</h2>
              
              <div className="space-y-4 mb-6 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Sous-total ({items.reduce((acc, item) => acc + item.quantity, 0)} articles)</span>
                  <span className="font-medium text-stone-800">{total.toLocaleString()} XAF</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Frais de livraison</span>
                  <span className="text-xs text-stone-400 italic">Calculés à l'étape suivante</span>
                </div>
              </div>
              
              <div className="border-t border-stone-100 pt-6 mb-8">
                <div className="flex justify-between items-end">
                  <span className="font-bold text-stone-800">Total TTC</span>
                  <span className="text-2xl font-bold text-[#E67E22]">{total.toLocaleString()} XAF</span>
                </div>
              </div>

              <Button 
                onClick={() => navigate('/marketplace/commande')}
                className="w-full bg-[#6B3E1E] hover:bg-[#532f17] text-white py-4 rounded-xl font-bold text-lg shadow-md flex items-center justify-center group"
              >
                Passer la commande
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
