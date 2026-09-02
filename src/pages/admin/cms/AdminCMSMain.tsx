import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Home, Users, Newspaper, Image as ImageIcon, Heart, Globe, 
  FolderOpen, History, ExternalLink, ShieldAlert, Sparkles, CheckCircle2, ChevronRight
} from 'lucide-react';
import { CMSPageId } from '../../../types';
import { useAuthStore } from '../../../store/auth';
import { CMSPageEditor } from '../../../components/admin/cms/CMSPageEditor';
import { AdminCMSMedia } from './AdminCMSMedia';
import { AdminCMSHistory } from './AdminCMSHistory';

interface PageMeta {
  id: CMSPageId;
  label: string;
  description: string;
  icon: any;
  publicPath: string;
}

const CMS_PAGES: PageMeta[] = [
  {
    id: 'accueil',
    label: 'Page Accueil',
    description: 'Hero, accroches, chiffres clés, missions, vocation, annuaire et appel aux dons.',
    icon: Home,
    publicPath: '/'
  },
  {
    id: 'nous',
    label: 'Page Nous',
    description: 'Mot de la PCA, présentation, histoire, vision, mission, valeurs, gouvernance et bureau.',
    icon: Users,
    publicPath: '/nous'
  },
  {
    id: 'actualites',
    label: 'Page Actualités & Événements',
    description: 'En-tête éditorial et métadonnées pour les articles et événements.',
    icon: Newspaper,
    publicPath: '/actualites'
  },
  {
    id: 'galerie',
    label: 'Page Galerie & Médiathèque',
    description: 'En-tête et métadonnées de la médiathèque multimédia.',
    icon: ImageIcon,
    publicPath: '/galerie'
  },
  {
    id: 'dons',
    label: 'Page Dons & Soutien',
    description: 'Appel aux dons, coordonnées bancaires (IBAN, SWIFT) et consignes officielles.',
    icon: Heart,
    publicPath: '/dons'
  },
  {
    id: 'global',
    label: 'Global (Navbar & Footer)',
    description: 'Titres de marque, slogans, copyright et informations de contact permanentes.',
    icon: Globe,
    publicPath: '/'
  }
];

export function AdminCMSMain() {
  const { userProfile } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // View mode can be a page ID ('accueil', 'nous', etc.) or 'media' or 'history'
  const activeTab = searchParams.get('tab') || 'accueil';

  const isSuperAdminOrAuthorized = 
    userProfile?.role === 'SUPER_ADMIN' || 
    userProfile?.role === 'ADMIN' || 
    userProfile?.role === 'CONTENT_MANAGER';

  if (!isSuperAdminOrAuthorized) {
    return (
      <div className="bg-white rounded-2xl border border-red-200 p-12 text-center max-w-lg mx-auto my-12 shadow-sm">
        <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-stone-900 mb-2">Accès Restreint</h2>
        <p className="text-sm text-stone-500 mb-6">
          Seuls les administrateurs et gestionnaires de contenu autorisés (SUPER_ADMIN) ont accès au CMS institutionnel FAFE.
        </p>
        <Link 
          to="/admin" 
          className="inline-flex items-center px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold"
        >
          Retour au tableau de bord
        </Link>
      </div>
    );
  }

  const handleSelectTab = (tab: string) => {
    setSearchParams({ tab });
  };

  const selectedPageMeta = CMS_PAGES.find(p => p.id === activeTab);

  return (
    <div className="space-y-6">
      
      {/* Top Banner Guide */}
      <div className="bg-gradient-to-r from-[#6B3E1E] to-[#8C532B] text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-[#E67E22] text-white text-[10px] font-extrabold uppercase rounded-full tracking-wider">
              FAFE CMS ÉDITEUR
            </span>
            <span className="text-white/60 text-xs">| Mode Édition Structurée</span>
          </div>
          <h1 className="text-2xl font-bold font-heading">
            Gestionnaire des Contenus du Site
          </h1>
          <p className="text-xs text-white/80 max-w-2xl mt-1">
            Modifiez en toute autonomie les textes, images, chiffres, membres et coordonnées sans altérer la charte graphique ni la structure du site.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Voir le site public
          </a>
        </div>
      </div>

      {/* Main CMS Layout (Sidebar Navigation + Active Workspace) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Sidebar: Pages & Tools */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Section: Pages Éditables */}
          <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400 px-3 mb-3">
              Pages du Site ({CMS_PAGES.length})
            </h2>

            <nav className="space-y-1">
              {CMS_PAGES.map((page) => {
                const Icon = page.icon;
                const isActive = activeTab === page.id;

                return (
                  <button
                    key={page.id}
                    onClick={() => handleSelectTab(page.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                      isActive 
                        ? 'bg-[#E67E22]/10 text-[#E67E22] border border-[#E67E22]/30 shadow-xs' 
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#E67E22]' : 'text-stone-400'}`} />
                      <span className="truncate">{page.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4 shrink-0 text-[#E67E22]" />}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Section: Outils & Médiathèque */}
          <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400 px-3 mb-3">
              Outils & Historique
            </h2>

            <nav className="space-y-1">
              <button
                onClick={() => handleSelectTab('media')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'media' 
                    ? 'bg-[#E67E22]/10 text-[#E67E22] border border-[#E67E22]/30 shadow-xs' 
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FolderOpen className={`w-4 h-4 shrink-0 ${activeTab === 'media' ? 'text-[#E67E22]' : 'text-stone-400'}`} />
                  <span>Médiathèque</span>
                </div>
                {activeTab === 'media' && <ChevronRight className="w-4 h-4 shrink-0 text-[#E67E22]" />}
              </button>

              <button
                onClick={() => handleSelectTab('history')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'history' 
                    ? 'bg-[#E67E22]/10 text-[#E67E22] border border-[#E67E22]/30 shadow-xs' 
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <History className={`w-4 h-4 shrink-0 ${activeTab === 'history' ? 'text-[#E67E22]' : 'text-stone-400'}`} />
                  <span>Historique & Audit</span>
                </div>
                {activeTab === 'history' && <ChevronRight className="w-4 h-4 shrink-0 text-[#E67E22]" />}
              </button>
            </nav>
          </div>

          {/* Guidelines Box */}
          <div className="bg-stone-50 rounded-2xl border border-stone-200 p-4 text-[11px] text-stone-500 space-y-2">
            <p className="font-bold text-stone-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Principe Fondamental
            </p>
            <p>
              Le design et le code sont verrouillés. Toutes vos modifications de texte et d'images sont appliquées fidèlement au modèle visuel.
            </p>
          </div>

        </div>

        {/* Right Workspace: Editor or Tool */}
        <div className="lg:col-span-9">
          {activeTab === 'media' ? (
            <AdminCMSMedia />
          ) : activeTab === 'history' ? (
            <AdminCMSHistory />
          ) : selectedPageMeta ? (
            <CMSPageEditor
              key={selectedPageMeta.id}
              pageId={selectedPageMeta.id}
              pageTitle={selectedPageMeta.label}
              pageDescription={selectedPageMeta.description}
            />
          ) : null}
        </div>

      </div>

    </div>
  );
}
