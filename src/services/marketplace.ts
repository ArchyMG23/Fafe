import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, MarketplaceCategory, ProductStatus } from '../types';
import { initialMarketplaceProducts, initialMarketplaceCategories } from '../lib/marketplaceData';

const LOCAL_PRODUCTS_CACHE = 'fafe_marketplace_products_cache_v2';
const LOCAL_CATEGORIES_CACHE = 'fafe_marketplace_categories_cache_v2';

// Helper to normalize product properties defensively
export function normalizeProduct(raw: Partial<Product> & { id: string }): Product {
  const images = Array.isArray(raw.images) && raw.images.length > 0 
    ? raw.images 
    : ['https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=1000&q=80'];

  const stock = typeof raw.stock === 'number' ? Math.max(0, raw.stock) : Math.max(0, Number(raw.stock) || 0);
  const status: ProductStatus = raw.status || (stock === 0 ? 'OUT_OF_STOCK' : 'PUBLISHED');

  return {
    id: raw.id,
    name: raw.name || 'Produit Artisanal',
    slug: raw.slug || generateSlug(raw.name || 'produit'),
    sku: raw.sku ? String(raw.sku).trim() : undefined,
    shortDescription: raw.shortDescription || '',
    fullDescription: raw.fullDescription || raw.shortDescription || '',
    price: typeof raw.price === 'number' ? raw.price : Number(raw.price) || 0,
    promotionalPrice: raw.promotionalPrice ? Number(raw.promotionalPrice) : undefined,
    currency: raw.currency || 'XAF',
    images,
    categoryId: raw.categoryId || 'artisanat-deco',
    stock,
    status,
    isFeatured: Boolean(raw.isFeatured),
    createdAt: raw.createdAt || Date.now(),
    updatedAt: raw.updatedAt || Date.now()
  };
}

// Generate clean, SEO-friendly Unicode-normalized slug
export function generateSlug(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric with hyphen
    .replace(/^-+|-+$/g, '') // strip leading/trailing hyphens
    || 'produit';
}

function notifyMarketplaceUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('fafe_marketplace_updated'));
  }
}

class MarketplaceService {
  private productsCache: Product[] | null = null;
  private categoriesCache: MarketplaceCategory[] | null = null;

