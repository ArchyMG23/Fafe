import { collection, doc, setDoc, getDoc, getDocs, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order, OrderItem, OrderStatus, OrderPaymentStatus } from '../types';
import { marketplaceService } from './marketplace';

const LOCAL_ORDERS_KEY = 'fafe_orders_v1';

export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CMD-${year}-${randomSuffix}`;
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
}

class OrdersService {
  private getLocalOrders(): Order[] {
    try {
      const stored = localStorage.getItem(LOCAL_ORDERS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }
    return [];
  }

  private saveLocalOrders(orders: Order[]): void {
    try {
      localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
    } catch {
      // Ignore
    }
  }

  // Create a new order with stock validation and immediate deduction
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
      paymentStatus: 'UNPAID',
      paymentMethod: input.paymentMethod || 'MOBILE_MONEY',
      createdAt: now,
      updatedAt: now
    };

    // 3. Decrement stock for all purchased items
    for (const item of input.items) {
      await marketplaceService.updateStock(item.productId, -item.quantity);
    }

    // 4. Save to local repository
    const localOrders = this.getLocalOrders();
    localOrders.unshift(newOrder);
    this.saveLocalOrders(localOrders);

    // 5. Try syncing to Firestore
    try {
      const orderRef = doc(db, 'orders', orderId);
      await setDoc(orderRef, newOrder);
    } catch (err) {
      console.warn('Could not sync order to Firestore, stored locally:', err);
    }

    return newOrder;
  }

  // Get order by ID or orderNumber
  async getOrder(idOrNumber: string): Promise<Order | null> {
    const target = idOrNumber.trim();
    // Try Firestore
    try {
      const docRef = doc(db, 'orders', target);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as Order;
      }
    } catch {
      // Fallback
    }

    // Check local
    const localOrders = this.getLocalOrders();
    return localOrders.find(o => o.id === target || o.orderNumber === target) || null;
  }

  // Get all orders for administration
  async getAllOrders(): Promise<Order[]> {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const list: Order[] = [];
        snapshot.forEach(docSnap => {
          list.push({ id: docSnap.id, ...docSnap.data() } as Order);
        });
        this.saveLocalOrders(list);
        return list;
      }
    } catch {
      // Fallback
    }
    return this.getLocalOrders();
  }

  // Alias for getAllOrders
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

  // Update order status
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    const localOrders = this.getLocalOrders();
    const order = localOrders.find(o => o.id === orderId || o.orderNumber === orderId);
    if (order) {
      order.orderStatus = status;
      order.updatedAt = Date.now();
      this.saveLocalOrders(localOrders);
    }

    try {
      const docRef = doc(db, 'orders', orderId);
      await updateDoc(docRef, { orderStatus: status, updatedAt: Date.now() });
    } catch {
      // Ignored
    }
  }

  // Update payment status (e.g. after customer confirms)
  async updatePaymentStatus(orderId: string, status: OrderPaymentStatus): Promise<void> {
    const localOrders = this.getLocalOrders();
    const order = localOrders.find(o => o.id === orderId || o.orderNumber === orderId);
    if (order) {
      order.paymentStatus = status;
      if (status === 'PAID') {
        order.paidAt = Date.now();
        if (order.orderStatus === 'PENDING') {
          order.orderStatus = 'CONFIRMED';
        }
      }
      order.updatedAt = Date.now();
      this.saveLocalOrders(localOrders);
    }

    try {
      const docRef = doc(db, 'orders', orderId);
      await updateDoc(docRef, {
        paymentStatus: status,
        paidAt: status === 'PAID' ? Date.now() : undefined,
        updatedAt: Date.now()
      });
    } catch {
      // Ignored
    }
  }

  // Cancel order and restore product stock
  async cancelOrder(orderId: string): Promise<void> {
    const localOrders = this.getLocalOrders();
    const order = localOrders.find(o => o.id === orderId || o.orderNumber === orderId);
    if (!order) return;

    if (order.orderStatus === 'CANCELLED') return;

    // Restore stock
    for (const item of order.items) {
      await marketplaceService.updateStock(item.productId, item.quantity);
    }

    order.orderStatus = 'CANCELLED';
    order.updatedAt = Date.now();
    this.saveLocalOrders(localOrders);

    try {
      const docRef = doc(db, 'orders', orderId);
      await updateDoc(docRef, {
        orderStatus: 'CANCELLED',
        updatedAt: Date.now()
      });
    } catch {
      // Ignored
    }
  }
}

export const ordersService = new OrdersService();
