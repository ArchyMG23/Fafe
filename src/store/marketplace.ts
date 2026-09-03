import { create } from 'zustand';
import { Product, MarketplaceCategory } from '../types';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

interface MarketplaceState {
  products: Product[];
  categories: MarketplaceCategory[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
  isLoaded: boolean;
  setCache: (products: Product[], categories: MarketplaceCategory[], lastDoc: QueryDocumentSnapshot<DocumentData> | null, hasMore: boolean) => void;
  appendProducts: (products: Product[], lastDoc: QueryDocumentSnapshot<DocumentData> | null, hasMore: boolean) => void;
}

export const useMarketplaceStore = create<MarketplaceState>((set) => ({
  products: [],
  categories: [],
  lastDoc: null,
  hasMore: true,
  isLoaded: false,
  setCache: (products, categories, lastDoc, hasMore) => set({ products, categories, lastDoc, hasMore, isLoaded: true }),
  appendProducts: (newProducts, lastDoc, hasMore) => set((state) => {
    const existingIds = new Set(state.products.map(p => p.id));
    const filtered = newProducts.filter(p => !existingIds.has(p.id));
    return {
      products: [...state.products, ...filtered],
      lastDoc,
      hasMore
    };
  })
}));
