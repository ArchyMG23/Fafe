import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Entrepreneur } from '../../types';
import { Link, useNavigate } from 'react-router-dom';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { DataTable, Column } from '../../components/admin/DataTable';
import { Button } from '../../components/ui/Button';
import { Edit, ShieldCheck, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';

export function AdminEntrepreneurs() {
  const [entrepreneurs, setEntrepreneurs] = useState<Entrepreneur[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const fetchEntrepreneurs = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'entrepreneurs'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Entrepreneur));
      setEntrepreneurs(data);
    } catch (error) {
      console.error("Error fetching entrepreneurs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntrepreneurs();
  }, []);

  const filteredEntrepreneurs = entrepreneurs.filter(e => 
    (e.firstName + ' ' + e.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: Column<Entrepreneur>[] = [
    {
      header: 'Profil',
      accessor: (profile) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-stone-200 overflow-hidden flex items-center justify-center shrink-0 border border-stone-200">
            {profile.professionalPhoto ? (
              <img src={profile.professionalPhoto} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="font-bold text-[#6B3E1E]">{profile.firstName.charAt(0)}</span>
            )}
          </div>
          <div>
            <p className="font-bold text-[#6B3E1E]">{profile.firstName} {profile.lastName}</p>
            <p className="text-xs text-stone-500 truncate max-w-[150px]">{profile.ownerId}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Entreprise & Secteur',
      accessor: (profile) => (
        <div>
          <p className="font-medium text-stone-900">{profile.company}</p>
          <p className="text-xs text-[#E67E22] font-bold uppercase tracking-wider">{profile.sector}</p>
        </div>
      )
    },
    {
      header: 'Localisation',
      accessor: (profile) => (
        <div>
          <p className="text-stone-900">{profile.city}</p>
          <p className="text-xs text-stone-500 uppercase">{profile.country}</p>
        </div>
      )
    },
    {
      header: 'Statut Annuaire',
      accessor: (profile) => {
        if (profile.status === 'APPROVED') {
          return (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Publié
            </span>
          );
        } else if (profile.status === 'PENDING') {
          return (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              En attente
            </span>
          );
        } else {
          return (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
              <XCircle className="w-3 h-3 mr-1" /> {profile.status === 'REJECTED' ? 'Rejeté' : 'Suspendu'}
            </span>
          );
        }
      }
    },
    {
      header: 'Vérification',
      accessor: (profile) => (
        profile.verificationStatus === 'VERIFIED' ? (
          <span className="inline-flex items-center text-xs font-bold text-[#D4AF37]">
            <ShieldCheck className="w-4 h-4 mr-1" /> Vérifié
          </span>
        ) : (
          <span className="inline-flex items-center text-xs font-bold text-stone-400">
            <ShieldAlert className="w-4 h-4 mr-1" /> Non vérifié
          </span>
        )
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (profile) => (
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-[#E67E22] hover:text-[#c96a1a] hover:bg-orange-50"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/admin/entrepreneures/${profile.id}`);
          }}
        >
          <Edit className="w-4 h-4 mr-2" /> Gérer
        </Button>
      )
    }
  ];

  return (
    <div>
      <AdminPageHeader 
        title="Annuaire Entrepreneures"
        description="Gérez les profils publics de l'annuaire FAFE"
      />

      <DataTable
        columns={columns}
        data={filteredEntrepreneurs}
        loading={loading}
        keyExtractor={(p) => p.id}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Rechercher par nom, entreprise, pays..."
        filters={
          <select 
            className="flex h-10 rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#E67E22]"
            onChange={(e) => setSearchTerm(e.target.value)}
          >
            <option value="">Tous les statuts</option>
            <option value="APPROVED">Publié</option>
            <option value="PENDING">En attente</option>
            <option value="REJECTED">Rejeté / Suspendu</option>
          </select>
        }
        onRowClick={(p) => navigate(`/admin/entrepreneures/${p.id}`)}
      />
    </div>
  );
}
