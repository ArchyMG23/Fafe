import { useEffect } from 'react';
import { Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  Users, LayoutDashboard, Briefcase, Heart, Settings, 
  LogOut, Globe2, ShieldAlert 
} from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import { Button } from '../../components/ui/Button';

// Admin Views
import { AdminOverview } from './AdminOverview';
import { AdminMembers } from './AdminMembers';
import { AdminMemberDetail } from './AdminMemberDetail';
import { AdminEntrepreneurs } from './AdminEntrepreneurs';
import { AdminEntrepreneurDetail } from './AdminEntrepreneurDetail';

export function AdminDashboard() {
  const { userProfile, loading, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      if (!userProfile) {
        navigate('/connexion');
      } else if (userProfile.role !== 'ADMIN' && userProfile.role !== 'SUPER_ADMIN') {
        navigate('/espace-membre');
      }
    }
  }, [userProfile, loading, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (loading || !userProfile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-100">
        <div className="w-12 h-12 border-4 border-stone-300 border-t-stone-800 rounded-full animate-spin mb-4"></div>
      </div>
    );
  }

  const getLinkClass = (path: string) => {
    const isActive = location.pathname === path || (path !== '/admin' && location.pathname.startsWith(path));
    return `w-full justify-start mb-1 ${
      isActive 
        ? 'bg-stone-800 text-white font-bold' 
        : 'text-stone-600 hover:bg-stone-200 hover:text-stone-900'
    }`;
  };

  return (
    <div className="bg-stone-100 min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-stone-200 flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-stone-200">
          <Link to="/" className="text-2xl font-bold font-heading text-stone-900 tracking-tight flex items-center gap-2">
            FAFE <span className="text-xs bg-stone-100 px-2 py-1 rounded text-stone-500 uppercase tracking-widest">Admin</span>
          </Link>
        </div>
        
        <div className="p-4 flex-grow overflow-y-auto">
          <div className="mb-6">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3 px-4">Système</h3>
            <Link to="/admin">
              <Button variant="ghost" className={getLinkClass('/admin')}>
                <LayoutDashboard className="w-4 h-4 mr-3" /> Vue d'ensemble
              </Button>
            </Link>
          </div>
          
          <div className="mb-6">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3 px-4">Gestion</h3>
            <Link to="/admin/membres">
              <Button variant="ghost" className={getLinkClass('/admin/membres')}>
                <Users className="w-4 h-4 mr-3" /> Membres
              </Button>
            </Link>
            <Button variant="ghost" className="w-full justify-start mb-1 text-stone-400 cursor-not-allowed" disabled>
              <Briefcase className="w-4 h-4 mr-3" /> Entrepreneures
            </Button>
            <Button variant="ghost" className="w-full justify-start mb-1 text-stone-400 cursor-not-allowed" disabled>
              <Heart className="w-4 h-4 mr-3" /> Dons
            </Button>
            <Button variant="ghost" className="w-full justify-start mb-1 text-stone-400 cursor-not-allowed" disabled>
              <Globe2 className="w-4 h-4 mr-3" /> Pays & Régions
            </Button>
          </div>
          
          <div>
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3 px-4">Configuration</h3>
            <Button variant="ghost" className="w-full justify-start mb-1 text-stone-400 cursor-not-allowed" disabled>
              <Settings className="w-4 h-4 mr-3" /> Paramètres
            </Button>
            <Button variant="ghost" className="w-full justify-start mb-1 text-stone-400 cursor-not-allowed" disabled>
              <ShieldAlert className="w-4 h-4 mr-3" /> Sécurité
            </Button>
          </div>
        </div>
        
        <div className="p-4 border-t border-stone-200">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center font-bold text-stone-600">
              {userProfile.firstName.charAt(0)}{userProfile.lastName.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-stone-900 truncate">{userProfile.firstName} {userProfile.lastName}</p>
              <p className="text-xs text-stone-500 truncate">{userProfile.role}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} className="w-full text-stone-600 hover:text-stone-900">
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8">
        <Routes>
          <Route path="/" element={<AdminOverview />} />
          <Route path="/membres" element={<AdminMembers />} />
          <Route path="/membres/:id" element={<AdminMemberDetail />} />
          <Route path="/entrepreneures" element={<AdminEntrepreneurs />} />
          <Route path="/entrepreneures/:id" element={<AdminEntrepreneurDetail />} />
        </Routes>
      </main>
    </div>
  );
}
