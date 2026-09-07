import { FafeImage } from '../../components/ui/FafeImage';
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
    if (!loading && !currentUser) {
      navigate('/hub/connexion');
    }
  }, [currentUser, loading, navigate]);

  useEffect(() => {
    if (userProfile && ['SUPER_ADMIN', 'ADMIN'].includes(userProfile.role)) {
      navigate('/admin', { replace: true });
    }
  }, [userProfile, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF9F6]">
        <div className="w-12 h-12 border-4 border-[#00843D]/20 border-t-[#E67E22] rounded-full animate-spin mb-4"></div>
        <p className="text-[#063F3A]/60 font-medium">Chargement de votre espace...</p>
      </div>
    );
  }

  if (!userProfile) {
     return (
       <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF9F6] p-4 text-center">
         <div className="bg-red-50 text-red-600 p-6 rounded-xl max-w-md">
           <h2 className="text-xl font-bold mb-2">Profil Introuvable</h2>
           <p className="mb-4">Votre compte d'authentification existe, mais votre profil membre n'a pas été trouvé. Veuillez vous déconnecter et vous réinscrire.</p>
           <Button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white">Se déconnecter</Button>
         </div>
       </div>
     );
  }

  return (
    <div className="bg-[#FAF9F6] min-h-screen py-12">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 max-w-7xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-[#063F3A]/5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#C8102E]/10 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
              {userProfile.photoURL ? (
                <FafeImage src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-[#00843D]">
                  {userProfile.firstName.charAt(0)}{userProfile.lastName.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold font-heading text-[#063F3A]">Espace Membre</h1>
              <p className="text-[#063F3A]/70">Bienvenue, {userProfile.firstName}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            {userProfile.role === 'ADMIN' || userProfile.role === 'SUPER_ADMIN' ? (
              <Link to="/admin" className="flex-1 md:flex-none">
                <Button variant="outline" className="w-full border-[#063F3A]/20 text-[#063F3A]">
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
            <Route path="/activite" element={<div className="bg-white p-8 rounded-2xl shadow-sm text-center text-[#063F3A]/60">Activité bientôt disponible</div>} />
            <Route path="/reseau" element={<div className="bg-white p-8 rounded-2xl shadow-sm text-center text-[#063F3A]/60">Réseau bientôt disponible</div>} />
            <Route path="/parametres" element={<div className="bg-white p-8 rounded-2xl shadow-sm text-center text-[#063F3A]/60">Paramètres bientôt disponibles</div>} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
