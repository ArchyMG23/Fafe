const fs = require('fs');
let code = fs.readFileSync('src/pages/public/marketplace/MarketplaceHome.tsx', 'utf8');

const regex = /export function MarketplaceHome\(\) \{[\s\S]*?const filteredProducts =/;
const replacement = `export function MarketplaceHome() {
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
      
      const cats = [];
      categoriesSnap.forEach(doc => cats.push({ id: doc.id, ...doc.data() }));

      // Fetch Initial Products
      const productsRef = collection(db, 'products');
      const productsQuery = query(
        productsRef, 
        where('status', 'in', ['PUBLISHED', 'OUT_OF_STOCK']), 
        orderBy('createdAt', 'desc'),
        limit(PRODUCTS_PER_PAGE)
      );
      const productsSnap = await getDocs(productsQuery);
      
      const prods = [];
      productsSnap.forEach(doc => prods.push({ id: doc.id, ...doc.data() }));
      
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
      const prods = [];
      productsSnap.forEach(doc => prods.push({ id: doc.id, ...doc.data() }));
      
      const lastVisible = productsSnap.docs[productsSnap.docs.length - 1] || null;
      appendProducts(prods, lastVisible, prods.length === PRODUCTS_PER_PAGE);
    } catch (error) {
      console.error('Error loading more products:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const filteredProducts =`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/pages/public/marketplace/MarketplaceHome.tsx', code);
