import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User as UserIcon, Search, Globe, ChevronDown } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../store/auth';
import { useLanguageStore } from '../../store/language';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  const location = useLocation();
  const { currentUser: user } = useAuthStore();
  const { language, setLanguage } = useLanguageStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'en' : 'fr');
  };

  const navLinks = [
    { name: 'Accueil', path: '/' },
    { 
      name: 'À propos', 
      path: '/a-propos',
      children: [
        { name: 'Historique', path: '/a-propos/historique' },
        { name: 'Vision & Mission', path: '/a-propos/vision' },
        { name: 'Valeurs', path: '/a-propos/valeurs' },
        { name: 'Gouvernance', path: '/a-propos/gouvernance' },
        { name: 'Bureau exécutif', path: '/a-propos/bureau-executif' },
        { name: 'Équipe opérationnelle', path: '/a-propos/equipe' },
        { name: 'Partenaires', path: '/a-propos/partenaires' },
        { name: 'Rapports d\'activités', path: '/a-propos/rapports' }
      ]
    },
    { 
      name: 'Nos actions', 
      path: '/actions',
      children: [
        { name: 'Formation', path: '/actions/formation' },
        { name: 'Projets sociaux', path: '/projets-sociaux' },
        { name: 'Événements', path: '/evenements' },
        { name: 'Commerce', path: '/actions/commerce' },
        { name: 'Réseautage', path: '/actions/reseautage' },
        { name: 'Mobilisation des ressources', path: '/actions/financement' }
      ]
    },
    { name: 'Entrepreneures', path: '/entrepreneures' },
    { name: 'Actualités', path: '/actualites' },
    { name: 'Événements', path: '/evenements' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    if (path === '/a-propos') return location.pathname === '/a-propos' || location.pathname.startsWith('/a-propos/');
    if (path === '/actions') return location.pathname === '/actions' || location.pathname.startsWith('/actions/');
    return location.pathname.startsWith(path);
  };

  const handleDropdownEnter = (name: string) => {
    setActiveDropdown(name);
  };

  const handleDropdownLeave = () => {
    setActiveDropdown(null);
  };

  return (
    <header className={`sticky top-0 z-50 w-full bg-white transition-all duration-300 ${isScrolled ? 'shadow-md border-b-0' : 'border-b border-[#D4AF37]/20 shadow-sm'}`}>
      <div className={`container mx-auto px-4 md:px-6 flex items-center justify-between transition-all duration-300 ${isScrolled ? 'h-16' : 'h-24'}`}>
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className={`bg-[#E67E22] rounded-full flex items-center justify-center text-white font-bold ring-2 ring-[#D4AF37] transition-all duration-300 group-hover:scale-105 ${isScrolled ? 'w-10 h-10 text-lg' : 'w-14 h-14 text-2xl'}`}>F</div>
          <div className="flex flex-col">
            <span className={`font-bold tracking-tight leading-none text-[#6B3E1E] transition-all duration-300 ${isScrolled ? 'text-lg' : 'text-2xl'}`}>FAFE</span>
            <span className={`uppercase tracking-widest text-[#6B3E1E]/60 transition-all duration-300 ${isScrolled ? 'text-[8px]' : 'text-[11px]'}`}>Panafricaine</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6 h-full">
          {navLinks.map((link) => (
            <div 
              key={link.path}
              className="relative h-full flex items-center"
              onMouseEnter={() => link.children && handleDropdownEnter(link.name)}
              onMouseLeave={handleDropdownLeave}
            >
              <Link
                to={link.path}
                className={`flex items-center gap-1 text-sm font-semibold transition-all hover:text-[#E67E22] py-2 ${
                  isActive(link.path) ? 'text-[#E67E22] relative after:absolute after:bottom-[0px] after:left-0 after:w-full after:h-0.5 after:bg-[#E67E22] after:rounded-full' : 'text-[#6B3E1E]'
                }`}
              >
                {link.name}
                {link.children && <ChevronDown className="w-4 h-4" />}
              </Link>
              
              {/* Dropdown Menu */}
              {link.children && activeDropdown === link.name && (
                <div className="absolute top-full left-0 w-64 bg-white shadow-xl border border-stone-100 rounded-xl py-2 z-50">
                  {link.children.map((child) => (
                    <Link
                      key={child.path}
                      to={child.path}
                      className="block px-5 py-3 text-sm font-medium text-[#6B3E1E] hover:bg-orange-50 hover:text-[#E67E22] transition-colors"
                      onClick={() => setActiveDropdown(null)}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-3 xl:gap-5">
          <button onClick={toggleLanguage} className="p-2 flex items-center gap-1 text-[#6B3E1E] hover:text-[#E67E22] transition-colors rounded-full hover:bg-orange-50 font-bold text-sm uppercase">
            <Globe className="w-5 h-5" />
            {language}
          </button>
          
          <button className="p-2 text-[#6B3E1E] hover:text-[#E67E22] transition-colors rounded-full hover:bg-orange-50">
            <Search className="w-5 h-5" />
          </button>
          
          {user ? (
            <Link to="/dashboard">
              <Button variant="outline" className="gap-2 border-[#6B3E1E]/20 text-[#6B3E1E] hover:bg-[#6B3E1E]/5 hover:border-[#6B3E1E]">
                <UserIcon className="w-4 h-4" />
                Mon Espace
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/connexion" className="text-sm font-semibold text-[#6B3E1E] hover:text-[#E67E22] transition-colors">
                Connexion
              </Link>
              <Link to="/inscription">
                <Button className="bg-[#E67E22] hover:bg-[#c96a1a] text-white shadow-md hover:shadow-lg transition-all rounded-full px-5 xl:px-6 font-bold whitespace-nowrap">
                  Rejoindre le FAFE
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-4 lg:hidden">
          <button className="text-[#6B3E1E] hover:text-[#E67E22]">
            <Search className="w-6 h-6" />
          </button>
          <button
            className="p-2 text-[#6B3E1E] rounded-md hover:bg-orange-50 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="lg:hidden border-t border-stone-100 bg-white absolute top-full left-0 w-full shadow-xl h-[calc(100vh-64px)] overflow-y-auto">
          <div className="flex flex-col p-6 gap-6">
            <div className="flex justify-between items-center mb-2">
              <button onClick={toggleLanguage} className="flex items-center gap-2 px-4 py-2 bg-stone-100 rounded-lg text-[#6B3E1E] font-bold text-sm uppercase">
                <Globe className="w-4 h-4" />
                {language === 'fr' ? 'Français' : 'English'}
              </button>
            </div>
            
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <div key={link.path} className="flex flex-col">
                  <div 
                    className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                      isActive(link.path) && !link.children ? 'bg-orange-50 text-[#E67E22]' : 'text-[#6B3E1E] hover:bg-stone-50'
                    }`}
                  >
                    <Link 
                      to={link.path} 
                      className={`text-lg font-medium flex-1 ${isActive(link.path) ? 'text-[#E67E22]' : ''}`}
                      onClick={() => !link.children && setIsOpen(false)}
                    >
                      {link.name}
                    </Link>
                    {link.children && (
                      <button 
                        className="p-2"
                        onClick={() => setActiveDropdown(activeDropdown === link.name ? null : link.name)}
                      >
                        <ChevronDown className={`w-5 h-5 transition-transform ${activeDropdown === link.name ? 'rotate-180' : ''}`} />
                      </button>
                    )}
                  </div>
                  
                  {link.children && activeDropdown === link.name && (
                    <div className="pl-4 pr-2 py-2 flex flex-col gap-1 border-l-2 border-[#E67E22]/20 ml-4 mb-2">
                      {link.children.map(child => (
                        <Link
                          key={child.path}
                          to={child.path}
                          className="p-2 text-stone-600 hover:text-[#E67E22]"
                          onClick={() => setIsOpen(false)}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              <Link
                to="/dons"
                className="text-lg font-medium p-3 rounded-lg transition-colors text-[#6B3E1E] hover:bg-stone-50"
                onClick={() => setIsOpen(false)}
              >
                Faire un don
              </Link>
            </div>

            <div className="h-px bg-stone-100 my-2" />
            
            {user ? (
              <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                <Button className="w-full gap-2 py-6 rounded-xl bg-[#6B3E1E] hover:bg-[#522d14] text-white">
                  <UserIcon className="w-5 h-5" />
                  Mon Espace
                </Button>
              </Link>
            ) : (
              <div className="flex flex-col gap-4 pb-12">
                <Link to="/connexion" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full py-6 rounded-xl border-[#6B3E1E]/20 text-[#6B3E1E] hover:bg-stone-50">Se connecter</Button>
                </Link>
                <Link to="/inscription" onClick={() => setIsOpen(false)}>
                  <Button className="w-full py-6 rounded-xl bg-[#E67E22] hover:bg-[#c96a1a] text-white shadow-lg font-bold">Rejoindre le FAFE</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
