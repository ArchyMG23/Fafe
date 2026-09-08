import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, ShoppingBag, User } from 'lucide-react';
import { Order } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { ordersService } from '../../../services/orders';
import { useAuthStore } from '../../../store/auth';

export function MarketplaceConfirmation() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const statusParam = searchParams.get('status');
  const { currentUser } = useAuthStore();
  
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadOrder(id);
    } else {
      setLoading(false);
      setError('Référence de commande manquante.');
    }
  }, [id]);

  const loadOrder = async (orderId: string) => {
    try {
      setLoading(true);
      const fetched = await ordersService.getOrder(orderId);
      if (fetched) {
        // If statusParam is success, ensure order is marked confirmed
        if (statusParam === 'success' && fetched.orderStatus === 'PENDING') {
          await ordersService.updateOrderStatus(orderId, 'CONFIRMED');
          fetched.orderStatus = 'CONFIRMED';
        }
        setOrder(fetched);
      } else {
        setError('Cette commande est introuvable.');
      }
    } catch (err: any) {
      console.error('Error fetching confirmation order:', err);
      setError('Impossible de récupérer les détails de la commande.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 py-20 px-4">
        <Loader2 className="w-10 h-10 text-[#00843D] animate-spin mb-4" />
        <p className="text-stone-600 font-medium text-sm">Chargement de votre confirmation...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 px-4 py-20">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 text-red-500">
          <XCircle className="w-10 h-10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-stone-800 mb-3 text-center">
          Détails indisponibles
        </h1>
        <p className="text-stone-500 mb-8 max-w-md text-center text-sm sm:text-base">
          {error || 'La commande demandée n\'a pas pu être trouvée.'}
        </p>
        <Link to="/marketplace">
          <Button className="bg-[#00843D] hover:bg-[#006830] text-white font-bold px-8 py-3 rounded-xl">
            Retour à la boutique
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-10 sm:py-16">
      <div className="w-full max-w-7xl mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-stone-200/70 text-center relative overflow-hidden">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-sm">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#063F3A] mb-2">
            Commande confirmée !
          </h1>
          <p className="text-stone-600 mb-8 max-w-md mx-auto text-sm sm:text-base leading-relaxed">
            Merci pour votre commande. Nos artisanes et équipes préparent vos articles avec soin.
          </p>

          <div className="bg-stone-50 rounded-2xl p-6 text-left border border-stone-200/70 mb-8 space-y-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-stone-400 font-semibold text-xs uppercase tracking-wider mb-1">
                  N° de commande
                </span>
                <span className="font-bold text-stone-900 font-mono">{order.orderNumber}</span>
              </div>
              <div>
                <span className="block text-stone-400 font-semibold text-xs uppercase tracking-wider mb-1">
                  Date
                </span>
                <span className="font-semibold text-stone-800">
                  {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div>
                <span className="block text-stone-400 font-semibold text-xs uppercase tracking-wider mb-1">
                  Destinataire
                </span>
                <span className="font-semibold text-stone-800">
                  {order.customerFirstName} {order.customerLastName}
                </span>
              </div>
              <div>
                <span className="block text-stone-400 font-semibold text-xs uppercase tracking-wider mb-1">
                  Statut
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full font-bold text-xs">
                  {order.orderStatus === 'CONFIRMED' ? 'Confirmée' : order.orderStatus}
                </span>
              </div>
            </div>

            <div className="border-t border-stone-200/60 pt-4">
              <span className="block text-stone-400 font-semibold text-xs uppercase tracking-wider mb-1">
                Lieu de livraison
              </span>
              <p className="text-xs sm:text-sm text-stone-700">
                {order.customerAddress}, {order.customerCity}, {order.customerCountry}
              </p>
            </div>

            <div className="border-t border-stone-200/60 pt-4">
              <span className="block text-stone-400 font-semibold text-xs uppercase tracking-wider mb-3">
                Articles commandés ({order.items.length})
              </span>
              <ul className="space-y-2.5">
                {order.items.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-center text-sm">
                    <span className="text-stone-800 font-medium">
                      <span className="font-bold text-stone-500 mr-2">{item.quantity}x</span>
                      {item.name}
                    </span>
                    <span className="font-semibold text-[#063F3A]">
                      {item.totalPrice.toLocaleString()} {order.currency}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-stone-200/60 pt-4 flex justify-between items-baseline">
              <span className="font-bold text-stone-800 text-sm">Total payé</span>
              <span className="text-xl font-bold text-[#00843D]">
                {order.totalAmount.toLocaleString()} {order.currency}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/marketplace" className="w-full sm:w-1/2">
              <Button className="w-full bg-[#00843D] hover:bg-[#006830] text-white py-3.5 rounded-xl font-bold text-sm shadow-sm flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Continuer mes achats
              </Button>
            </Link>

            {currentUser ? (
              <Link to="/hub/dashboard/commandes" className="w-full sm:w-1/2">
                <Button variant="outline" className="w-full border-stone-300 text-stone-700 hover:bg-stone-50 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center">
                  <User className="w-4 h-4 mr-2" />
                  Mes commandes
                </Button>
              </Link>
            ) : (
              <Link to="/hub/inscription" className="w-full sm:w-1/2">
                <Button variant="outline" className="w-full border-stone-300 text-stone-700 hover:bg-stone-50 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center">
                  Créer un compte FAFE
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
