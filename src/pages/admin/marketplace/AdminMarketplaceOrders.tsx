import { useState, useEffect } from 'react';
import { Eye, Loader2, Search, Filter, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Order } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { ordersService } from '../../../services/orders';

export function AdminMarketplaceOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();

    const handleUpdate = () => {
      fetchOrders();
    };
    window.addEventListener('fafe_orders_updated', handleUpdate);
    return () => {
      window.removeEventListener('fafe_orders_updated', handleUpdate);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const fetched = await ordersService.getOrders();
      setOrders(fetched);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: Order['orderStatus']) => {
    try {
      setLoading(true);
      await ordersService.updateOrderStatus(orderId, newStatus);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
      }
      setNotice(`Statut de la commande mis à jour: ${newStatus}`);
      setTimeout(() => setNotice(null), 3000);
      await fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, newPaymentStatus: Order['paymentStatus']) => {
    try {
      setLoading(true);
      await ordersService.updatePaymentStatus(orderId, newPaymentStatus);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, paymentStatus: newPaymentStatus });
      }
      setNotice(`Paiement mis à jour: ${newPaymentStatus}`);
      setTimeout(() => setNotice(null), 3000);
      await fetchOrders();
    } catch (error) {
      console.error('Error updating payment status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      setLoading(true);
      await ordersService.cancelOrder(orderId);
      setConfirmCancelId(null);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, orderStatus: 'CANCELLED', paymentStatus: 'REFUNDED' });
      }
      setNotice('Commande annulée et stock d\'articles restauré avec succès.');
      setTimeout(() => setNotice(null), 3000);
      await fetchOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    const term = search.toLowerCase();
    const matchesSearch = !term ||
      o.orderNumber.toLowerCase().includes(term) ||
      o.customerLastName?.toLowerCase().includes(term) ||
      o.customerFirstName?.toLowerCase().includes(term) ||
      o.customerEmail?.toLowerCase().includes(term);
    const matchesStatus = !statusFilter || o.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-stone-900">Suivi des Commandes</h1>
        <p className="text-sm text-stone-500">Gestion des commandes clients, livraisons et états de paiement</p>
      </div>

      {notice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          {notice}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input 
            type="text"
            placeholder="Rechercher par numéro de commande, nom ou email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-sm outline-none focus:border-[#00843D]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="p-2 bg-white border border-stone-200 rounded-xl text-sm outline-none focus:border-[#00843D] min-w-[200px]"
        >
          <option value="">Tous les statuts</option>
          <option value="PENDING">En attente</option>
          <option value="CONFIRMED">Confirmée</option>
          <option value="PREPARING">En préparation</option>
          <option value="SHIPPED">Expédiée</option>
          <option value="DELIVERED">Livrée</option>
          <option value="CANCELLED">Annulée</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table list */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-stone-600">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-800">
                  <tr>
                    <th className="px-4 py-3.5 font-bold">Commande</th>
                    <th className="px-4 py-3.5 font-bold">Client</th>
                    <th className="px-4 py-3.5 font-bold">Montant</th>
                    <th className="px-4 py-3.5 font-bold">Paiement</th>
                    <th className="px-4 py-3.5 font-bold">Statut</th>
                    <th className="px-4 py-3.5 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredOrders.map((order) => (
                    <tr 
                      key={order.id} 
                      className={`cursor-pointer transition-colors ${selectedOrder?.id === order.id ? 'bg-[#00843D]/5' : 'hover:bg-stone-50'}`}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="px-4 py-3.5 font-semibold text-stone-900">
                        <span className="font-mono text-xs">{order.orderNumber}</span>
                        <div className="text-[11px] text-stone-400 font-normal">
                          {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-stone-800 text-xs sm:text-sm">
                          {order.customerFirstName} {order.customerLastName}
                        </div>
                        <div className="text-xs text-stone-400">{order.customerCity}</div>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-[#063F3A] text-xs sm:text-sm">
                        {order.totalAmount.toLocaleString()} {order.currency}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          order.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                          order.paymentStatus === 'PENDING' ? 'bg-stone-100 text-stone-700' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.paymentStatus === 'PAID' ? 'Payée' : 
                           order.paymentStatus === 'PENDING' ? 'En attente' : order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          ['DELIVERED', 'SHIPPED', 'CONFIRMED'].includes(order.orderStatus) ? 'bg-blue-100 text-blue-800' :
                          order.orderStatus === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {order.orderStatus === 'CONFIRMED' ? 'Confirmée' :
                           order.orderStatus === 'PREPARING' ? 'Préparation' :
                           order.orderStatus === 'SHIPPED' ? 'Expédiée' :
                           order.orderStatus === 'DELIVERED' ? 'Livrée' :
                           order.orderStatus === 'CANCELLED' ? 'Annulée' : 'En attente'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Button size="sm" variant="outline" className="h-8 px-2 text-stone-500">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && !loading && (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-stone-500">
                        Aucune commande trouvée.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Detail view */}
        <div>
          {selectedOrder ? (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 sticky top-24 space-y-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-base text-stone-900 font-mono">{selectedOrder.orderNumber}</h3>
                  <p className="text-xs text-stone-500">
                    {new Date(selectedOrder.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Destinataire</h4>
                <div className="text-sm space-y-0.5 text-stone-700 bg-stone-50 p-3 rounded-xl">
                  <p className="font-bold text-stone-900">{selectedOrder.customerFirstName} {selectedOrder.customerLastName}</p>
                  <p className="text-xs">{selectedOrder.customerEmail}</p>
                  <p className="text-xs">{selectedOrder.customerPhone}</p>
                  <p className="text-xs pt-1 border-t border-stone-200/60 mt-1">
                    {selectedOrder.customerAddress}, {selectedOrder.customerCity}, {selectedOrder.customerCountry}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Articles commandés</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs py-1.5 border-b border-stone-100 last:border-0">
                      <div>
                        <span className="font-bold text-stone-600 mr-2">{item.quantity}x</span>
                        <span className="text-stone-800 font-medium">{item.name}</span>
                      </div>
                      <span className="font-semibold text-stone-900">
                        {item.totalPrice.toLocaleString()} {selectedOrder.currency}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-stone-200 pt-3 mt-2 flex justify-between items-center">
                  <span className="font-bold text-stone-800 text-sm">Total réglé</span>
                  <span className="font-bold text-[#00843D] text-base">
                    {selectedOrder.totalAmount.toLocaleString()} {selectedOrder.currency}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">État de traitement</h4>
                <div>
                  <label className="block text-xs text-stone-600 mb-1">Statut logistique</label>
                  <select
                    value={selectedOrder.orderStatus}
                    onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value as Order['orderStatus'])}
                    disabled={loading || selectedOrder.orderStatus === 'CANCELLED'}
                    className="w-full p-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:border-[#00843D] outline-none"
                  >
                    <option value="PENDING">En attente</option>
                    <option value="CONFIRMED">Confirmée</option>
                    <option value="PREPARING">En préparation</option>
                    <option value="SHIPPED">Expédiée</option>
                    <option value="DELIVERED">Livrée</option>
                    <option value="CANCELLED" disabled>Annulée</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-stone-600 mb-1">Statut paiement</label>
                  <select
                    value={selectedOrder.paymentStatus}
                    onChange={(e) => handleUpdatePaymentStatus(selectedOrder.id, e.target.value as Order['paymentStatus'])}
                    disabled={loading || selectedOrder.orderStatus === 'CANCELLED'}
                    className="w-full p-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:border-[#00843D] outline-none"
                  >
                    <option value="PENDING">En attente de règlement</option>
                    <option value="PAID">Payée</option>
                    <option value="FAILED">Échoué</option>
                    <option value="REFUNDED">Remboursée</option>
                  </select>
                </div>

                {selectedOrder.orderStatus !== 'CANCELLED' && (
                  confirmCancelId === selectedOrder.id ? (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-2">
                      <p className="text-xs text-red-800 font-medium">
                        Confirmer l'annulation ? Le stock des articles sera réintégré.
                      </p>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setConfirmCancelId(null)}
                          className="w-1/2 text-xs py-1 h-auto"
                        >
                          Retour
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => handleCancelOrder(selectedOrder.id)}
                          className="w-1/2 text-xs py-1 h-auto bg-red-600 text-white hover:bg-red-700"
                        >
                          Confirmer
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      onClick={() => setConfirmCancelId(selectedOrder.id)}
                      variant="outline" 
                      disabled={loading}
                      className="w-full text-xs text-red-600 border-red-200 hover:bg-red-50 py-2 h-auto"
                    >
                      Annuler la commande
                    </Button>
                  )
                )}
              </div>
            </div>
          ) : (
            <div className="bg-stone-50 rounded-2xl p-8 border border-stone-200 text-center flex flex-col items-center justify-center h-64">
              <Search className="w-8 h-8 text-stone-300 mb-3" />
              <p className="text-stone-500 font-medium text-sm">Sélectionnez une commande pour consulter le détail</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
