import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { UserProfile } from '../../types';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { DataTable, Column } from '../../components/admin/DataTable';
import { Button } from '../../components/ui/Button';
import { Edit } from 'lucide-react';

export function AdminMembers() {
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
        setMembers(fetched);
      } catch (error) {
        console.error("Error fetching members:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const countries = Array.from(new Set(members.map(m => m.country).filter(Boolean)));
  const statuses = Array.from(new Set(members.map(m => m.status).filter(Boolean)));

  const filteredMembers = members.filter(m => {
    const matchesSearch = 
      m.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      m.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCountry = countryFilter ? m.country === countryFilter : true;
    const matchesStatus = statusFilter ? m.status === statusFilter : true;

    return matchesSearch && matchesCountry && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-stone-100 text-stone-800';
      case 'SUSPENDED': return 'bg-red-100 text-red-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-stone-100 text-stone-800';
    }
  };

  const columns: Column<UserProfile>[] = [
    {
      header: 'Membre',
      accessor: (m) => (
        <div>
          <div className="font-bold text-stone-900">{m.firstName} {m.lastName}</div>
          <div className="text-xs text-stone-500">Inscrit le {new Date(m.createdAt).toLocaleDateString()}</div>
        </div>
      )
    },
    {
      header: 'Contact',
      accessor: (m) => (
        <div className="text-stone-600">
          <div>{m.email}</div>
          {m.phone && <div className="text-xs text-stone-400">{m.phone}</div>}
        </div>
      )
    },
    { header: 'Pays', accessor: (m) => m.country || '-' },
    {
      header: 'Rôle',
      accessor: (m) => (
        <span className="px-2.5 py-0.5 bg-stone-100 text-stone-700 text-[10px] uppercase font-bold rounded-full tracking-wider">
          {m.role}
        </span>
      )
    },
    {
      header: 'Statut',
      accessor: (m) => (
        <span className={`px-2.5 py-0.5 text-[10px] uppercase font-bold rounded-full tracking-wider ${getStatusColor(m.status || 'ACTIVE')}`}>
          {m.status || 'ACTIVE'}
        </span>
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (m) => (
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2 text-[#E67E22] hover:text-[#c96a1a] hover:bg-orange-50"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/admin/membres/${m.id}`);
          }}
        >
          <Edit className="w-4 h-4 mr-1" /> Gérer
        </Button>
      )
    }
  ];

  const filters = (
    <>
      <select 
        className="flex h-10 rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#E67E22]"
        value={countryFilter}
        onChange={(e) => setCountryFilter(e.target.value)}
      >
        <option value="">Tous les pays</option>
        {countries.map(c => <option key={c} value={c as string}>{c as string}</option>)}
      </select>
      <select 
        className="flex h-10 rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#E67E22]"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option value="">Tous les statuts</option>
        {statuses.map(s => <option key={s} value={s as string}>{s as string}</option>)}
      </select>
    </>
  );

  return (
    <div>
      <AdminPageHeader 
        title="Gestion des Membres" 
        description="Gérez les utilisateurs inscrits sur la plateforme."
      />

      <DataTable
        columns={columns}
        data={filteredMembers}
        loading={loading}
        keyExtractor={(m) => m.id}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Rechercher par nom, email..."
        filters={filters}
        emptyMessage="Aucun membre trouvé correspondant à ces critères."
        onRowClick={(m) => navigate(`/admin/membres/${m.id}`)}
      />
    </div>
  );
}
