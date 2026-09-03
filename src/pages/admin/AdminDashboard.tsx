import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  Users, LayoutDashboard, Briefcase, Heart, Settings, 
  LogOut, Globe2, FolderOpen, Menu, X, Bell, Search,
  FileText, ShieldAlert, GraduationCap, Calendar, ShoppingCart, 
  Package, MessageSquare, MapPin, Trash2
} from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import { Button } from '../../components/ui/Button';
import { FafeLogo } from '../../components/ui/FafeLogo';

// Admin Views
import { AdminTestData } from './AdminTestData';
import { AdminOverview } from './AdminOverview';
import { AdminMembers } from './AdminMembers';
import { AdminMemberDetail } from './AdminMemberDetail';
import { AdminEntrepreneurs } from './AdminEntrepreneurs';
import { AdminEntrepreneurDetail } from './AdminEntrepreneurDetail';
import { AdminDonations } from './AdminDonations';
import { AdminDonationDetail } from './AdminDonationDetail';
import { AdminProjects } from './AdminProjects';

import { AdminAdhesions } from './AdminAdhesions';
import { AdminCMSMain } from './cms/AdminCMSMain';
import { AdminVisualCMS } from './cms/AdminVisualCMS';
import { AdminContentDashboard } from './cms/AdminContentDashboard';
import { AdminArticles } from './cms/AdminArticles';
import { AdminArticleEditor } from './cms/AdminArticleEditor';
import { AdminCategories } from './cms/AdminCategories';
import { AdminComments } from './cms/AdminComments';
import { AdminMedia } from './cms/AdminMedia';

import { AdminEvents } from './events/AdminEvents';
import { AdminEventEditor } from './events/AdminEventEditor';
import { AdminEventParticipants } from './events/AdminEventParticipants';
import { AdminEventCheckIn } from './events/AdminEventCheckIn';

import { AdminMarketplaceProducts } from './marketplace/AdminMarketplaceProducts';
import { AdminMarketplaceOrders } from './marketplace/AdminMarketplaceOrders';
import { AdminMarketplaceCategories } from './marketplace/AdminMarketplaceCategories';

import { AdminAudit } from './AdminAudit';
import { AdminProfile } from './AdminProfile';

// Future/Placeholder Views (Using empty components for now, or just routes)

