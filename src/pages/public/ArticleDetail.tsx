import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Article, Category } from '../../types';
import { fetchArticles } from '../../lib/dataFetching';
import { Loader2, Calendar, User, Clock, ArrowLeft, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';
import { FafeImage } from '../../components/ui/FafeImage';
import ReactMarkdown from 'react-markdown';

export function ArticleDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [categoryName, setCategoryName] = useState('Actualité');
  const [related, setRelated] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const allArticles = await fetchArticles();
        const data = allArticles.find(a => a.slug === slug || a.id === slug);
        if (!data) {
          setLoading(false);
          return;
        }

        // If not published and we are just a guest, we shouldn't see it
        // The firestore rules already block this unless we are admin
        setArticle(data);

        // Fetch category
        if (data.categoryId) {
          const catQ = query(collection(db, 'categories'), where('__name__', '==', data.categoryId));
          const catSnap = await getDocs(catQ);
          if (!catSnap.empty) {
            setCategoryName(catSnap.docs[0].data().name);
          }
        }

        // Fetch related
        const relQ = query(collection(db, 'articles'), where('status', '==', 'PUBLISHED'), orderBy('publishedAt', 'desc'), limit(4));
        const relSnap = await getDocs(relQ);
        const relArticles = relSnap.docs
          .map(d => ({ id: d.id, ...d.data() } as Article))
          .filter(a => a.id !== data.id)
          .slice(0, 3);
        setRelated(relArticles);

      } catch (error) {
        console.error("Error fetching article", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchArticle();
  }, [slug]);

  const calculateReadingTime = (text: string) => {
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = encodeURIComponent(article?.title || 'FAFE Actualités');
    if (platform === 'facebook') window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    if (platform === 'twitter') window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
    if (platform === 'linkedin') window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${text}`, '_blank');
  };

  if (loading) return <div className="min-h-[70vh] flex justify-center items-center"><Loader2 className="w-10 h-10 animate-spin text-[#E67E22]" /></div>;
  
  if (!article) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#FAF9F6] p-4 text-center">
      <h1 className="text-3xl font-bold font-heading text-[#6B3E1E] mb-4">Article introuvable</h1>
      <p className="text-stone-500 mb-8">Cet article n'existe pas ou n'est plus disponible.</p>
      <Button onClick={() => navigate('/actualites')} className="bg-[#E67E22] text-white">Retour aux actualités</Button>
    </div>
  );

  return (
    <div className="bg-[#FAF9F6] min-h-screen pt-12 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        
        <Link to="/actualites" className="inline-flex items-center text-sm font-bold text-stone-500 hover:text-[#E67E22] mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour aux actualités
        </Link>

        {/* Header */}
        <header className="mb-12 text-center md:text-left">
          <span className="inline-block px-3 py-1 bg-[#E67E22]/10 text-[#E67E22] text-xs font-bold uppercase tracking-wider rounded-full mb-4">
            {categoryName}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold font-heading text-[#6B3E1E] mb-6 leading-tight">
            {article.title}
          </h1>
          <p className="text-xl text-stone-600 mb-8 italic">
            {article.excerpt}
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm text-stone-500 font-medium">
            <div className="flex items-center gap-2"><User className="w-4 h-4" /> {article.authorName || 'FAFE Team'}</div>
            <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {new Date(article.publishedAt || article.createdAt).toLocaleDateString('fr-FR')}</div>
            <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {calculateReadingTime(article.content)} min de lecture</div>
          </div>
        </header>

        {/* Featured Image */}
        {article.featuredImage && (
          <div className="w-full h-[40vh] md:h-[60vh] rounded-2xl overflow-hidden mb-12 shadow-lg">
            <FafeImage src={article.featuredImage} alt={article.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Content */}
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-stone-200 mb-12">
          <div className="prose prose-stone prose-orange lg:prose-lg max-w-none">
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </div>
        </div>

        {/* Footer / Tags / Share */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 py-6 border-t border-stone-200 mb-16">
          <div className="flex flex-wrap gap-2">
            {article.tags?.map(tag => (
              <Link key={tag} to={`/actualites/tag/${tag}`} className="px-3 py-1 bg-stone-100 text-stone-600 text-xs font-bold rounded-full hover:bg-stone-200">
                #{tag}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-stone-500">Partager :</span>
            <button onClick={() => handleShare('facebook')} className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-[#1877F2] hover:text-white transition-colors"><Facebook className="w-4 h-4" /></button>
            <button onClick={() => handleShare('twitter')} className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-[#1DA1F2] hover:text-white transition-colors"><Twitter className="w-4 h-4" /></button>
            <button onClick={() => handleShare('linkedin')} className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-[#0A66C2] hover:text-white transition-colors"><Linkedin className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold font-heading text-[#6B3E1E] mb-6">À découvrir également</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map(rel => (
                <Link key={rel.id} to={`/actualites/${rel.slug}`} className="group bg-white rounded-xl overflow-hidden border border-stone-200 hover:shadow-lg transition-all">
                  <div className="h-32 bg-stone-100 overflow-hidden">
                    {rel.featuredImage && <FafeImage src={rel.featuredImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />}
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-[#6B3E1E] mb-2 line-clamp-2 group-hover:text-[#E67E22]">{rel.title}</h4>
                    <p className="text-xs text-stone-500">{new Date(rel.publishedAt || rel.createdAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Temporary Button definition for fallback error state
function Button({ children, className, onClick }: any) {
  return <button onClick={onClick} className={`px-4 py-2 rounded-md font-bold ${className}`}>{children}</button>;
}
