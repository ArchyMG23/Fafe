import { useState, useEffect } from 'react';
import { collection, getCountFromServer, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Card, CardContent } from '../../components/ui/Card';
import { Users, Briefcase, Heart, Globe2 } from 'lucide-react';

export function AdminOverview() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalEntrepreneurs: 0,
    totalDonations: 0,
    totalCountries: 15
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const membersSnap = await getCountFromServer(collection(db, 'users'));
        // Mock others for now since we don't have all collections set up securely yet
        setStats(prev => ({
          ...prev,
          totalMembers: membersSnap.data().count,
          totalEntrepreneurs: 42,
          totalDonations: 156
        }));
      } catch (error) {
        console.error("Error fetching stats", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading text-stone-900">Vue d'ensemble</h1>
      
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-stone-100 text-stone-600 rounded-full">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500">Total Membres</p>
              <h4 className="text-2xl font-bold text-stone-900">{stats.totalMembers}</h4>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-orange-50 text-[#E67E22] rounded-full">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500">Entrepreneures</p>
              <h4 className="text-2xl font-bold text-stone-900">{stats.totalEntrepreneurs}</h4>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-rose-50 text-rose-500 rounded-full">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500">Dons réalisés</p>
              <h4 className="text-2xl font-bold text-stone-900">{stats.totalDonations}</h4>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-stone-100 text-stone-500 rounded-full">
              <Globe2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500">Pays actifs</p>
              <h4 className="text-2xl font-bold text-stone-900">{stats.totalCountries}</h4>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="border-0 shadow-sm">
        <CardContent className="p-12 text-center text-stone-500">
          Bienvenue dans l'interface d'administration du FAFE. Utilisez le menu latéral pour naviguer.
        </CardContent>
      </Card>
    </div>
  );
}
