import { useState, useEffect } from 'react';
import { collection, query, getDocs, updateDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Membership } from '../../types';
import { Eye, Check, X, ShieldAlert } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/auth';

export function AdminAdhesions() {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuthStore();

  useEffect(() => {
    loadMemberships();
  }, []);

  const loadMemberships = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'memberships'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setMemberships(snapshot.docs.map(doc => doc.data() as Membership));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (membershipId: string) => {
    if (!confirm('Approuver cette adhésion ?')) return;
    try {
      const membershipNumber = `FAFE-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      await updateDoc(doc(db, 'memberships', membershipId), {
        status: 'ACTIVE',
        membershipNumber,
        verifiedAt: Date.now(),
        verifiedBy: currentUser?.uid
      });
      loadMemberships();
    } catch (error) {
      console.error(error);
    }
  };

  const handleReject = async (membershipId: string) => {
    if (!confirm('Rejeter cette adhésion ?')) return;
    try {
      await updateDoc(doc(db, 'memberships', membershipId), {
        status: 'REJECTED',
        verifiedAt: Date.now(),
        verifiedBy: currentUser?.uid
      });
      loadMemberships();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-heading text-[#6B3E1E]">Gestion des adhésions</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-medium">
              <tr>
                <th className="px-6 py-4">Utilisateur</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4">Montant</th>
                <th className="px-6 py-4">Référence Bancaire</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {memberships.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-stone-500">Aucune adhésion</td></tr>
              ) : memberships.map(membership => (
                <tr key={membership.id} className="hover:bg-stone-50">
                  <td className="px-6 py-4 font-mono">{membership.userId.substring(0, 8)}...</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      membership.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                      membership.status === 'PAYMENT_SUBMITTED' ? 'bg-blue-100 text-blue-700' :
                      membership.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {membership.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold">{membership.amount} {membership.currency}</td>
                  <td className="px-6 py-4">{membership.bankReference || '-'}</td>
                  <td className="px-6 py-4">{new Date(membership.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" className="p-2">
                        <Eye className="w-4 h-4 text-stone-500" />
                      </Button>
                      {membership.status === 'PAYMENT_SUBMITTED' && (
                        <>
                          <Button size="sm" onClick={() => handleApprove(membership.id)} className="bg-green-600 hover:bg-green-700 text-white p-2">
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button size="sm" onClick={() => handleReject(membership.id)} className="bg-red-600 hover:bg-red-700 text-white p-2">
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
