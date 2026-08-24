import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Donation } from '../../types';
import { useNavigate } from 'react-router-dom';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { DataTable, Column } from '../../components/admin/DataTable';
import { Button } from '../../components/ui/Button';
import { Eye } from 'lucide-react';

export function AdminDonations() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Analytics stats
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalDonations, setTotalDonations] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const q = query(collection(db, 'donations'), orderBy('createdAt', 'desc'), limit(100));
        const snap = await getDocs(q);
        
        const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Donation));
        
        let amt = 0;
        let succ = 0;
        let pend = 0;
        
        fetched.forEach(d => {
          if (d.paymentStatus === 'SUCCESS') {
            if (d.currency === 'XAF') amt += d.amount;
            succ++;
          } else if (d.paymentStatus === 'PENDING' || d.paymentStatus === 'PROCESSING') {
            pend++;
          }
        });

        setTotalDonations(fetched.length);
        setTotalAmount(amt);
        setSuccessCount(succ);
        setPendingCount(pend);
        
        setDonations(fetched);
      } catch (error) {
        console.error("Error fetching donations:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDonations();
  }, []);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'SUCCESS': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-stone-100 text-stone-800';
      default: return 'bg-stone-100 text-stone-800';
    }
  };

  const filteredDonations = donations.filter(d => {
    const searchMatch = (d.donorFirstName + ' ' + d.donorLastName).toLowerCase().includes(searchTerm.toLowerCase())
      || d.donorEmail.toLowerCase().includes(searchTerm.toLowerCase())
      || (d.transactionReference || '').toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = statusFilter ? d.paymentStatus === statusFilter : true;
    return searchMatch && statusMatch;
  });

  const columns: Column<Donation>[] = [
    {
      header: 'Date',
      accessor: (d) => <span className="text-stone-600">{new Date(d.createdAt).toLocaleDateString('fr-FR')}</span>
    },
    {
      header: 'Donateur',
      accessor: (d) => (
        <div>
          <div className="font-bold text-[#6B3E1E]">
            {d.anonymous ? 'Anonyme' : `${d.donorFirstName} ${d.donorLastName}`}
          </div>
          <div className="text-xs text-stone-500">{d.donorEmail}</div>
        </div>
      )
    },
    {
      header: 'Montant',
      accessor: (d) => (
        <span className="font-bold text-stone-900">
          {d.amount.toLocaleString('fr-FR')} {d.currency}
        </span>
      )
    },
    {
      header: 'Type',
      accessor: (d) => (
        <span className="text-stone-600">
          {d.frequency === 'ONE_TIME' ? 'Ponctuel' : 'Récurrent'}
        </span>
      )
    },
    {
      header: 'Statut',
      accessor: (d) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(d.paymentStatus)}`}>
          {d.paymentStatus}
        </span>
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (d) => (
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-[#E67E22] hover:text-[#c96a1a] hover:bg-orange-50"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/admin/dons/${d.id}`);
          }}
        >
          <Eye className="w-4 h-4 mr-2" /> Détails
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
      <option value="SUCCESS">Réussi</option>
      <option value="PENDING">En attente</option>
      <option value="FAILED">Échoué</option>
    </select>
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Gestion des Dons"
        description="Suivi des contributions financières et statistiques."
      />

      {/* Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
          <p className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-2">Total Récolté (XAF)</p>
          <p className="text-3xl font-bold text-[#E67E22]">{totalAmount.toLocaleString('fr-FR')}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
          <p className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-2">Total Dons</p>
          <p className="text-3xl font-bold text-[#6B3E1E]">{totalDonations}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
          <p className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-2">Dons Réussis</p>
          <p className="text-3xl font-bold text-green-600">{successCount}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
          <p className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-2">En attente</p>
          <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredDonations}
        loading={loading}
        keyExtractor={(d) => d.id}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Rechercher (Nom, email, réf...)"
        filters={filters}
        onRowClick={(d) => navigate(`/admin/dons/${d.id}`)}
      />
    </div>
  );
}
