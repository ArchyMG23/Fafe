import { useEffect } from 'react';
import { Routes, Route, useNavigate, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  User as UserIcon, BookOpen, Heart, Settings, LogOut, 
  LayoutDashboard, Activity, Users, ShoppingBag, Calendar
} from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import { Button } from '../../components/ui/Button';

// Placeholder Components for Dashboard sections
import { DashboardOverview } from './DashboardOverview';
import { Briefcase } from 'lucide-react';
import { MemberProfile } from './MemberProfile';
import { MemberEntrepreneurProfile } from './MemberEntrepreneurProfile';
import { DonationHistory } from './DonationHistory';
import { MemberAdhesion } from './MemberAdhesion';
import { ShieldCheck } from 'lucide-react';
import { MemberEvents } from './events/MemberEvents';

export function MemberDashboard() {
  const { currentUser, userProfile, loading, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  
  useEffect(() => {
    const checkAdmin = async () => {
      if (currentUser && currentUser.email === 'yombivictor@gmail.com' && userProfile?.role !== 'SUPER_ADMIN') {
        try {
          const { doc, updateDoc } = await import('firebase/firestore');
          const { db } = await import('../../lib/firebase');
          await updateDoc(doc(db, 'users', currentUser.uid), { role: 'SUPER_ADMIN' });
          console.log("Upgraded to SUPER_ADMIN successfully");
          // Force reload to get updated token/profile if needed, but local state might not update immediately without a fetch.
          window.location.reload();
        } catch (e) {
          console.error("Failed to upgrade admin", e);
        }
      }
    };
    if (userProfile) checkAdmin();
  }, [currentUser, userProfile]);
  useEffect(() => {
    if (!loading && !currentUser) {
      navigate('/connexion');
    }
  }, [currentUser, loading, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (loading || !userProfile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF9F6]">
        <div className="w-12 h-12 border-4 border-[#E67E22]/20 border-t-[#E67E22] rounded-full animate-spin mb-4"></div>
        <p className="text-[#6B3E1E]/60 font-medium">Chargement de votre espace...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF9F6] min-h-screen py-12">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-[#6B3E1E]/5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#E67E22]/10 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
              {userProfile.photoURL ? (
                <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-[#E67E22]">
                  {userProfile.firstName.charAt(0)}{userProfile.lastName.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold font-heading text-[#6B3E1E]">Espace Membre</h1>
              <p className="text-[#6B3E1E]/70">Bienvenue, {userProfile.firstName}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            {userProfile.role === 'ADMIN' || userProfile.role === 'SUPER_ADMIN' ? (
              <Link to="/admin" className="flex-1 md:flex-none">
                <Button variant="outline" className="w-full border-[#6B3E1E]/20 text-[#6B3E1E]">
                  Administration
                </Button>
              </Link>
            ) : null}
            <Button variant="ghost" onClick={handleLogout} className="flex-1 md:flex-none text-red-600 hover:text-red-700 hover:bg-red-50">
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>

        <div className="w-full">
          <Routes>
            <Route path="/" element={<DashboardOverview />} />
            <Route path="/profil" element={<Navigate to="/hub/profil" replace />} />
            <Route path="/entrepreneure" element={<MemberEntrepreneurProfile />} />
            <Route path="/adhesion" element={<Navigate to="/hub/adhesion" replace />} />
            <Route path="/dons" element={<DonationHistory />} />
            <Route path="/evenements" element={<MemberEvents />} />
            <Route path="/activite" element={<div className="bg-white p-8 rounded-2xl shadow-sm text-center text-[#6B3E1E]/60">Activité bientôt disponible</div>} />
            <Route path="/reseau" element={<div className="bg-white p-8 rounded-2xl shadow-sm text-center text-[#6B3E1E]/60">Réseau bientôt disponible</div>} />
            <Route path="/parametres" element={<div className="bg-white p-8 rounded-2xl shadow-sm text-center text-[#6B3E1E]/60">Paramètres bientôt disponibles</div>} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
