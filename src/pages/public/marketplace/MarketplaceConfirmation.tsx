import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, ArrowRight, ShoppingBag } from 'lucide-react';
import { doc, getDoc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Order, Product } from '../../../types';
import { Button } from '../../../components/ui/Button';

export function MarketplaceConfirmation() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id && status === 'success' || status === 'successful') {
      confirmPaymentAndDeductStock(id);
    } else {
      setLoading(false);
      setError("Statut de paiement invalide ou annulé.");
    }
  }, [id, status]);

  const confirmPaymentAndDeductStock = async (orderId: string) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      
      await runTransaction(db, async (transaction) => {
        const orderDoc = await transaction.get(orderRef);
        if (!orderDoc.exists()) {
          throw new Error("Commande introuvable.");
        }
        
        const orderData = orderDoc.data() as Order;
        
        if (orderData.paymentStatus === 'PAID') {
          // Already paid, do not deduct again
          setOrder({ id: orderDoc.id, ...orderData });
          return;
        }

        // Deduct stock for each item
        for (const item of orderData.items) {
          const productRef = doc(db, 'products', item.productId);
          const productDoc = await transaction.get(productRef);
          
          if (productDoc.exists()) {
            const productData = productDoc.data() as Product;
            const newStock = Math.max(0, productData.stock - item.quantity);
            const newStatus = newStock === 0 ? 'OUT_OF_STOCK' : productData.status;
            
            transaction.update(productRef, {
              stock: newStock,
              status: newStatus,
              updatedAt: Date.now()
            });
          }
        }

        // Update order status
        const updateData = {
          paymentStatus: 'PAID',
          orderStatus: 'PAID',
          paidAt: Date.now(),
          updatedAt: Date.now()
        };
        
        transaction.update(orderRef, updateData);
        setOrder({ id: orderDoc.id, ...orderData, ...updateData } as Order);
      });
      
    } catch (err: any) {
      console.error("Error confirming payment:", err);
      setError(err.message || "Une erreur est survenue lors de la confirmation.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50">
        <Loader2 className="w-12 h-12 text-[#E67E22] animate-spin mb-4" />
        <p className="text-stone-500 font-medium animate-pulse">Vérification du paiement en cours...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 px-4">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <XCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold font-heading text-stone-800 mb-4 text-center">Échec de la commande</h1>
        <p className="text-stone-500 mb-8 max-w-md text-center">{error}</p>
        <Link to="/marketplace">
          <Button className="bg-[#6B3E1E] hover:bg-[#532f17] text-white">
            Retour à la boutique
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="w-full max-w-7xl mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-stone-100 text-center relative overflow-hidden">
          {/* Decorative background */}
          <div className="absolute top-0 left-0 w-full h-32 bg-emerald-50 -z-10" />
          
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 border-4 border-white shadow-sm">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold font-heading text-emerald-700 mb-2">Commande confirmée !</h1>
          <p className="text-stone-500 mb-8 max-w-md mx-auto">
            Merci pour votre achat. Votre paiement a été traité avec succès et votre commande est en cours de préparation.
          </p>

          <div className="bg-stone-50 rounded-2xl p-6 text-left border border-stone-100 mb-8">
            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
              <div>
                <span className="block text-stone-400 font-medium text-xs uppercase tracking-wider mb-1">Numéro de commande</span>
                <span className="font-bold text-stone-800">{order.orderNumber}</span>
              </div>
              <div>
                <span className="block text-stone-400 font-medium text-xs uppercase tracking-wider mb-1">Date</span>
                <span className="font-bold text-stone-800">{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="block text-stone-400 font-medium text-xs uppercase tracking-wider mb-1">Montant total</span>
                <span className="font-bold text-[#E67E22]">{order.totalAmount.toLocaleString()} {order.currency}</span>
              </div>
              <div>
                <span className="block text-stone-400 font-medium text-xs uppercase tracking-wider mb-1">Statut</span>
                <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold text-xs">
                  Payée
                </span>
              </div>
            </div>

            <div className="border-t border-stone-200 pt-4">
              <span className="block text-stone-400 font-medium text-xs uppercase tracking-wider mb-3">Articles commandés</span>
              <ul className="space-y-2">
                {order.items.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-center text-sm">
                    <span className="text-stone-700"><span className="font-bold text-stone-500 mr-2">{item.quantity}x</span> {item.name}</span>
                    <span className="font-medium text-stone-800">{item.totalPrice.toLocaleString()} {order.currency}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Link to="/marketplace">
            <Button className="w-full bg-[#6B3E1E] hover:bg-[#532f17] text-white py-4 rounded-xl font-bold text-lg shadow-md flex items-center justify-center group">
              <ShoppingBag className="w-5 h-5 mr-2" />
              Continuer mes achats
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
