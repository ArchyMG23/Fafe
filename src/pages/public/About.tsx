import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { ChevronRight, LayoutTemplate } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getCMSGlobal } from '../../lib/cms';

const aboutNav = [
  { path: "/a-propos/historique", label: "Historique", id: 'historique' },
  { path: "/a-propos/vision", label: "Vision & Mission", id: 'vision' },
  { path: "/a-propos/valeurs", label: "Nos Valeurs", id: 'valeurs' },
  { path: "/a-propos/gouvernance", label: "Gouvernance", id: 'gouvernance' },
  { path: "/a-propos/bureau-executif", label: "Bureau Exécutif", id: 'bureau-executif' },
  { path: "/a-propos/partenaires", label: "Partenaires", id: 'partenaires' },
];

function PlaceholderContent({ title, content }: { title: string, content?: string }) {
  return (
    <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-stone-200 min-h-[400px]">
      <h2 className="text-3xl font-bold font-heading text-[#6B3E1E] mb-8">{title}</h2>
      {content ? (
        <div className="prose prose-stone max-w-none text-stone-600 leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: content }} />
      ) : (
        <div className="flex flex-col items-center justify-center h-48 text-center bg-stone-50 rounded-xl border border-dashed border-stone-200">
          <LayoutTemplate className="w-12 h-12 text-stone-300 mb-4" />
          <h3 className="text-lg font-bold text-stone-500 mb-2">Contenu en cours de rédaction</h3>
          <p className="text-stone-400 text-sm max-w-sm">
            Les informations officielles concernant cette section seront publiées prochainement.
          </p>
        </div>
      )}
    </div>
  );
}

export function About() {
  const location = useLocation();
  const [cmsData, setCmsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCMS = async () => {
      try {
        const data = await getCMSGlobal();
        setCmsData(data?.about || {});
      } catch (err) {
        console.error("Error fetching about CMS data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCMS();
  }, []);

  return (
    <div className="bg-[#FAF9F6] min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-heading text-[#6B3E1E] mb-4">
            À Propos du FAFE
          </h1>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            Découvrez notre histoire, notre vision et les instances dirigeantes du Forum des Actions des Femmes Entrepreneures.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden sticky top-24">
              <nav className="flex flex-col">
                <Link 
                  to="/a-propos"
                  className={`flex items-center justify-between p-4 border-b border-stone-100 transition-colors ${
                    location.pathname === '/a-propos' || location.pathname === '/a-propos/' ? 'bg-[#E67E22]/10 text-[#E67E22] font-bold' : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  Présentation
                  <ChevronRight className={`w-4 h-4 ${location.pathname === '/a-propos' || location.pathname === '/a-propos/' ? 'text-[#E67E22]' : 'text-stone-400'}`} />
                </Link>
                {aboutNav.map((item) => {
                  const isActive = location.pathname.includes(item.path);
                  return (
                    <Link 
                      key={item.path} 
                      to={item.path}
                      className={`flex items-center justify-between p-4 border-b border-stone-100 last:border-0 transition-colors ${
                        isActive ? 'bg-[#E67E22]/10 text-[#E67E22] font-bold' : 'text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {item.label}
                      <ChevronRight className={`w-4 h-4 ${isActive ? 'text-[#E67E22]' : 'text-stone-400'}`} />
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            {loading ? (
              <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-stone-200 min-h-[400px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E67E22]"></div>
              </div>
            ) : (
              <Routes>
                <Route path="/" element={<PlaceholderContent title="Bienvenue au FAFE" content={cmsData?.presentation?.fr} />} />
                <Route path="historique" element={<PlaceholderContent title="Notre Historique" content={cmsData?.historique?.fr} />} />
                <Route path="vision" element={<PlaceholderContent title="Vision & Mission" content={cmsData?.vision?.fr} />} />
                <Route path="valeurs" element={<PlaceholderContent title="Nos Valeurs" content={cmsData?.valeurs?.fr} />} />
                <Route path="gouvernance" element={<PlaceholderContent title="Gouvernance" content={cmsData?.gouvernance?.fr} />} />
                <Route path="bureau-executif" element={<PlaceholderContent title="Le Bureau Exécutif" content={cmsData?.bureauExecutif?.fr} />} />
                <Route path="partenaires" element={<PlaceholderContent title="Nos Partenaires" content={cmsData?.partenaires?.fr} />} />
                <Route path="rapports" element={<PlaceholderContent title="Rapports d'activité" content={cmsData?.rapports?.fr} />} />
              </Routes>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
