import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, updateDoc, doc, runTransaction } from 'firebase/firestore';
import { Eye, Edit2, Loader2, CheckCircle2, Search } from 'lucide-react';
import { db } from '../../../lib/firebase';
import { Order, Product } from '../../../types';
import { Button } from '../../../components/ui/Button';

export function AdminMarketplaceOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const fetched: Order[] = [];
      snap.forEach(doc => fetched.push({ id: doc.id, ...doc.data() } as Order));
      setOrders(fetched);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['orderStatus']) => {
    try {
      setLoading(true);
      await updateDoc(doc(db, 'orders', orderId), {
        orderStatus: newStatus,
        updatedAt: Date.now()
      });
      await fetchOrders();
      if (selectedOrder) {
        setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
      }
    } catch (error) {
      console.error('Error updating order:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId: string) => {
    if (!window.confirm("Voulez-vous annuler cette commande et restaurer le stock ?")) return;

    try {
      setLoading(true);
      const orderRef = doc(db, 'orders', orderId);

      await runTransaction(db, async (transaction) => {
        const orderDoc = await transaction.get(orderRef);
        if (!orderDoc.exists()) throw new Error("Order not found");
        
        const orderData = orderDoc.data() as Order;
        
        if (orderData.orderStatus === 'CANCELLED') {
          throw new Error("Order is already cancelled.");
        }

        // Restore stock for items if they were deducted (meaning if it was PAID or processing where stock was already affected)
        // In our workflow, stock is deducted when PAID.
        if (orderData.paymentStatus === 'PAID') {
          for (const item of orderData.items) {
            const productRef = doc(db, 'products', item.productId);
            const productDoc = await transaction.get(productRef);
            
            if (productDoc.exists()) {
              const pData = productDoc.data() as Product;
              transaction.update(productRef, {
                stock: pData.stock + item.quantity,
                status: pData.status === 'OUT_OF_STOCK' ? 'PUBLISHED' : pData.status,
                updatedAt: Date.now()
              });
            }
          }
        }

        const updateData = {
          orderStatus: 'CANCELLED',
          paymentStatus: orderData.paymentStatus === 'PAID' ? 'REFUNDED' : 'CANCELLED',
          updatedAt: Date.now()
        };
        transaction.update(orderRef, updateData);
        if (selectedOrder) setSelectedOrder({ ...orderData, ...updateData } as Order);
      });

      await fetchOrders();
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("Erreur lors de l'annulation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-stone-800">Commandes</h1>
        <p className="text-stone-500">Gérez les ventes de la marketplace</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-stone-600">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-800">
                  <tr>
                    <th className="px-4 py-4 font-bold">Commande</th>
                    <th className="px-4 py-4 font-bold">Client</th>
                    <th className="px-4 py-4 font-bold">Montant</th>
                    <th className="px-4 py-4 font-bold">Paiement</th>
                    <th className="px-4 py-4 font-bold">Statut</th>
                    <th className="px-4 py-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {orders.map((order) => (
                    <tr 
                      key={order.id} 
                      className={`cursor-pointer transition-colors ${selectedOrder?.id === order.id ? 'bg-[#E67E22]/5' : 'hover:bg-stone-50'}`}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="px-4 py-4 font-medium text-stone-800">
                        {order.orderNumber}
                        <div className="text-xs text-stone-400 font-normal">{new Date(order.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-stone-700">{order.customerFirstName} {order.customerLastName}</div>
                      </td>
                      <td className="px-4 py-4 font-bold text-[#6B3E1E]">
                        {order.totalAmount.toLocaleString()} {order.currency}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          order.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' :
                          order.paymentStatus === 'PENDING' ? 'bg-stone-100 text-stone-600' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          ['DELIVERED', 'SHIPPED', 'CONFIRMED'].includes(order.orderStatus) ? 'bg-blue-100 text-blue-700' :
                          order.orderStatus === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Button size="sm" variant="outline" className="h-8 px-2 text-stone-500">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && !loading && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-stone-500">Aucune commande trouvée</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          {selectedOrder ? (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 sticky top-24">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-bold text-lg text-stone-800">{selectedOrder.orderNumber}</h3>
                  <p className="text-sm text-stone-500">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  selectedOrder.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-600'
                }`}>
                  {selectedOrder.paymentStatus === 'PAID' ? 'Payée' : 'En attente'}
                </span>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Client</h4>
                  <div className="text-sm">
                    <p className="font-bold text-stone-800">{selectedOrder.customerFirstName} {selectedOrder.customerLastName}</p>
                    <p className="text-stone-600">{selectedOrder.customerEmail}</p>
                    <p className="text-stone-600">{selectedOrder.customerPhone}</p>
                    <p className="text-stone-600 mt-2">{selectedOrder.customerAddress}</p>
                    <p className="text-stone-600">{selectedOrder.customerCity}, {selectedOrder.customerCountry}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Articles</h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <div className="flex gap-2">
                          <span className="font-bold text-stone-500">{item.quantity}x</span>
                          <span className="text-stone-700">{item.name}</span>
                        </div>
                        <span className="font-medium text-stone-800">{item.totalPrice.toLocaleString()} {selectedOrder.currency}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-stone-100 mt-4 pt-4 flex justify-between items-center">
                    <span className="font-bold text-stone-800">Total</span>
                    <span className="font-bold text-[#E67E22] text-lg">{selectedOrder.totalAmount.toLocaleString()} {selectedOrder.currency}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Actions</h4>
                  <div className="space-y-2">
                    <select
                      value={selectedOrder.orderStatus}
                      onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value as Order['orderStatus'])}
                      disabled={loading || selectedOrder.orderStatus === 'CANCELLED'}
                      className="w-full p-2.5 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:ring-[#E67E22]"
                    >
                      <option value="PENDING_PAYMENT">En attente paiement</option>
                      <option value="PAID">Payée</option>
                      <option value="CONFIRMED">Confirmée</option>
                      <option value="PREPARING">En préparation</option>
                      <option value="SHIPPED">Expédiée</option>
                      <option value="DELIVERED">Livrée</option>
                      <option value="CANCELLED" disabled>Annulée</option>
                    </select>

                    {selectedOrder.orderStatus !== 'CANCELLED' && (
                      <Button 
                        onClick={() => cancelOrder(selectedOrder.id)}
                        variant="outline" 
                        disabled={loading}
                        className="w-full text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Annuler la commande
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-stone-50 rounded-2xl p-8 border border-stone-100 text-center flex flex-col items-center justify-center h-full">
              <Search className="w-8 h-8 text-stone-300 mb-4" />
              <p className="text-stone-500 font-medium">Sélectionnez une commande pour voir les détails</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
