const fs = require('fs');
let code = fs.readFileSync('src/pages/public/marketplace/MarketplaceHome.tsx', 'utf8');

// 1. Add imports for limit, startAfter, and the store
code = code.replace(
  "import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';",
  "import { collection, query, where, getDocs, orderBy, limit, startAfter, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';\nimport { useMarketplaceStore } from '../../../store/marketplace';"
);

// 2. Replace state with Zustand store
code = code.replace(
  `export function MarketplaceHome() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    fetchMarketplaceData();
  }, []);

  const fetchMarketplaceData = async () => {
    try {
      setLoading(true);

      // Fetch Categories
      const categoriesRef = collection(db, 'marketplace_categories');
      const categoriesQuery = query(categoriesRef, where('isActive', '==', true), orderBy('order', 'asc'));
      const categoriesSnap = await getDocs(categoriesQuery);
      
      const cats: MarketplaceCategory[] = [];
      categoriesSnap.forEach(doc => cats.push({ id: doc.id, ...doc.data() } as MarketplaceCategory));
      setCategories(cats);

      // Fetch Products
      const productsRef = collection(db, 'products');
      const productsQuery = query(productsRef, where('status', 'in', ['PUBLISHED', 'OUT_OF_STOCK']), orderBy('createdAt', 'desc'));
      const productsSnap = await getDocs(productsQuery);
      
      const prods: Product[] = [];
      productsSnap.forEach(doc => prods.push({ id: doc.id, ...doc.data() } as Product));
      setProducts(prods);
    } catch (error) {
      console.error('Error fetching marketplace data:', error);
    } finally {
      setLoading(false);
    }
  };`,
  `export function MarketplaceHome() {
  const { products, categories, lastDoc, hasMore, isLoaded, setCache, appendProducts } = useMarketplaceStore();
  const [loading, setLoading] = useState(!isLoaded);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const addItem = useCartStore(state => state.addItem);

  const PRODUCTS_PER_PAGE = 12;

  useEffect(() => {
    if (!isLoaded) {
      fetchMarketplaceData();
    }
  }, [isLoaded]);

  const fetchMarketplaceData = async () => {
    try {
      setLoading(true);

      // Fetch Categories
      const categoriesRef = collection(db, 'marketplace_categories');
      const categoriesQuery = query(categoriesRef, where('isActive', '==', true), orderBy('order', 'asc'));
      const categoriesSnap = await getDocs(categoriesQuery);
      
      const cats: MarketplaceCategory[] = [];
      categoriesSnap.forEach(doc => cats.push({ id: doc.id, ...doc.data() } as MarketplaceCategory));

      // Fetch Initial Products
      const productsRef = collection(db, 'products');
      const productsQuery = query(
        productsRef, 
        where('status', 'in', ['PUBLISHED', 'OUT_OF_STOCK']), 
        orderBy('createdAt', 'desc'),
        limit(PRODUCTS_PER_PAGE)
      );
      const productsSnap = await getDocs(productsQuery);
      
      const prods: Product[] = [];
      productsSnap.forEach(doc => prods.push({ id: doc.id, ...doc.data() } as Product));
      
      const lastVisible = productsSnap.docs[productsSnap.docs.length - 1] || null;
      setCache(prods, cats, lastVisible, prods.length === PRODUCTS_PER_PAGE);
    } catch (error) {
      console.error('Error fetching marketplace data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreProducts = async () => {
    if (!lastDoc || loadingMore) return;
    try {
      setLoadingMore(true);
      const productsRef = collection(db, 'products');
      const productsQuery = query(
        productsRef, 
        where('status', 'in', ['PUBLISHED', 'OUT_OF_STOCK']), 
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(PRODUCTS_PER_PAGE)
      );
      
      const productsSnap = await getDocs(productsQuery);
      const prods: Product[] = [];
      productsSnap.forEach(doc => prods.push({ id: doc.id, ...doc.data() } as Product));
      
      const lastVisible = productsSnap.docs[productsSnap.docs.length - 1] || null;
      appendProducts(prods, lastVisible, prods.length === PRODUCTS_PER_PAGE);
    } catch (error) {
      console.error('Error loading more products:', error);
    } finally {
      setLoadingMore(false);
    }
  };`
);

// 3. Add the Load More button at the bottom of the grid
const loadMoreButton = `
              {filteredProducts.length === 0 ? (
`;
const newLoadMoreButton = `              {filteredProducts.length > 0 && hasMore && !searchTerm && !selectedCategory && (
                <div className="mt-8 flex justify-center">
                  <Button 
                    onClick={loadMoreProducts} 
                    disabled={loadingMore}
                    variant="outline"
                    className="border-[#E67E22] text-[#E67E22] hover:bg-[#E67E22]/10 px-8"
                  >
                    {loadingMore ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Chargement...</>
                    ) : (
                      'Afficher plus de produits'
                    )}
                  </Button>
                </div>
              )}
`;

code = code.replace(
  `                </div>
              )}
            </div>
          </div>
        )}
      </div>`,
  `                </div>
              )}
${newLoadMoreButton}
            </div>
          </div>
        )}
      </div>`
);

fs.writeFileSync('src/pages/public/marketplace/MarketplaceHome.tsx', code);
