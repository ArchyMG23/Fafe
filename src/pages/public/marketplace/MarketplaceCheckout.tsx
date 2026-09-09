import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowRight, ShieldCheck, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../../store/auth';
import { useCartStore } from '../../../store/cart';
import { Button } from '../../../components/ui/Button';
import { ordersService } from '../../../services/orders';

const checkoutSchema = z.object({
  firstName: z.string().min(2, 'Le prénom est requis (au moins 2 caractères)'),
  lastName: z.string().min(2, 'Le nom est requis (au moins 2 caractères)'),
  email: z.string().email('Adresse e-mail valide requise'),
  phone: z.string().min(8, 'Numéro de téléphone requis'),
  country: z.string().min(2, 'Le pays est requis'),
  city: z.string().min(2, 'La ville est requise'),
  address: z.string().min(5, 'Adresse de livraison complète requise'),
  paymentMethod: z.enum(['TEST_SANDBOX', 'MOBILE_MONEY', 'CARD', 'CASH_ON_DELIVERY'])
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export function MarketplaceCheckout() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { currentUser, userProfile } = useAuthStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  
  const total = getTotalPrice();

  useEffect(() => {
    if (items.length === 0) {
      navigate('/marketplace/panier');
    }
  }, [items, navigate]);

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: userProfile?.firstName || 'Victor',
      lastName: userProfile?.lastName || 'YOMBI',
      email: userProfile?.email || currentUser?.email || 'yombivictor@gmail.com',
      phone: userProfile?.phone || '+225 07 00 00 00 00',
      country: userProfile?.country || "Côte d'Ivoire",
      city: userProfile?.city || 'Abidjan',
      address: 'Plateau, Immeuble Symphonie, 4e étage',
      paymentMethod: 'TEST_SANDBOX'
    }
  });

  const processOrder = async (data: CheckoutFormData) => {
    try {
      setIsProcessing(true);
      setCheckoutError(null);

      const createdOrder = await ordersService.createOrder({
        customerId: currentUser?.uid,
        customerFirstName: data.firstName,
        customerLastName: data.lastName,
        customerEmail: data.email,
        customerPhone: data.phone,
        customerCountry: data.country,
        customerCity: data.city,
        customerAddress: data.address,
        currency: 'XAF',
        paymentMethod: data.paymentMethod,
        isTestOrder: true,
        items: items.map(item => ({
          productId: item.productId,
          slug: item.slug,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          image: item.image
        }))
      });

      // Clear the user's cart
      clearCart();

      // Navigate to confirmation page
      navigate(`/marketplace/confirmation/${createdOrder.id}?status=success`);
    } catch (error: any) {
      console.error('Error processing order:', error);
      setCheckoutError(error.message || 'Une erreur est survenue lors de la validation de votre commande.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-10 sm:py-12">
      <div className="w-full max-w-7xl mx-auto px-4 max-w-5xl">
        {/* Sandbox Notice Banner */}
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-[#00843D]/10 border border-[#00843D]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-[#00843D] text-white flex-shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-[#063F3A]">
                  Environnement de Démonstration PCA &bull; Sandbox Test
                </h3>
                <span className="bg-[#D4AF37]/20 text-[#063F3A] font-bold text-[10px] uppercase px-2 py-0.5 rounded-full border border-[#D4AF37]/40">
                  Mode Démo Sécurisé
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                Cette transaction s'exécute en mode TEST/SANDBOX. Aucun débit réel ne sera effectué. La commande et la décrémentation du stock sont enregistrées en direct dans Firebase.
              </p>
            </div>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#063F3A] mb-8">
          Finaliser votre commande
        </h1>

        {checkoutError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm">Impossible de valider la commande</h3>
              <p className="text-sm mt-0.5">{checkoutError}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/70">
            <h2 className="text-lg sm:text-xl font-bold font-heading text-[#063F3A] mb-6">
              Coordonnées et adresse de livraison
            </h2>
            
            <form id="checkout-form" onSubmit={handleSubmit(processOrder)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    Prénom *
                  </label>
                  <input
                    {...register('firstName')}
                    placeholder="Prénom"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#00843D]/20 focus:border-[#00843D] text-sm text-stone-800 outline-none transition-colors"
                  />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    Nom *
                  </label>
                  <input
                    {...register('lastName')}
                    placeholder="Nom"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#00843D]/20 focus:border-[#00843D] text-sm text-stone-800 outline-none transition-colors"
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    Adresse e-mail *
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="nom@exemple.com"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#00843D]/20 focus:border-[#00843D] text-sm text-stone-800 outline-none transition-colors"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    Téléphone WhatsApp / Contact *
                  </label>
                  <input
                    type="tel"
                    {...register('phone')}
                    placeholder="+225 07 00 00 00 00"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#00843D]/20 focus:border-[#00843D] text-sm text-stone-800 outline-none transition-colors"
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    Pays *
                  </label>
                  <input
                    {...register('country')}
                    placeholder="Côte d'Ivoire, Sénégal, Cameroun..."
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#00843D]/20 focus:border-[#00843D] text-sm text-stone-800 outline-none transition-colors"
                  />
                  {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    Ville *
                  </label>
                  <input
                    {...register('city')}
                    placeholder="Abidjan, Dakar, Douala..."
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#00843D]/20 focus:border-[#00843D] text-sm text-stone-800 outline-none transition-colors"
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Adresse de livraison complète *
                </label>
                <input
                  {...register('address')}
                  placeholder="Quartier, rue, numéro de porte ou repère"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#00843D]/20 focus:border-[#00843D] text-sm text-stone-800 outline-none transition-colors"
                />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
              </div>

              <div className="pt-4 border-t border-stone-100">
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-3">
                  Mode de règlement (Mode Démonstration PCA)
                </label>
                <div className="space-y-2.5">
                  <label className="flex items-center gap-3 p-3.5 border-2 border-[#00843D] bg-[#00843D]/5 rounded-xl cursor-pointer transition-colors">
                    <input
                      type="radio"
                      value="TEST_SANDBOX"
                      {...register('paymentMethod')}
                      defaultChecked
                      className="text-[#00843D] focus:ring-[#00843D]"
                    />
                    <div className="flex-grow">
                      <div className="flex items-center justify-between">
                        <span className="block text-xs font-bold text-stone-900">
                          Simulation Sandbox FAFE (Validation instantanée)
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                          Recommandé PCA
                        </span>
                      </div>
                      <span className="block text-[11px] text-stone-500">
                        Idéal pour la présentation en direct devant la PCA : paiement test validé immédiatement, sans frais.
                      </span>
                    </div>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <label className="flex items-center gap-2.5 p-3 border border-stone-200 rounded-xl cursor-pointer hover:bg-stone-50 transition-colors">
                      <input
                        type="radio"
                        value="MOBILE_MONEY"
                        {...register('paymentMethod')}
                        className="text-[#00843D] focus:ring-[#00843D]"
                      />
                      <div>
                        <span className="block text-xs font-bold text-stone-800">Mobile Money Test</span>
                        <span className="block text-[10px] text-stone-500">Orange / MTN / Wave</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 p-3 border border-stone-200 rounded-xl cursor-pointer hover:bg-stone-50 transition-colors">
                      <input
                        type="radio"
                        value="CARD"
                        {...register('paymentMethod')}
                        className="text-[#00843D] focus:ring-[#00843D]"
                      />
                      <div>
                        <span className="block text-xs font-bold text-stone-800">Carte Bancaire Test</span>
                        <span className="block text-[10px] text-stone-500">3D Secure Sandbox</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 p-3 border border-stone-200 rounded-xl cursor-pointer hover:bg-stone-50 transition-colors">
                      <input
                        type="radio"
                        value="CASH_ON_DELIVERY"
                        {...register('paymentMethod')}
                        className="text-[#00843D] focus:ring-[#00843D]"
                      />
                      <div>
                        <span className="block text-xs font-bold text-stone-800">À la réception</span>
                        <span className="block text-[10px] text-stone-500">Paiement direct test</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isProcessing}
                className="w-full mt-6 bg-[#00843D] hover:bg-[#006830] text-white py-4 rounded-xl font-bold text-base shadow-sm flex items-center justify-center group"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Enregistrement dans Firebase & décrémentation du stock...
                  </>
                ) : (
                  <>
                    Valider l'Achat Test PCA
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/70 sticky top-24">
              <h2 className="text-lg sm:text-xl font-bold font-heading text-[#063F3A] mb-5">
                Articles commandés ({items.reduce((s, i) => s + i.quantity, 0)})
              </h2>

              <div className="divide-y divide-stone-100 max-h-80 overflow-y-auto pr-1 mb-6">
                {items.map((item) => (
                  <div key={item.productId} className="py-3 flex items-center gap-3">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-stone-100 flex-shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-stone-100 flex-shrink-0 flex items-center justify-center text-stone-400 text-xs font-bold">
                        FAFE
                      </div>
                    )}
                    <div className="flex-grow min-w-0">
                      <h4 className="font-semibold text-stone-800 text-sm truncate">{item.name}</h4>
                      <p className="text-xs text-stone-500">Qté : {item.quantity}</p>
                    </div>
                    <span className="font-bold text-sm text-[#063F3A] flex-shrink-0">
                      {(item.price * item.quantity).toLocaleString()} XAF
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2.5 pt-4 border-t border-stone-100 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Sous-total</span>
                  <span className="font-semibold text-stone-800">{total.toLocaleString()} XAF</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Frais de livraison</span>
                  <span className="text-emerald-700 font-semibold">Offerts</span>
                </div>
              </div>

              <div className="border-t border-stone-100 mt-5 pt-4 mb-6">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-stone-800">Montant total</span>
                  <span className="text-2xl font-bold text-[#00843D]">{total.toLocaleString()} XAF</span>
                </div>
              </div>

              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100 text-xs text-stone-600 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-stone-700">
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                  Achat garanti et suivi FAFE
                </div>
                <p>Vos informations sont traitées de manière confidentielle et votre commande est enregistrée directement dans Firebase.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
