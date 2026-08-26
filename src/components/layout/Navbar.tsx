import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User as UserIcon, Search, Globe, ChevronDown } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../store/auth';
import { useLanguageStore } from '../../store/language';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
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
    }, [location.pathname]);

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'en' : 'fr');
  };

  const navLinks = [
    { name: 'Accueil', path: '/' },
    { name: 'À propos', path: '/a-propos' },
    { name: 'Nos actions', path: '/nos-actions' },
    { name: 'Marketplace', path: '/marketplace' },
    { name: 'Entrepreneures', path: '/entrepreneures' },
    { name: 'Actualités', path: '/actualites' },
    { name: 'Événements', path: '/evenements' },
  ];

  const isActive = (path: string) => {
    const basePath = path.split('#')[0];
    if (basePath === '/') return location.pathname === '/';
    if (basePath === '/a-propos') return location.pathname === '/a-propos';
    if (basePath === '/actions') return location.pathname === '/actions' || location.pathname.startsWith('/actions/');
    return location.pathname.startsWith(basePath);
  };

  return (
    <header className={`sticky top-0 z-50 w-full bg-white transition-all duration-300 ${isScrolled ? 'shadow-md border-b-0' : 'border-b border-[#D4AF37]/20 shadow-sm'}`}>
      <div className={`container mx-auto px-4 md:px-6 flex items-center justify-between transition-all duration-300 ${isScrolled ? 'h-16' : 'h-20'}`}>
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className={`bg-[#E67E22] rounded-full flex items-center justify-center text-white font-bold ring-2 ring-[#D4AF37] transition-all duration-300 group-hover:scale-105 ${isScrolled ? 'w-10 h-10 text-lg' : 'w-12 h-12 text-xl'}`}>F</div>
          <div className="flex flex-col">
            <span className={`font-bold tracking-tight leading-none text-[#6B3E1E] transition-all duration-300 ${isScrolled ? 'text-lg' : 'text-xl'}`}>FAFE</span>
            <span className={`uppercase tracking-widest text-[#6B3E1E]/60 transition-all duration-300 ${isScrolled ? 'text-[8px]' : 'text-[10px]'}`}>Panafricaine</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6 h-full">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-1 text-sm font-semibold transition-all hover:text-[#E67E22] ${
                isActive(link.path) ? 'text-[#E67E22] relative after:absolute after:-bottom-2 after:left-0 after:w-full after:h-0.5 after:bg-[#E67E22] after:rounded-full' : 'text-[#6B3E1E]'
              }`}
            >
              {link.name}
            </Link>
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
          
          <Link to="/dons" className="hidden xl:flex text-sm font-semibold text-[#E67E22] hover:text-[#c96a1a] transition-colors items-center gap-1">
            Faire un don
          </Link>

          {user ? (
            <Link to="/hub/dashboard">
              <Button variant="outline" className="gap-2 border-[#6B3E1E]/20 text-[#6B3E1E] hover:bg-[#6B3E1E]/5 hover:border-[#6B3E1E]">
                <UserIcon className="w-4 h-4" />Mon Espace FAFE</Button>
            </Link>
          ) : (
            <>
              <Link to="/hub/connexion" className="text-sm font-semibold text-[#6B3E1E] hover:text-[#E67E22] transition-colors">
                Connexion
              </Link>
              <Link to="/rejoindre">
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
                <Link 
                  key={link.path}
                  to={link.path} 
                  className={`flex items-center justify-between p-3 rounded-lg text-lg font-medium transition-colors ${
                    isActive(link.path) ? 'bg-orange-50 text-[#E67E22]' : 'text-[#6B3E1E] hover:bg-stone-50'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
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
              <Link to="/hub/dashboard" onClick={() => setIsOpen(false)}>
                <Button className="w-full gap-2 py-6 rounded-xl bg-[#6B3E1E] hover:bg-[#522d14] text-white">
                  <UserIcon className="w-5 h-5" />Mon Espace FAFE</Button>
              </Link>
            ) : (
              <div className="flex flex-col gap-4 pb-12">
                <Link to="/hub/connexion" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full py-6 rounded-xl border-[#6B3E1E]/20 text-[#6B3E1E] hover:bg-stone-50">Se connecter</Button>
                </Link>
                <Link to="/rejoindre" onClick={() => setIsOpen(false)}>
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