export function AdminDashboard() {
  const { userProfile, loading, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!userProfile) {
        navigate('/hub/connexion');
      } else if (!['ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'CONTENT_MANAGER', 'FINANCE_MANAGER'].includes(userProfile.role)) {
        navigate('/hub/dashboard');
      }
    }
  }, [userProfile, loading, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (loading || !userProfile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF9F6]">
        <div className="w-12 h-12 border-4 border-[#E67E22] border-t-transparent rounded-full animate-spin mb-4"></div>
      </div>
    );
  }

  const getLinkClass = (path: string) => {
    const isActive = location.pathname === path || (path !== '/admin' && location.pathname.startsWith(path));
    return `w-full justify-start mb-1 rounded-md px-3 py-2 text-sm transition-colors ${
      isActive 
        ? 'bg-[#E67E22]/10 text-[#E67E22] font-bold' 
        : 'text-[#6B3E1E] hover:bg-[#6B3E1E]/5'
    }`;
  };

  const navGroups = [
    {
      title: "Tableau de bord",
      items: [
        { path: "/admin", icon: <LayoutDashboard className="w-4 h-4 mr-3" />, label: "Vue d'ensemble" }
      ]
    },
    {
      title: "Site Institutionnel",
      items: [
        { path: "/admin/cms", icon: <LayoutDashboard className="w-4 h-4 mr-3" />, label: "FAFE CMS (Pages & Médias)" },
        { path: "/admin/contenus", icon: <FileText className="w-4 h-4 mr-3" />, label: "Articles & Actualités" },
        { path: "/admin/evenements", icon: <Calendar className="w-4 h-4 mr-3" />, label: "Événements" },
        { path: "/admin/projets", icon: <FolderOpen className="w-4 h-4 mr-3" />, label: "Projets" },
      ]
    },
    {
      title: "FAFE Hub",
      items: [
        { path: "/admin/membres", icon: <Users className="w-4 h-4 mr-3" />, label: "Comptes Utilisateurs" },
        { path: "/admin/adhesions", icon: <ShieldAlert className="w-4 h-4 mr-3" />, label: "Adhésions FAFE" },
        { path: "/admin/entrepreneures", icon: <Briefcase className="w-4 h-4 mr-3" />, label: "Annuaire" },
        { path: "#", icon: <GraduationCap className="w-4 h-4 mr-3" />, label: "Formations", disabled: true },
        { path: "#", icon: <MessageSquare className="w-4 h-4 mr-3" />, label: "Réseau & Discussions", disabled: true },
      ]
    },
    {
      title: "FAFE Marketplace",
      items: [
        { path: "/admin/marketplace/commandes", icon: <ShoppingCart className="w-4 h-4 mr-3" />, label: "Ventes & Commandes" },
        { path: "/admin/marketplace/produits", icon: <Package className="w-4 h-4 mr-3" />, label: "Produits" },
        { path: "/admin/marketplace/categories", icon: <MapPin className="w-4 h-4 mr-3" />, label: "Catégories" },
      ]
    },
    {
      title: "FAFE Dons",
      items: [
        { path: "/admin/dons", icon: <Heart className="w-4 h-4 mr-3" />, label: "Historique des dons" },
      ]
    },
    {
      title: "Configuration",
      items: [
        { path: "/admin/pays", icon: <MapPin className="w-4 h-4 mr-3" />, label: "Pays" },
        { path: "/admin/parametres", icon: <Settings className="w-4 h-4 mr-3" />, label: "Paramètres" },
        { path: "/admin/audit", icon: <ShieldAlert className="w-4 h-4 mr-3" />, label: "Sécurité & Audit" },
        ...(userProfile.role === 'SUPER_ADMIN' ? [{ path: "/admin/donnees-test", icon: <Trash2 className="w-4 h-4 mr-3" />, label: "Données de Test" }] : []),
      ]
    }
  ];

  return (
    <div className="bg-[#FAF9F6] min-h-screen flex flex-col md:flex-row font-sans">
      
      {/* Mobile Header & Sidebar Overlay */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-stone-200 p-4 sticky top-0 z-30">
        <Link to="/" className="flex items-center gap-2">
          <FafeLogo size="sm" showSubtitle={false} badge="Admin" />
        </Link>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-[#6B3E1E]">
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen w-64 shrink-0 bg-white border-r border-stone-200 flex flex-col z-30
        transition-transform duration-300 ease-in-out transform md:transform-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-5 border-b border-stone-200 hidden md:block">
          <Link to="/" className="flex items-center justify-between group">
            <FafeLogo size="sm" showSubtitle={true} badge="Admin" />
          </Link>
        </div>
        
        <div className="p-4 flex-grow overflow-y-auto">
          {navGroups.map((group, idx) => (
            <div key={idx} className="mb-6">
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3 px-3">{group.title}</h3>
              {group.items.map((item, i) => (
                item.disabled ? (
                   <div key={i} className="flex items-center w-full justify-start mb-1 rounded-md px-3 py-2 text-sm text-stone-400 cursor-not-allowed group relative">
                    {item.icon} {item.label}
                    <span className="absolute left-full ml-2 px-2 py-1 bg-stone-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">Bientôt disponible</span>
                  </div>
                ) : (
                  <Link key={i} to={item.path} onClick={() => setSidebarOpen(false)} className="block">
                    <div className={getLinkClass(item.path)}>
                      <div className="flex items-center">
                        {item.icon} {item.label}
                      </div>
                    </div>
                  </Link>
                )
              ))}
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-stone-200">
           <Link to="/admin/profil" className="flex items-center gap-3 mb-4 px-2 hover:bg-stone-50 p-2 rounded-md transition-colors">
            <div className="w-10 h-10 rounded-full bg-[#6B3E1E] flex items-center justify-center font-bold text-white shrink-0">
              {userProfile.firstName.charAt(0)}{userProfile.lastName.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-[#6B3E1E] truncate">{userProfile.firstName} {userProfile.lastName}</p>
              <p className="text-xs text-[#E67E22] font-bold truncate">{userProfile.role}</p>
            </div>
          </Link>
          <Button variant="outline" onClick={handleLogout} className="w-full text-[#6B3E1E] border-[#6B3E1E]/20 hover:bg-[#6B3E1E]/5">
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navigation */}
        <header className="bg-white border-b border-stone-200 h-16 sticky top-0 z-10 px-4 md:px-8 flex items-center justify-between hidden md:flex">
          
          {/* Search */}
          <div className="relative w-64 lg:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input 
              type="text" 
              placeholder="Rechercher (membres, projets...)" 
              className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-transparent transition-all"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-stone-400 hover:text-[#6B3E1E] transition-colors rounded-full hover:bg-stone-100">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E67E22] rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Content Routes */}
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <Routes>
            <Route path="/" element={<AdminOverview />} />
            <Route path="/membres" element={<AdminMembers />} />
            <Route path="/membres/:id" element={<AdminMemberDetail />} />
            <Route path="/entrepreneures" element={<AdminEntrepreneurs />} />
            <Route path="/entrepreneures/:id" element={<AdminEntrepreneurDetail />} />
            <Route path="/dons" element={<AdminDonations />} />
            <Route path="/dons/:id" element={<AdminDonationDetail />} />
            <Route path="/projets" element={<AdminProjects />} />
            <Route path="/adhesions" element={<AdminAdhesions />} />
            <Route path="/cms" element={<AdminCMSMain />} />
            <Route path="/cms/*" element={<AdminCMSMain />} />
            <Route path="/cms-visuel" element={<AdminCMSMain />} />
            
            {/* Events routes */}
            <Route path="/evenements" element={<AdminEvents />} />
            <Route path="/evenements/nouveau" element={<AdminEventEditor />} />
            <Route path="/evenements/:id" element={<AdminEventEditor />} />
            <Route path="/evenements/:id/participants" element={<AdminEventParticipants />} />
            <Route path="/evenements/:id/check-in" element={<AdminEventCheckIn />} />

            {/* Marketplace Admin Routes */}
            <Route path="/marketplace/produits" element={<AdminMarketplaceProducts />} />
            <Route path="/marketplace/commandes" element={<AdminMarketplaceOrders />} />
            <Route path="/marketplace/categories" element={<AdminMarketplaceCategories />} />

            {/* New empty routes to prevent 404s while building */}
            <Route path="/pays" element={<div className="p-8 text-center text-stone-500">Gestion des pays en construction</div>} />
            
            <Route path="/contenus" element={<AdminContentDashboard />} />
            <Route path="/contenus/articles" element={<AdminArticles />} />
            <Route path="/contenus/articles/nouveau" element={<AdminArticleEditor />} />
            <Route path="/contenus/articles/:id" element={<AdminArticleEditor />} />
            <Route path="/contenus/categories" element={<AdminCategories />} />
            <Route path="/contenus/medias" element={<AdminMedia />} />
            <Route path="/commentaires" element={<AdminComments />} />

            <Route path="/parametres" element={<div className="p-8 text-center text-stone-500">Paramètres en construction</div>} />
            <Route path="/audit" element={<AdminAudit />} />
            <Route path="/donnees-test" element={<AdminTestData />} />
            <Route path="/profil" element={<AdminProfile />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
