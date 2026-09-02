import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuthStore } from '../../../store/auth';
import { useCartStore } from '../../../store/cart';
import { Button } from '../../../components/ui/Button';

const checkoutSchema = z.object({
  firstName: z.string().min(2, 'Prénom requis'),
  lastName: z.string().min(2, 'Nom requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(8, 'Téléphone requis'),
  country: z.string().min(2, 'Pays requis'),
  city: z.string().min(2, 'Ville requise'),
  address: z.string().min(5, 'Adresse requise'),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export function MarketplaceCheckout() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { currentUser } = useAuthStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const total = getTotalPrice();

  useEffect(() => {
    if (items.length === 0) {
      navigate('/marketplace/panier');
    }
  }, [items, navigate]);

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: currentUser?.firstName || '',
      lastName: currentUser?.lastName || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
      country: currentUser?.country || '',
      city: currentUser?.city || '',
    }
  });

  const generateOrderNumber = () => {
    return 'CMD-' + Date.now().toString().slice(-6) + Math.random().toString(36).substring(2, 5).toUpperCase();
  };

  const processOrder = async (data: CheckoutFormData) => {
    try {
      setIsProcessing(true);
      
      const orderData = {
        orderNumber: generateOrderNumber(),
        customerId: currentUser?.uid || null,
        customerFirstName: data.firstName,
        customerLastName: data.lastName,
        customerEmail: data.email,
        customerPhone: data.phone,
        customerCountry: data.country,
        customerCity: data.city,
        customerAddress: data.address,
        items: items.map(item => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity
        })),
        totalAmount: total,
        currency: 'XAF',
        orderStatus: 'PENDING_PAYMENT',
        paymentStatus: 'PENDING',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      // 1. Create order in DB
      const orderRef = await addDoc(collection(db, 'orders'), orderData);
      
      // 2. Clear Cart
      clearCart();

      // 3. Initiate Abstract Payment Flow
      // Here we simulate the redirect to a payment aggregator and the callback
      simulatePaymentAggregator(orderRef.id);

    } catch (error) {
      console.error('Error processing order:', error);
      setIsProcessing(false);
      alert('Une erreur est survenue lors de la création de la commande.');
    }
  };

  const simulatePaymentAggregator = (orderId: string) => {
    // In production, this would redirect to the payment gateway (e.g., Stripe, MTN MoMo)
    // window.location.href = `https://payment-gateway.com/pay?orderId=${orderId}`;
    
    // For now, we simulate a successful callback after a short delay
    setTimeout(() => {
      // We navigate to a confirmation processing page or directly to confirmation
      navigate(`/marketplace/confirmation/${orderId}?status=success`);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-3xl font-bold font-heading text-[#6B3E1E] mb-8">Finaliser la commande</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-100">
            <h2 className="text-xl font-bold text-stone-800 mb-6">Informations de livraison</h2>
            
            <form id="checkout-form" onSubmit={handleSubmit(processOrder)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Prénom</label>
                  <input
                    {...register('firstName')}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#E67E22]/20 focus:border-[#E67E22] transition-colors"
                  />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Nom</label>
                  <input
                    {...register('lastName')}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#E67E22]/20 focus:border-[#E67E22] transition-colors"
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
                  <input
                    type="email"
                    {...register('email')}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#E67E22]/20 focus:border-[#E67E22] transition-colors"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Téléphone</label>
                  <input
                    {...register('phone')}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#E67E22]/20 focus:border-[#E67E22] transition-colors"
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Pays</label>
                  <input
                    {...register('country')}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#E67E22]/20 focus:border-[#E67E22] transition-colors"
                  />
                  {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Ville</label>
                  <input
                    {...register('city')}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#E67E22]/20 focus:border-[#E67E22] transition-colors"
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Adresse complète</label>
                <textarea
                  {...register('address')}
                  rows={3}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#E67E22]/20 focus:border-[#E67E22] transition-colors resize-none"
                />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
              </div>
            </form>
          </div>

          {/* Order Summary & Payment */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
              <h2 className="text-lg font-bold text-stone-800 mb-4">Résumé de la commande</h2>
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2">
                {items.map(item => (
                  <div key={item.productId} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-500">{item.quantity}x</span>
                      <span className="text-stone-700 truncate max-w-[150px] sm:max-w-[200px]">{item.name}</span>
                    </div>
                    <span className="font-medium text-stone-800">{(item.price * item.quantity).toLocaleString()} XAF</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-stone-100 pt-4 mb-6">
                <div className="flex justify-between items-end">
                  <span className="font-bold text-stone-800 text-lg">Total à payer</span>
                  <span className="text-2xl font-bold text-[#E67E22]">{total.toLocaleString()} XAF</span>
                </div>
              </div>

              <div className="bg-stone-50 rounded-xl p-4 flex items-start gap-3 border border-stone-100 mb-6">
                <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-stone-500 leading-relaxed">
                  Vos informations personnelles sont sécurisées. Vous allez être redirigé vers notre plateforme de paiement partenaire pour finaliser votre achat en toute sécurité.
                </p>
              </div>

              <Button 
                type="submit"
                form="checkout-form"
                disabled={isProcessing}
                className="w-full bg-[#6B3E1E] hover:bg-[#532f17] text-white py-4 rounded-xl font-bold text-lg shadow-md flex items-center justify-center group"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Initialisation du paiement...
                  </>
                ) : (
                  <>
                    Procéder au paiement
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
