import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Article, Category } from '../../types';
import { fetchArticles } from '../../lib/dataFetching';
import { Link, useParams } from 'react-router-dom';
import { Loader2, Calendar, User, ArrowRight, Tag } from 'lucide-react';
import { FafeImage } from '../../components/ui/FafeImage';

export function News() {
  const { slug } = useParams(); // Can be category slug or tag slug if we differentiate routes, but for now let's just handle it basically
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // If we had a specific category ID, we would query by it.
  // For now, we'll fetch all published and filter client-side if needed for simplicity, 
  // or fetch categories to match the slug.
  
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const catSnap = await getDocs(collection(db, 'categories'));
        const cats = catSnap.docs.map(d => ({ id: d.id, ...d.data() } as Category));
        setCategories(cats);

        let fetched = await fetchArticles();

        if (slug) {
          // If slug matches a category, filter by categoryId
          const cat = cats.find(c => c.slug === slug);
          if (cat) {
            fetched = fetched.filter(a => a.categoryId === cat.id);
          } else {
            // Assume it's a tag filter
            fetched = fetched.filter(a => a.tags?.includes(slug));
          }
        }

        setArticles(fetched);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [slug]);

  const getCategoryName = (id: string) => {
    return categories.find(c => c.id === id)?.name || 'Actualité';
  };

  return (
    <div className="bg-[#FAF9F6] min-h-screen pt-12 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-heading text-[#6B3E1E] mb-4">
            Actualités & Ressources
          </h1>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            Découvrez nos dernières actualités, reportages, et histoires inspirantes de femmes entrepreneures.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          <Link to="/actualites" className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${!slug ? 'bg-[#E67E22] text-white' : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'}`}>
            Tout
          </Link>
          {categories.filter(c => c.status === 'ACTIVE').map(cat => (
            <Link key={cat.id} to={`/actualites/categorie/${cat.slug}`} className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${slug === cat.slug ? 'bg-[#E67E22] text-white' : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'}`}>
              {cat.name}
            </Link>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center p-20">
            <Loader2 className="w-10 h-10 animate-spin text-[#E67E22]" />
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center p-20 bg-white rounded-2xl border border-stone-200">
            <p className="text-stone-500 text-lg">Aucun article publié pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map(article => (
              <Link key={article.id} to={`/actualites/${article.slug}`} className="group bg-white rounded-2xl overflow-hidden border border-stone-200 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                <div className="relative h-48 overflow-hidden bg-stone-100">
                  {article.featuredImage ? (
                    <FafeImage src={article.featuredImage} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300">Sans image</div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-[#E67E22] text-xs font-bold uppercase tracking-wider rounded-full">
                      {getCategoryName(article.categoryId)}
                    </span>
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold font-heading text-[#6B3E1E] mb-3 group-hover:text-[#E67E22] transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-stone-600 text-sm mb-4 line-clamp-3 flex-grow">
                    {article.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-stone-100">
                    <div className="flex items-center text-xs text-stone-500 gap-4">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(article.publishedAt || article.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <span className="text-[#E67E22] group-hover:translate-x-1 transition-transform">
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
