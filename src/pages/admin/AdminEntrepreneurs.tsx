import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Entrepreneur } from '../../types';
import { Link } from 'react-router-dom';
import { Search, Loader2, Edit, ShieldCheck, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export function AdminEntrepreneurs() {
  const [entrepreneurs, setEntrepreneurs] = useState<Entrepreneur[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'entrepreneurs', id), {
        status: newStatus,
        updatedAt: Date.now()
      });
      setEntrepreneurs(prev => prev.map(e => e.id === id ? { ...e, status: newStatus as any } : e));
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Erreur lors de la mise à jour");
    }
  };

  const filteredEntrepreneurs = entrepreneurs.filter(e => 
    (e.firstName + ' ' + e.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-stone-900">Annuaire Entrepreneures</h1>
          <p className="text-stone-500">Gérez les profils publics de l'annuaire FAFE</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="p-4 border-b border-stone-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-stone-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <Input 
              placeholder="Rechercher par nom, entreprise, pays..." 
              className="pl-9 bg-white border-stone-200 focus:border-stone-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-stone-500 font-medium border-b border-stone-200">
              <tr>
                <th className="px-6 py-4">Profil</th>
                <th className="px-6 py-4">Entreprise & Secteur</th>
                <th className="px-6 py-4">Localisation</th>
                <th className="px-6 py-4">Statut Annuaire</th>
                <th className="px-6 py-4">Vérification</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-stone-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Chargement des profils...
                  </td>
                </tr>
              ) : filteredEntrepreneurs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-stone-500">
                    Aucun profil trouvé
                  </td>
                </tr>
              ) : (
                filteredEntrepreneurs.map((profile) => (
                  <tr key={profile.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-stone-200 overflow-hidden flex items-center justify-center shrink-0">
                          {profile.professionalPhoto ? (
                            <img src={profile.professionalPhoto} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-bold text-stone-500">{profile.firstName.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-stone-900">{profile.firstName} {profile.lastName}</p>
                          <p className="text-xs text-stone-500 truncate max-w-[150px]">{profile.ownerId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-stone-900">{profile.company}</p>
                      <p className="text-xs text-stone-500 uppercase tracking-wider">{profile.sector}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-stone-900">{profile.city}</p>
                      <p className="text-xs text-stone-500 uppercase">{profile.country}</p>
                    </td>
                    <td className="px-6 py-4">
                      {profile.status === 'APPROVED' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Publié
                        </span>
                      ) : profile.status === 'PENDING' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          En attente
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <XCircle className="w-3 h-3 mr-1" /> {profile.status === 'REJECTED' ? 'Rejeté' : 'Suspendu'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {profile.verificationStatus === 'VERIFIED' ? (
                        <span className="inline-flex items-center text-xs font-bold text-yellow-600">
                          <ShieldCheck className="w-4 h-4 mr-1" /> Vérifié
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs text-stone-400">
                          <ShieldAlert className="w-4 h-4 mr-1" /> Non vérifié
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/admin/entrepreneures/${profile.id}`}>
                        <Button variant="ghost" size="sm" className="text-stone-600 hover:text-stone-900 hover:bg-stone-200">
                          <Edit className="w-4 h-4 mr-2" /> Gérer
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
