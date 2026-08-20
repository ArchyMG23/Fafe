import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { UserProfile } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Search, Loader2, Edit } from 'lucide-react';

export function AdminMembers() {
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-heading text-stone-900">Gestion des Membres</h1>
      </div>

      <Card className="border-0 shadow-sm mb-6">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <Input 
              placeholder="Rechercher par nom, email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-stone-50 border-stone-200"
            />
          </div>
          <div className="w-full md:w-48">
            <select 
              className="flex h-10 w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-transparent"
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
            >
              <option value="">Tous les pays</option>
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="w-full md:w-48">
            <select 
              className="flex h-10 w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tous les statuts</option>
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="px-6 py-4 font-bold text-stone-500 uppercase tracking-wider text-xs">Membre</th>
                <th className="px-6 py-4 font-bold text-stone-500 uppercase tracking-wider text-xs">Contact</th>
                <th className="px-6 py-4 font-bold text-stone-500 uppercase tracking-wider text-xs">Pays</th>
                <th className="px-6 py-4 font-bold text-stone-500 uppercase tracking-wider text-xs">Rôle</th>
                <th className="px-6 py-4 font-bold text-stone-500 uppercase tracking-wider text-xs">Statut</th>
                <th className="px-6 py-4 font-bold text-stone-500 uppercase tracking-wider text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-stone-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Chargement des membres...
                  </td>
                </tr>
              ) : filteredMembers.length > 0 ? (
                filteredMembers.map(member => (
                  <tr key={member.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-stone-900">{member.firstName} {member.lastName}</div>
                      <div className="text-xs text-stone-500">Inscrit le {new Date(member.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 text-stone-600">
                      <div>{member.email}</div>
                      {member.phone && <div className="text-xs text-stone-400">{member.phone}</div>}
                    </td>
                    <td className="px-6 py-4 text-stone-600">{member.country || '-'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 bg-stone-100 text-stone-700 text-[10px] uppercase font-bold rounded-full tracking-wider">
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 text-[10px] uppercase font-bold rounded-full tracking-wider ${getStatusColor(member.status)}`}>
                        {member.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/admin/membres/${member.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-[#E67E22] hover:text-[#c96a1a] hover:bg-orange-50">
                          <Edit className="w-4 h-4 mr-1" /> Gérer
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-stone-500">
                    Aucun membre trouvé correspondant à ces critères.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
