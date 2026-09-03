import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Network, 
  BookOpen, 
  Briefcase, 
  Calendar, 
  ShoppingBag, 
  Heart, 
  UserCircle, ShieldAlert,
  LogOut,
  Menu,
  X,
  Settings
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../store/auth';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import { FafeLogo } from '../ui/FafeLogo';

export function HubLayout() {
  const { currentUser: user, userProfile: profile } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const handleLogout = async () => {
    await signOut(auth);
  };

  const navItems = [
    { name: 'Tableau de bord', path: '/hub/dashboard', icon: LayoutDashboard },
    { name: 'Annuaire', path: '/hub/annuaire', icon: Users },
    { name: 'Réseau', path: '/hub/reseau', icon: Network },
    { name: 'Formations', path: '/hub/formations', icon: BookOpen },
    { name: 'Opportunités', path: '/hub/opportunites', icon: Briefcase },
    { name: 'Événements', path: '/hub/evenements', icon: Calendar },
    { name: 'Marketplace', path: '/marketplace', icon: ShoppingBag },
    { name: 'Mes Dons', path: '/dons', icon: Heart },
  ];

  if (profile?.role === 'SUPER_ADMIN' || profile?.role === 'ADMIN') {
    navItems.push({ name: 'Administration', path: '/admin', icon: Settings });
  }

  // If not logged in, we shouldn't show the full sidebar maybe? 
  // Wait, if not logged in, they are on /hub/connexion. 
  // A clean layout for login is better. Let's conditionally render the sidebar if user is logged in.

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col">
        <header className="bg-white shadow-sm border-b border-stone-200 p-4">
          <div className="w-full max-w-7xl mx-auto flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2">
              <FafeLogo size="sm" showSubtitle={false} />
              <span className="text-xs bg-[#E67E22]/10 font-bold px-2 py-0.5 rounded text-[#E67E22] uppercase tracking-wider">Hub</span>
            </Link>
            <Link to="/" className="text-sm font-medium text-stone-500 hover:text-[#E67E22] transition-colors">
              &larr; Retour au site FAFE
            </Link>
          </div>
        </header>
        <main className="flex-grow flex items-center justify-center p-4">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-stone-200 z-50 transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        <div className="p-6 border-b border-stone-100 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <FafeLogo size="sm" showSubtitle={false} />
            <span className="text-xs bg-[#E67E22]/10 font-bold px-2 py-0.5 rounded text-[#E67E22] uppercase tracking-wider">Hub</span>
          </Link>
          <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        <div className="p-4 flex items-center gap-3 border-b border-stone-100">
          <div className="w-10 h-10 rounded-full bg-[#E67E22]/10 flex items-center justify-center text-[#E67E22] font-bold">
            {profile?.firstName?.[0] || user.email?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#6B3E1E] truncate">
              {profile?.firstName} {profile?.lastName}
            </p>
            <p className="text-xs text-stone-500 truncate">{user.email}</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                  isActive 
                    ? 'bg-[#E67E22]/10 text-[#E67E22]' 
                    : 'text-stone-600 hover:bg-stone-50 hover:text-[#6B3E1E]'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-[#E67E22]' : 'text-stone-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-stone-100 space-y-1">
          <Link
            to="/hub/profil"
            className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium text-stone-600 hover:bg-stone-50 hover:text-[#6B3E1E]"
          >
            <UserCircle className="w-5 h-5 text-stone-400" />
            Mon Profil
          </Link>
          <Link
            to="/hub/adhesion"
            className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium text-stone-600 hover:bg-stone-50 hover:text-[#6B3E1E]"
          >
            <ShieldAlert className="w-5 h-5 text-stone-400" />
            Mon Adhésion
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className="bg-white h-16 border-b border-stone-200 flex items-center justify-between px-4 sticky top-0 z-30">
          <button 
            className="lg:hidden p-2 text-stone-500 hover:bg-stone-50 rounded-lg"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <Link to="/" className="text-sm font-medium text-stone-500 hover:text-[#E67E22] transition-colors hidden sm:block">
            &larr; Retour au site FAFE
          </Link>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
