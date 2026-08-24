const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/Home.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// I will just replace the top of the file up to export function Home() {
// and fix the DynamicNews definition.

const newTop = `import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Entrepreneur, Article, Project } from '../types';
import { ArrowRight, Globe2, Briefcase, TrendingUp, Calendar, Heart, MapPin } from 'lucide-react';
import { DEMO_ENTREPRENEURS, DEMO_ARTICLES, DEMO_PROJECTS } from '../lib/mockData';

function DynamicNews() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const q = query(collection(db, 'articles'), where('status', '==', 'PUBLISHED'), orderBy('publishedAt', 'desc'), limit(3));
        const snap = await getDocs(q);
        setArticles(snap.docs.map(d => ({ id: d.id, ...d.data() } as Article)));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  if (loading) return <div className="text-center py-20"><div className="w-8 h-8 border-4 border-[#E67E22] border-t-transparent rounded-full animate-spin mx-auto"></div></div>;

  if (articles.length === 0) return (
    <div className="text-center text-stone-500 py-12">
      <p>Aucune actualité publiée pour le moment.</p>
    </div>
  );

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {articles.map(article => (
        <Link key={article.id} to={\`/actualites/\${article.slug}\`} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
          <div className="h-48 overflow-hidden bg-stone-100 relative">
            {article.featuredImage ? (
              <img src={article.featuredImage} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-300">Sans image</div>
            )}
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold font-heading text-[#6B3E1E] mb-3 group-hover:text-[#E67E22] transition-colors line-clamp-2">
              {article.title}
            </h3>
            <p className="text-stone-600 mb-4 line-clamp-2 text-sm">{article.excerpt}</p>
            <span className="text-[#E67E22] font-bold text-sm flex items-center group-hover:gap-2 transition-all">
              Lire l'article <ArrowRight className="w-4 h-4 ml-1" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
`;

const homeStart = content.indexOf('export function Home() {');
content = newTop + '\n' + content.substring(homeStart);

fs.writeFileSync(filePath, content);
console.log("Home fixed");
