import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order, OrderItem, OrderStatus, OrderPaymentStatus } from '../types';
import { marketplaceService } from './marketplace';

const LOCAL_ORDERS_KEY = 'fafe_orders_cache_v2';

export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CMD-${year}-${randomSuffix}`;
}

function notifyOrdersUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('fafe_orders_updated'));
  }
}

export interface CreateOrderInput {
  customerId?: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string;
  customerCountry: string;
  customerCity: string;
  customerAddress: string;
  items: Array<{
    productId: string;
    slug?: string;
    name: string;
    quantity: number;
    unitPrice: number;
    image?: string;
  }>;
  currency?: string;
  paymentMethod?: string;
  isTestOrder?: boolean;
}

class OrdersService {
  private ordersCache: Order[] | null = null;

  private getCachedOrders(): Order[] {
    if (this.ordersCache && this.ordersCache.length > 0) {
      return this.ordersCache;
    }
    try {
      const stored = localStorage.getItem(LOCAL_ORDERS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          this.ordersCache = parsed;
          return parsed;
        }
      }
    } catch {
      // Ignore
    }
    return [];
  }

  private setCachedOrders(orders: Order[]): void {
    this.ordersCache = orders;
    try {
      localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
    } catch {
      // Ignore
    }
  }

  // Create a new order with stock validation and immediate Firestore write
  async createOrder(input: CreateOrderInput): Promise<Order> {
    if (!input.items || input.items.length === 0) {
      throw new Error('Le panier est vide. Veuillez sélectionner des articles.');
    }

    // 1. Stock check: ensure every product has sufficient stock
    for (const item of input.items) {
      const product = await marketplaceService.getProductById(item.productId);
      if (product) {
        if (product.stock < item.quantity) {
          throw new Error(
            `Le produit "${item.name}" n'a plus que ${product.stock} unité(s) disponible(s) en stock.`
          );
        }
      }
    }

    // 2. Compute order items with historical frozen prices
    const orderItems: OrderItem[] = input.items.map(item => ({
      productId: item.productId,
      slug: item.slug,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.unitPrice * item.quantity,
      image: item.image
    }));

    const totalAmount = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const orderNumber = generateOrderNumber();
    const orderId = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = Date.now();

    const isTest = input.isTestOrder !== false; // Default to test order mode in demo environment

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      customerId: input.customerId,
      customerFirstName: input.customerFirstName.trim(),
      customerLastName: input.customerLastName.trim(),
      customerEmail: input.customerEmail.trim().toLowerCase(),
      customerPhone: input.customerPhone.trim(),
      customerCountry: input.customerCountry.trim(),
      customerCity: input.customerCity.trim(),
      customerAddress: input.customerAddress.trim(),
      items: orderItems,
      totalAmount,
      currency: input.currency || 'XAF',
      orderStatus: 'PENDING',
      paymentStatus: 'PAID', // In sandbox / test mode it marks as confirmed
      paymentMethod: input.paymentMethod || 'TEST_SANDBOX',
      paidAt: now,
      createdAt: now,
      updatedAt: now
    };

    // 3. Write Order directly to Firestore
    try {
      const orderRef = doc(db, 'orders', orderId);
      await setDoc(orderRef, newOrder);
    } catch (err) {
      console.warn('Could not write order directly to Firestore:', err);
    }

    // 4. Decrement stock for all purchased items in Firestore
    for (const item of input.items) {
      try {
        await marketplaceService.updateStock(item.productId, -item.quantity);
      } catch (stockErr) {
        console.warn(`Could not update stock for product ${item.productId}:`, stockErr);
      }
    }

    // 5. Update local cache
    const current = this.getCachedOrders();
    current.unshift(newOrder);
    this.setCachedOrders(current);

    // 6. Notify
    notifyOrdersUpdated();

    return newOrder;
  }

  // Get order by ID or orderNumber
  async getOrder(idOrNumber: string): Promise<Order | null> {
    const target = idOrNumber.trim();
    
    // Try Firestore by ID
    try {
      const docRef = doc(db, 'orders', target);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const ord = { id: snap.id, ...snap.data() } as Order;
        return ord;
      }
    } catch {
      // Continue
    }

    // Try finding in all orders
    const all = await this.getAllOrders();
    return all.find(o => o.id === target || o.orderNumber === target) || null;
  }

  // Get all orders for administration from Firestore
  async getAllOrders(): Promise<Order[]> {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const list: Order[] = [];
        snapshot.forEach(docSnap => {
          list.push({ id: docSnap.id, ...docSnap.data() } as Order);
        });
        this.setCachedOrders(list);
        return list;
      }
    } catch (err) {
      console.warn('Could not fetch orders from Firestore:', err);
    }
    return this.getCachedOrders();
  }

  async getOrders(): Promise<Order[]> {
    return this.getAllOrders();
  }

  // Get orders for a specific user
  async getUserOrders(email?: string, customerId?: string): Promise<Order[]> {
    const all = await this.getAllOrders();
    const cleanEmail = email?.trim().toLowerCase();
    return all.filter(o => {
      if (customerId && o.customerId === customerId) return true;
      if (cleanEmail && o.customerEmail?.toLowerCase() === cleanEmail) return true;
      return false;
    });
  }

  // Update order status in Firestore
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    try {
      const docRef = doc(db, 'orders', orderId);
      await setDoc(docRef, { orderStatus: status, updatedAt: Date.now() }, { merge: true });
    } catch (err) {
      console.warn('Firestore update order status error:', err);
    }

    // Update local cache
    const current = this.getCachedOrders();
    const target = current.find(o => o.id === orderId || o.orderNumber === orderId);
    if (target) {
      target.orderStatus = status;
      target.updatedAt = Date.now();
      this.setCachedOrders(current);
    }

    notifyOrdersUpdated();
  }

  // Update payment status
  async updatePaymentStatus(orderId: string, status: OrderPaymentStatus): Promise<void> {
    try {
      const docRef = doc(db, 'orders', orderId);
      await setDoc(docRef, {
        paymentStatus: status,
        paidAt: status === 'PAID' ? Date.now() : undefined,
        updatedAt: Date.now()
      }, { merge: true });
    } catch (err) {
      console.warn('Firestore update payment status error:', err);
    }

    const current = this.getCachedOrders();
    const target = current.find(o => o.id === orderId || o.orderNumber === orderId);
    if (target) {
      target.paymentStatus = status;
      if (status === 'PAID') {
        target.paidAt = Date.now();
        if (target.orderStatus === 'PENDING') {
          target.orderStatus = 'CONFIRMED';
        }
      }
      target.updatedAt = Date.now();
      this.setCachedOrders(current);
    }

    notifyOrdersUpdated();
  }

  // Cancel order and restore product stock
  async cancelOrder(orderId: string): Promise<void> {
    const order = await this.getOrder(orderId);
    if (!order || order.orderStatus === 'CANCELLED') return;

    // 1. Restore stock in Firestore
    for (const item of order.items) {
      try {
        await marketplaceService.updateStock(item.productId, item.quantity);
      } catch (err) {
        console.warn('Could not restore stock:', err);
      }
    }

    // 2. Update order in Firestore
    try {
      const docRef = doc(db, 'orders', orderId);
      await updateDoc(docRef, {
        orderStatus: 'CANCELLED',
        updatedAt: Date.now()
      });
    } catch (err) {
      console.warn('Firestore cancel order error:', err);
    }

    // 3. Update cache
    const current = this.getCachedOrders();
    const target = current.find(o => o.id === orderId || o.orderNumber === orderId);
    if (target) {
      target.orderStatus = 'CANCELLED';
      target.updatedAt = Date.now();
      this.setCachedOrders(current);
    }

    notifyOrdersUpdated();
  }
}

export const ordersService = new OrdersService();
