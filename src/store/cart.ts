import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '../types';

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product, quantity) => {
        set((state) => {
          const availableStock = Math.max(1, product.stock || 1);
          const existingItem = state.items.find((item) => item.productId === product.id);
          
          if (existingItem) {
            // Update quantity, ensuring it doesn't exceed stock
            const newQuantity = Math.min(existingItem.quantity + quantity, availableStock);
            return {
              items: state.items.map((item) =>
                item.productId === product.id ? { 
                  ...item, 
                  quantity: newQuantity, 
                  stock: availableStock,
                  slug: product.slug || item.slug 
                } : item
              ),
            };
          }
          
          // Add new item
          return {
            items: [
              ...state.items,
              {
                productId: product.id,
                slug: product.slug || product.id,
                name: product.name,
                price: product.promotionalPrice && product.promotionalPrice < product.price ? product.promotionalPrice : product.price,
                quantity: Math.min(quantity, availableStock),
                image: product.images?.[0] || '',
                stock: availableStock,
              },
            ],
          };
        });
      },
      
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },
      
      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.productId !== productId) return item;
            const maxStock = item.stock || 999;
            const clamped = Math.min(Math.max(1, quantity), maxStock);
            return { ...item, quantity: clamped };
          }),
        }));
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'fafe-cart-storage',
    }
  )
);
