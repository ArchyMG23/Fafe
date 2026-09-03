import { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Link } from 'react-router-dom';
import { 
  Users, Briefcase, MapPin, Heart, FolderOpen, FileText, 
  ArrowUpRight, Clock, CheckCircle2, UserPlus, AlertCircle
} from 'lucide-react';

export function AdminOverview() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    newMembers: 0, // Last 30 days
    totalEntrepreneurs: 0,
    pendingEntrepreneurs: 0,
    verifiedEntrepreneurs: 0,
    totalCountries: 0, // Approx for now
    totalDonations: 0,
    pendingDonations: 0,
    activeProjects: 0,
  });

  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Members stats
        const usersSnap = await getDocs(collection(db, 'users'));
        let totalM = 0;
        let newM = 0;
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        
        usersSnap.forEach(doc => {
          totalM++;
          const data = doc.data();
          if (data.createdAt && data.createdAt > thirtyDaysAgo) newM++;
        });

        // 2. Entrepreneurs stats
        const entSnap = await getDocs(collection(db, 'entrepreneurs'));
        let totalE = 0;
        let pendE = 0;
        let verifE = 0;
        const countriesSet = new Set();

        entSnap.forEach(doc => {
          totalE++;
          const data = doc.data();
          if (data.status === 'PENDING') pendE++;
          if (data.verificationStatus === 'VERIFIED') verifE++;
          if (data.country) countriesSet.add(data.country);
        });

        // 3. Donations stats
        const donSnap = await getDocs(collection(db, 'donations'));
        let totalD = 0;
        let pendD = 0;
        donSnap.forEach(doc => {
          const data = doc.data();
          if (data.paymentStatus === 'SUCCESS') totalD += data.amount;
          if (data.paymentStatus === 'PENDING' || data.paymentStatus === 'PROCESSING') pendD++;
        });

        // 4. Projects stats
        const projSnap = await getDocs(query(collection(db, 'projects'), where('status', '==', 'ACTIVE')));
        const actProj = projSnap.size;

        setStats({
          totalMembers: totalM,
          newMembers: newM,
          totalEntrepreneurs: totalE,
          pendingEntrepreneurs: pendE,
          verifiedEntrepreneurs: verifE,
          totalCountries: countriesSet.size || 15, // Fallback if no real data
          totalDonations: totalD,
          pendingDonations: pendD,
          activeProjects: actProj
        });

        // 5. Recent Activity (Mocked aggregated timeline for now since we don't have an audit log yet)
        // We'll just grab latest users and entrepreneurs
        const latestUsersQ = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(3));
        const latestUsersSnap = await getDocs(latestUsersQ);
        
        const latestEntQ = query(collection(db, 'entrepreneurs'), orderBy('createdAt', 'desc'), limit(3));
        const latestEntSnap = await getDocs(latestEntQ);

        let activity: any[] = [];
        latestUsersSnap.forEach(d => {
          const data = d.data();
          activity.push({
            id: d.id,
            type: 'user',
            title: `Nouveau membre: ${data.firstName} ${data.lastName}`,
            date: data.createdAt,
            icon: <UserPlus className="w-4 h-4 text-\[#E67E22\]" />
          });
        });
        
        latestEntSnap.forEach(d => {
          const data = d.data();
          activity.push({
            id: d.id,
            type: 'entrepreneur',
            title: `Nouveau profil: ${data.company}`,
            date: data.createdAt,
            icon: <Briefcase className="w-4 h-4 text-\[#6B3E1E\]" />
          });
        });

        activity.sort((a, b) => b.date - a.date);
        setRecentActivity(activity.slice(0, 5));

      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, icon, subtitle, highlight = false }: any) => (
    <div className={`bg-white p-6 rounded-2xl border transition-all duration-300 hover:shadow-md group ${highlight ? 'border-[#E67E22] shadow-sm ring-1 ring-[#E67E22]/20' : 'border-stone-200 shadow-sm hover:border-[#E67E22]/40'}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl transition-colors ${highlight ? 'bg-[#E67E22] text-white shadow-sm shadow-[#E67E22]/20' : 'bg-[#E67E22]/10 text-[#E67E22] group-hover:bg-[#E67E22]/20'}`}>
          {icon}
        </div>
      </div>
      <h3 className="text-3xl font-bold text-[#6B3E1E] mb-1 tracking-tight">
        {typeof value === 'number' && title.includes('Don') ? value.toLocaleString('fr-FR') + ' XAF' : value}
      </h3>
      <p className="text-[11px] font-bold text-[#6B3E1E]/60 uppercase tracking-widest">{title}</p>
      {subtitle && <p className="text-xs text-stone-500 mt-3 font-medium">{subtitle}</p>}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-[#E67E22] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-heading text-[#6B3E1E]">Tableau de bord</h1>
        <p className="text-stone-500 mt-1">Bienvenue dans l'espace d'administration FAFE.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard 
          title="Membres" 
          value={stats.totalMembers} 
          icon={<Users className="w-6 h-6" />} 
          subtitle={`+${stats.newMembers} ce mois-ci`}
        />
        <StatCard 
          title="Entrepreneures" 
          value={stats.totalEntrepreneurs} 
          icon={<Briefcase className="w-6 h-6" />} 
          subtitle={`${stats.verifiedEntrepreneurs} vérifiées`}
        />
        <StatCard 
          title="Pays représentés" 
          value={stats.totalCountries} 
          icon={<MapPin className="w-6 h-6" />} 
        />
        <StatCard 
          title="Dons Récoltés" 
          value={stats.totalDonations} 
          icon={<Heart className="w-6 h-6" />} 
          highlight={true}
        />
        <StatCard 
          title="Projets Actifs" 
          value={stats.activeProjects} 
          icon={<FolderOpen className="w-6 h-6" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Alerts & Action items */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-[#6B3E1E] flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-[#E67E22]" /> À traiter
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-1">Dons en attente</p>
                <p className="text-2xl font-bold text-[#6B3E1E]">{stats.pendingDonations}</p>
              </div>
              <Link to="/admin/dons" className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors">
                <ArrowUpRight className="w-5 h-5 text-stone-600" />
              </Link>
            </div>
            <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-1">Profils en attente</p>
                <p className="text-2xl font-bold text-[#6B3E1E]">{stats.pendingEntrepreneurs}</p>
              </div>
              <Link to="/admin/entrepreneures" className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors">
                <ArrowUpRight className="w-5 h-5 text-stone-600" />
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center">
              <h3 className="font-bold text-[#6B3E1E]">Activité Récente</h3>
              <Link to="/admin/audit" className="text-sm text-[#E67E22] hover:underline font-medium">Tout voir</Link>
            </div>
            <div className="p-6">
              {recentActivity.length > 0 ? (
                <div className="space-y-6">
                  {recentActivity.map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="mt-1">{item.icon}</div>
                      <div>
                        <p className="text-sm font-bold text-stone-900">{item.title}</p>
                        <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> 
                          {item.date ? new Date(item.date).toLocaleString('fr-FR') : 'Date inconnue'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-stone-500 text-sm text-center py-4">Aucune activité récente.</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-[#6B3E1E]">Raccourcis</h2>
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 space-y-2">
            <Link to="/admin/entrepreneures" className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 transition-colors group">
              <div className="w-10 h-10 rounded bg-[#E67E22]/10 text-[#E67E22] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-stone-900">Ajouter une entrepreneure</p>
                <p className="text-xs text-stone-500">Créer un nouveau profil public</p>
              </div>
            </Link>
            <Link to="/admin/projets" className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 transition-colors group">
              <div className="w-10 h-10 rounded bg-[#6B3E1E]/10 text-[#6B3E1E] flex items-center justify-center group-hover:scale-110 transition-transform">
                <FolderOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-stone-900">Nouveau Projet</p>
                <p className="text-xs text-stone-500">Lancer une campagne de dons</p>
              </div>
            </Link>
            <Link to="/admin/contenus" className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 transition-colors group">
              <div className="w-10 h-10 rounded bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-stone-900">Publier un article</p>
                <p className="text-xs text-stone-500">Ajouter du contenu au blog</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