  // Retrieve cached products if offline
  private getCachedProducts(): Product[] {
    if (this.productsCache && this.productsCache.length > 0) {
      return this.productsCache;
    }
    try {
      const stored = localStorage.getItem(LOCAL_PRODUCTS_CACHE);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.productsCache = parsed.map(normalizeProduct);
          return this.productsCache;
        }
      }
    } catch {
      // Fallback
    }
    return [];
  }

  private setCachedProducts(products: Product[]): void {
    this.productsCache = products;
    try {
      localStorage.setItem(LOCAL_PRODUCTS_CACHE, JSON.stringify(products));
    } catch {
      // Ignore quota errors
    }
  }

  private getCachedCategories(): MarketplaceCategory[] {
    if (this.categoriesCache && this.categoriesCache.length > 0) {
      return this.categoriesCache;
    }
    try {
      const stored = localStorage.getItem(LOCAL_CATEGORIES_CACHE);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.categoriesCache = parsed;
          return this.categoriesCache;
        }
      }
    } catch {
      // Fallback
    }
    return [];
  }

  private setCachedCategories(categories: MarketplaceCategory[]): void {
    this.categoriesCache = categories;
    try {
      localStorage.setItem(LOCAL_CATEGORIES_CACHE, JSON.stringify(categories));
    } catch {
      // Ignore
    }
  }

  // Seed default demonstration catalog to Firestore if collection is empty
  async seedInitialCatalogIfEmpty(): Promise<Product[]> {
    try {
      const prodsColl = collection(db, 'products');
      const catsColl = collection(db, 'marketplace_categories');

      const [prodsSnap, catsSnap] = await Promise.all([
        getDocs(prodsColl),
        getDocs(catsColl)
      ]);

      // Seed categories if empty
      if (catsSnap.empty) {
        for (const cat of initialMarketplaceCategories) {
          await setDoc(doc(db, 'marketplace_categories', cat.id), cat, { merge: true });
        }
      }

      // Seed products if empty
      if (prodsSnap.empty) {
        const seeded: Product[] = [];
        for (const prod of initialMarketplaceProducts) {
          const normalized = normalizeProduct(prod);
          await setDoc(doc(db, 'products', normalized.id), normalized, { merge: true });
          seeded.push(normalized);
        }
        this.setCachedProducts(seeded);
        return seeded;
      }
    } catch (err) {
      console.warn('Could not seed initial catalog into Firestore:', err);
    }
    return [];
  }

  // Fetch all products with Firestore as authorative source of truth
  async getProducts(options?: { includeAllStatus?: boolean }): Promise<Product[]> {
    const includeAll = Boolean(options?.includeAllStatus);

    try {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const fetched: Product[] = [];
        snapshot.forEach(docSnap => {
          fetched.push(normalizeProduct({ id: docSnap.id, ...docSnap.data() } as Product));
        });

        this.setCachedProducts(fetched);

        if (!includeAll) {
          return fetched.filter(p => p.status === 'PUBLISHED');
        }
        return fetched;
      } else {
        // If Firestore is completely empty, bootstrap it once
        const seeded = await this.seedInitialCatalogIfEmpty();
        if (seeded.length > 0) {
          if (!includeAll) {
            return seeded.filter(p => p.status === 'PUBLISHED');
          }
          return seeded;
        }
      }
    } catch (error) {
      console.warn('Firestore products fetch error, using cache:', error);
    }

    const cached = this.getCachedProducts();
    if (!includeAll) {
      return cached.filter(p => p.status === 'PUBLISHED');
    }
    return cached;
  }

  // Fetch single product by slug or id
  async getProductBySlug(slug: string, options?: { includeAllStatus?: boolean }): Promise<Product | null> {
    const cleanSlug = slug.trim().toLowerCase();
    const all = await this.getProducts({ includeAllStatus: true });
    const found = all.find(p => p.slug.toLowerCase() === cleanSlug || p.id === cleanSlug) || null;

    if (!found) return null;
    if (!options?.includeAllStatus && found.status !== 'PUBLISHED') {
      return null;
    }
    return found;
  }

  // Fetch single product by ID directly
  async getProductById(id: string): Promise<Product | null> {
    try {
      const docRef = doc(db, 'products', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return normalizeProduct({ id: snap.id, ...snap.data() } as Product);
      }
    } catch {
      // Fallback to cache
    }
    const cached = this.getCachedProducts();
    return cached.find(p => p.id === id) || null;
  }

  // Fetch all categories
  async getCategories(): Promise<MarketplaceCategory[]> {
    try {
      const q = query(collection(db, 'marketplace_categories'), orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const fetched: MarketplaceCategory[] = [];
        snapshot.forEach(docSnap => {
          fetched.push({ id: docSnap.id, ...docSnap.data() } as MarketplaceCategory);
        });
        this.setCachedCategories(fetched);
        return fetched;
      } else {
        await this.seedInitialCatalogIfEmpty();
        const secondSnap = await getDocs(q);
        if (!secondSnap.empty) {
          const list: MarketplaceCategory[] = [];
          secondSnap.forEach(d => list.push({ id: d.id, ...d.data() } as MarketplaceCategory));
          this.setCachedCategories(list);
          return list;
        }
      }
    } catch (err) {
      console.warn('Firestore categories fetch error, using cache:', err);
    }
    return this.getCachedCategories();
  }

  // Admin: Save or Update Product
  async saveProduct(productData: Partial<Product>): Promise<Product> {
    const id = productData.id || `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const slug = productData.slug || generateSlug(productData.name || 'produit');
    const normalized = normalizeProduct({
      ...productData,
      id,
      slug,
      updatedAt: Date.now(),
      createdAt: productData.createdAt || Date.now()
    });

    // 1. Write to Firestore (Throws if fails)
    const docRef = doc(db, 'products', id);
    await setDoc(docRef, normalized, { merge: true });

    // 2. Update local cache
    const currentLocal = this.getCachedProducts();
    const existingIndex = currentLocal.findIndex(p => p.id === id);
    if (existingIndex >= 0) {
      currentLocal[existingIndex] = normalized;
    } else {
      currentLocal.unshift(normalized);
    }
    this.setCachedProducts(currentLocal);

    // 3. Notify app components
    notifyMarketplaceUpdated();

    return normalized;
  }

  // Admin: Delete Product
  async deleteProduct(id: string): Promise<void> {
    // 1. Delete from Firestore
    const docRef = doc(db, 'products', id);
    await deleteDoc(docRef);

    // 2. Remove from cache
    const current = this.getCachedProducts().filter(p => p.id !== id);
    this.setCachedProducts(current);

    // 3. Notify app components
    notifyMarketplaceUpdated();
  }

  // Admin: Save Category
  async saveCategory(catData: Partial<MarketplaceCategory>): Promise<MarketplaceCategory> {
    const id = catData.id || `cat-${Date.now()}`;
    const slug = catData.slug || generateSlug(catData.name || 'categorie');
    const fullCat: MarketplaceCategory = {
      id,
      name: catData.name || 'Nouvelle catégorie',
      slug,
      description: catData.description || '',
      image: catData.image,
      isActive: catData.isActive !== false,
      order: catData.order || 0,
      createdAt: catData.createdAt || Date.now(),
      updatedAt: Date.now()
    };

    // 1. Write to Firestore
    const docRef = doc(db, 'marketplace_categories', id);
    await setDoc(docRef, fullCat, { merge: true });

    // 2. Update cache
    const categories = this.getCachedCategories();
    const idx = categories.findIndex(c => c.id === id);
    if (idx >= 0) {
      categories[idx] = fullCat;
    } else {
      categories.push(fullCat);
    }
    this.setCachedCategories(categories);

    // 3. Notify
    notifyMarketplaceUpdated();

    return fullCat;
  }

  // Admin: Delete Category
  async deleteCategory(id: string): Promise<void> {
    const docRef = doc(db, 'marketplace_categories', id);
    await deleteDoc(docRef);

    const current = this.getCachedCategories().filter(c => c.id !== id);
    this.setCachedCategories(current);

    notifyMarketplaceUpdated();
  }

  // Stock update with safety clamp (never negative)
  async updateStock(productId: string, quantityChange: number): Promise<number> {
    const product = await this.getProductById(productId);
    if (!product) {
      throw new Error(`Produit introuvable (ID: ${productId})`);
    }

    const newStock = Math.max(0, product.stock + quantityChange);
    const newStatus: ProductStatus = newStock === 0 ? 'OUT_OF_STOCK' : (product.status === 'OUT_OF_STOCK' ? 'PUBLISHED' : product.status);

    const docRef = doc(db, 'products', productId);
    await updateDoc(docRef, {
      stock: newStock,
      status: newStatus,
      updatedAt: Date.now()
    });

    // Update local cache
    const cached = this.getCachedProducts();
    const target = cached.find(p => p.id === productId);
    if (target) {
      target.stock = newStock;
      target.status = newStatus;
      target.updatedAt = Date.now();
      this.setCachedProducts(cached);
    }

    notifyMarketplaceUpdated();

    return newStock;
  }

  // Set explicit stock amount directly
  async setExactStock(productId: string, exactStock: number): Promise<number> {
    const product = await this.getProductById(productId);
    if (!product) {
      throw new Error(`Produit introuvable (ID: ${productId})`);
    }

    const cleanStock = Math.max(0, Math.floor(exactStock));
    const newStatus: ProductStatus = cleanStock === 0 ? 'OUT_OF_STOCK' : (product.status === 'OUT_OF_STOCK' ? 'PUBLISHED' : product.status);

    const docRef = doc(db, 'products', productId);
    await updateDoc(docRef, {
      stock: cleanStock,
      status: newStatus,
      updatedAt: Date.now()
    });

    const cached = this.getCachedProducts();
    const target = cached.find(p => p.id === productId);
    if (target) {
      target.stock = cleanStock;
      target.status = newStatus;
      target.updatedAt = Date.now();
      this.setCachedProducts(cached);
    }

    notifyMarketplaceUpdated();

    return cleanStock;
  }
}

export const marketplaceService = new MarketplaceService();
