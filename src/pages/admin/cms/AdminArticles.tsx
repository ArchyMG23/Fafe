import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Article } from '../../../types';
import { Link, useNavigate } from 'react-router-dom';
import { AdminPageHeader } from '../../../components/admin/AdminPageHeader';
import { DataTable, Column } from '../../../components/admin/DataTable';
import { Button } from '../../../components/ui/Button';
import { Plus, Edit } from 'lucide-react';

export function AdminArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
        setArticles(fetched);
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const filteredArticles = articles.filter(a => {
    const searchMatch = a.title.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = statusFilter ? a.status === statusFilter : true;
    return searchMatch && statusMatch;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PUBLISHED': return 'bg-green-100 text-green-800';
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
      case 'ARCHIVED': return 'bg-stone-100 text-stone-800';
      default: return 'bg-stone-100 text-stone-800';
    }
  };

  const columns: Column<Article>[] = [
    {
      header: 'Titre',
      accessor: (a) => (
        <div>
          <div className="font-bold text-[#6B3E1E] max-w-sm truncate">{a.title}</div>
          <div className="text-xs text-stone-500 truncate">{a.slug}</div>
        </div>
      )
    },
    {
      header: 'Auteur',
      accessor: (a) => <span className="text-stone-600 text-sm">{a.authorName || 'Admin'}</span>
    },
    {
      header: 'Statut',
      accessor: (a) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(a.status)}`}>
          {a.status === 'PUBLISHED' ? 'Publié' : a.status === 'DRAFT' ? 'Brouillon' : 'Archivé'}
        </span>
      )
    },
    {
      header: 'Date',
      accessor: (a) => (
        <span className="text-stone-600 text-sm">
          {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString('fr-FR') : '-'}
        </span>
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (a) => (
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-[#E67E22] hover:text-[#c96a1a] hover:bg-orange-50"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/admin/contenus/articles/${a.id}`);
          }}
        >
          <Edit className="w-4 h-4 mr-2" /> Éditer
        </Button>
      )
    }
  ];

  const filters = (
    <select 
      className="h-10 px-3 rounded-md border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E67E22]"
      value={statusFilter}
      onChange={e => setStatusFilter(e.target.value)}
    >
      <option value="">Tous les statuts</option>
      <option value="PUBLISHED">Publié</option>
      <option value="DRAFT">Brouillon</option>
      <option value="ARCHIVED">Archivé</option>
    </select>
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Articles & Actualités"
        description="Gérez les publications du blog public."
        action={
          <Button onClick={() => navigate('/admin/contenus/articles/nouveau')} className="bg-[#E67E22] hover:bg-[#c96a1a] text-white">
            <Plus className="w-4 h-4 mr-2" /> Créer un article
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={filteredArticles}
        loading={loading}
        keyExtractor={(a) => a.id}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Rechercher par titre..."
        filters={filters}
        emptyMessage="Aucun article trouvé."
        onRowClick={(a) => navigate(`/admin/contenus/articles/${a.id}`)}
      />
    </div>
  );
}
