import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../store/auth';
import { Donation, Project } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Heart, FileText, Loader2 } from 'lucide-react';

export function DonationHistory() {
  const { userProfile } = useAuthStore();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [projectsMap, setProjectsMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonations = async () => {
      if (!userProfile?.id) return;
      
      try {
        const q = query(
          collection(db, 'donations'),
          where('donorUserId', '==', userProfile.id),
          orderBy('createdAt', 'desc')
        );
        
        const snap = await getDocs(q);
        const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Donation));
        
        // Fetch project titles
        const pMap: Record<string, string> = { 'GENERAL': 'FAFE — Fonds général' };
        for (const donation of fetched) {
          if (donation.projectId && !pMap[donation.projectId]) {
            try {
              const pDoc = await getDoc(doc(db, 'projects', donation.projectId));
              if (pDoc.exists()) {
                pMap[donation.projectId] = (pDoc.data() as Project).title;
              } else {
                pMap[donation.projectId] = 'Projet inconnu';
              }
            } catch(e) {
              pMap[donation.projectId] = 'Projet inconnu';
            }
          }
        }
        
        setProjectsMap(pMap);
        setDonations(fetched);
      } catch (error) {
        console.error("Error fetching donations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, [userProfile]);

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

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'SUCCESS': return 'Réussi';
      case 'PENDING': return 'En attente';
      case 'PROCESSING': return 'En traitement';
      case 'FAILED': return 'Échoué';
      case 'CANCELLED': return 'Annulé';
      default: return status;
    }
  };

  if (!userProfile) return null;

  return (
    <Card className="border border-[#6B3E1E]/5 shadow-sm bg-white rounded-2xl h-full">
      <CardHeader className="border-b border-[#6B3E1E]/5 px-8 py-6 flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold font-heading text-[#6B3E1E] flex items-center gap-3">
          <Heart className="w-6 h-6 text-[#E67E22]" />
          Mes dons
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#6B3E1E]/60">
            <Loader2 className="w-8 h-8 animate-spin text-[#E67E22] mb-4" />
            Chargement de l'historique...
          </div>
        ) : donations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#6B3E1E]">
              <thead className="bg-[#FAF9F6] border-b border-[#6B3E1E]/10">
                <tr>
                  <th className="px-6 py-4 font-bold text-[#6B3E1E]/60 uppercase tracking-wider text-xs">Date</th>
                  <th className="px-6 py-4 font-bold text-[#6B3E1E]/60 uppercase tracking-wider text-xs">Montant</th>
                  <th className="px-6 py-4 font-bold text-[#6B3E1E]/60 uppercase tracking-wider text-xs">Projet</th>
                  <th className="px-6 py-4 font-bold text-[#6B3E1E]/60 uppercase tracking-wider text-xs">Type</th>
                  <th className="px-6 py-4 font-bold text-[#6B3E1E]/60 uppercase tracking-wider text-xs">Statut</th>
                  <th className="px-6 py-4 font-bold text-[#6B3E1E]/60 uppercase tracking-wider text-xs">Réf. Transaction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#6B3E1E]/5">
                {donations.map((donation) => (
                  <tr key={donation.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(donation.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 font-bold text-[#6B3E1E]">
                      {donation.amount.toLocaleString('fr-FR')} {donation.currency}
                    </td>
                    <td className="px-6 py-4 font-medium max-w-[200px] truncate" title={projectsMap[donation.projectId]}>
                      {projectsMap[donation.projectId] || donation.projectId}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium">
                      {donation.frequency === 'ONE_TIME' ? 'Ponctuel' : 
                       donation.frequency === 'MONTHLY' ? 'Mensuel' :
                       donation.frequency === 'QUARTERLY' ? 'Trimestriel' : 'Annuel'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(donation.paymentStatus)}`}>
                        {getStatusLabel(donation.paymentStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-[#6B3E1E]/40">
                      {donation.transactionReference || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-stone-400" />
            </div>
            <h3 className="text-xl font-bold font-heading text-[#6B3E1E] mb-2">Aucun don enregistré</h3>
            <p className="text-[#6B3E1E]/60 max-w-md">
              Vous n'avez pas encore effectué de don sur la plateforme.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
