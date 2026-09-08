import { collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, MarketplaceCategory } from '../types';
import { initialMarketplaceProducts, initialMarketplaceCategories } from '../lib/marketplaceData';

const LOCAL_PRODUCTS_KEY = 'fafe_marketplace_products_v1';
const LOCAL_CATEGORIES_KEY = 'fafe_marketplace_categories_v1';

// Helper to normalize product properties defensibly
export function normalizeProduct(raw: Partial<Product> & { id: string }): Product {
  const images = Array.isArray(raw.images) && raw.images.length > 0 
    ? raw.images 
    : ['https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=1000&q=80'];

  return {
    id: raw.id,
    name: raw.name || 'Produit Artisanal',
    slug: raw.slug || generateSlug(raw.name || 'produit'),
    shortDescription: raw.shortDescription || '',
    fullDescription: raw.fullDescription || raw.shortDescription || '',
    price: typeof raw.price === 'number' ? raw.price : Number(raw.price) || 0,
    promotionalPrice: raw.promotionalPrice ? Number(raw.promotionalPrice) : undefined,
    currency: raw.currency || 'XAF',
    images,
    categoryId: raw.categoryId || 'artisanat-deco',
    stock: typeof raw.stock === 'number' ? Math.max(0, raw.stock) : Math.max(0, Number(raw.stock) || 0),
    status: raw.status || 'PUBLISHED',
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

class MarketplaceService {
  // Retrieve saved local products (including admin-created products)
  private getLocalProducts(): Product[] {
    try {
      const stored = localStorage.getItem(LOCAL_PRODUCTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(normalizeProduct);
        }
      }
    } catch {
      // Fallback
    }
    return initialMarketplaceProducts.map(normalizeProduct);
  }

  // Save local products cache
  private saveLocalProducts(products: Product[]): void {
    try {
      localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
    } catch {
      // Ignore quota errors
    }
  }

  // Retrieve saved local categories
  private getLocalCategories(): MarketplaceCategory[] {
    try {
      const stored = localStorage.getItem(LOCAL_CATEGORIES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return initialMarketplaceCategories;
  }

  private saveLocalCategories(categories: MarketplaceCategory[]): void {
    try {
      localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(categories));
    } catch {
      // Ignore
    }
  }

  // Fetch all published products for public catalog
  async getProducts(): Promise<Product[]> {
    try {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const fetched: Product[] = [];
        snapshot.forEach(docSnap => {
          fetched.push(normalizeProduct({ id: docSnap.id, ...docSnap.data() } as Product));
        });
        // Merge with local newly created products if any
        const localList = this.getLocalProducts();
        const mergedMap = new Map<string, Product>();
        fetched.forEach(p => mergedMap.set(p.id, p));
        localList.forEach(p => {
          if (!mergedMap.has(p.id)) {
            mergedMap.set(p.id, p);
          }
        });
        const merged = Array.from(mergedMap.values());
        this.saveLocalProducts(merged);
        return merged;
      }
    } catch {
      // Firestore unreachable: fallback gracefully to local repository
    }
    return this.getLocalProducts();
  }

  // Fetch single product by slug
  async getProductBySlug(slug: string): Promise<Product | null> {
    const cleanSlug = slug.trim().toLowerCase();
    try {
      const products = await this.getProducts();
      const found = products.find(p => p.slug.toLowerCase() === cleanSlug || p.id === cleanSlug);
      return found || null;
    } catch {
      const localProducts = this.getLocalProducts();
      return localProducts.find(p => p.slug.toLowerCase() === cleanSlug || p.id === cleanSlug) || null;
    }
  }

  // Fetch single product by ID
  async getProductById(id: string): Promise<Product | null> {
    try {
      const docRef = doc(db, 'products', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return normalizeProduct({ id: snap.id, ...snap.data() } as Product);
      }
    } catch {
      // Fallback
    }
    const local = this.getLocalProducts();
    return local.find(p => p.id === id) || null;
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
        this.saveLocalCategories(fetched);
        return fetched;
      }
    } catch {
      // Fallback
    }
    return this.getLocalCategories();
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

    // Update local cache immediately so it's always responsive
    const currentLocal = this.getLocalProducts();
    const existingIndex = currentLocal.findIndex(p => p.id === id);
    if (existingIndex >= 0) {
      currentLocal[existingIndex] = normalized;
    } else {
      currentLocal.unshift(normalized);
    }
    this.saveLocalProducts(currentLocal);

    // Try persisting to Firestore
    try {
      const docRef = doc(db, 'products', id);
      await setDoc(docRef, normalized, { merge: true });
    } catch (err) {
      console.warn('Could not sync product with Firestore, cached locally:', err);
    }

    return normalized;
  }

  // Admin: Delete Product
  async deleteProduct(id: string): Promise<void> {
    const current = this.getLocalProducts().filter(p => p.id !== id);
    this.saveLocalProducts(current);

    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (err) {
      console.warn('Could not delete product from Firestore:', err);
    }
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

    const categories = this.getLocalCategories();
    const idx = categories.findIndex(c => c.id === id);
    if (idx >= 0) {
      categories[idx] = fullCat;
    } else {
      categories.push(fullCat);
    }
    this.saveLocalCategories(categories);

    try {
      await setDoc(doc(db, 'marketplace_categories', id), fullCat, { merge: true });
    } catch (err) {
      console.warn('Could not sync category to Firestore:', err);
    }

    return fullCat;
  }

  // Admin: Delete Category
  async deleteCategory(id: string): Promise<void> {
    const current = this.getLocalCategories().filter(c => c.id !== id);
    this.saveLocalCategories(current);

    try {
      await deleteDoc(doc(db, 'marketplace_categories', id));
    } catch (err) {
      console.warn('Could not delete category from Firestore:', err);
    }
  }

  // Stock update with safety clamp (never negative)
  async updateStock(productId: string, quantityChange: number): Promise<number> {
    const products = this.getLocalProducts();
    const product = products.find(p => p.id === productId);
    if (!product) return 0;

    const newStock = Math.max(0, product.stock + quantityChange);
    product.stock = newStock;
    if (newStock === 0) {
      product.status = 'OUT_OF_STOCK';
    }
    product.updatedAt = Date.now();
    this.saveLocalProducts(products);

    try {
      const docRef = doc(db, 'products', productId);
      await updateDoc(docRef, {
        stock: newStock,
        status: product.status,
        updatedAt: Date.now()
      });
    } catch {
      // Ignored if offline
    }

    return newStock;
  }
}

export const marketplaceService = new MarketplaceService();
