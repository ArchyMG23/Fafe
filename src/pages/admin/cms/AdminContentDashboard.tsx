import { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Link } from 'react-router-dom';
import { FileText, Tags, MessageSquare, Image as ImageIcon, ArrowRight } from 'lucide-react';
import { AdminPageHeader } from '../../../components/admin/AdminPageHeader';

export function AdminContentDashboard() {
  const [stats, setStats] = useState({
    articles: 0,
    published: 0,
    drafts: 0,
    categories: 0,
    comments: 0,
    media: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const articlesSnap = await getDocs(collection(db, 'articles'));
        let pub = 0; let draft = 0;
        articlesSnap.forEach(doc => {
          if (doc.data().status === 'PUBLISHED') pub++;
          if (doc.data().status === 'DRAFT') draft++;
        });

        const catSnap = await getDocs(collection(db, 'categories'));
        const comSnap = await getDocs(collection(db, 'comments'));
        const medSnap = await getDocs(collection(db, 'media'));

        setStats({
          articles: articlesSnap.size,
          published: pub,
          drafts: draft,
          categories: catSnap.size,
          comments: comSnap.size,
          media: medSnap.size
        });
      } catch (error) {
        console.error("Error fetching CMS stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon, link, linkText }: any) => (
    <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-stone-100 rounded-lg text-stone-600">{icon}</div>
      </div>
      <h3 className="text-3xl font-bold text-[#6B3E1E] mb-1">{value}</h3>
      <p className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-4">{title}</p>
      <div className="mt-auto">
        <Link to={link} className="text-sm font-bold text-[#E67E22] hover:text-[#c96a1a] flex items-center gap-1">
          {linkText} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Système de Gestion de Contenu (CMS)"
        description="Gérez les articles, catégories et médias de la plateforme."
      />

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-[#E67E22] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Articles Publiés" 
            value={stats.published} 
            icon={<FileText className="w-6 h-6" />} 
            link="/admin/contenus/articles"
            linkText="Gérer les articles"
          />
          <StatCard 
            title="Catégories" 
            value={stats.categories} 
            icon={<Tags className="w-6 h-6" />} 
            link="/admin/contenus/categories"
            linkText="Gérer les catégories"
          />
          <StatCard 
            title="Médias & Galerie" 
            value={stats.media} 
            icon={<ImageIcon className="w-6 h-6" />} 
            link="/admin/contenus/medias"
            linkText="Médiathèque"
          />
          <StatCard 
            title="Commentaires" 
            value={stats.comments} 
            icon={<MessageSquare className="w-6 h-6" />} 
            link="/admin/commentaires"
            linkText="Modération"
          />
        </div>
      )}

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-[#6B3E1E] mb-4">Accès Rapide</h2>
        <div className="flex flex-wrap gap-4">
          <Link to="/admin/contenus/articles/nouveau" className="px-4 py-2 bg-[#E67E22] text-white rounded-md text-sm font-bold hover:bg-[#c96a1a] transition-colors">
            Rédiger un article
          </Link>
          <Link to="/admin/contenus/categories" className="px-4 py-2 border border-stone-200 text-stone-700 rounded-md text-sm font-bold hover:bg-stone-50 transition-colors">
            Ajouter une catégorie
          </Link>
        </div>
      </div>
    </div>
  );
}
