import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User as UserIcon, Search, Globe, ChevronDown, ShoppingCart } from 'lucide-react';
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
    { name: 'Nous', path: '/nous' },
    { name: 'Actualités', path: '/actualites' },
    { name: 'Galerie', path: '/galerie' },
  ];

  const isActive = (path: string) => {
    const basePath = path.split('#')[0];
    if (basePath === '/') return location.pathname === '/';
    if (basePath === '/nous') return location.pathname === '/nous' || location.pathname === '/a-propos' || location.pathname === '/nos-actions';
    if (basePath === '/actualites') return location.pathname === '/actualites' || location.pathname === '/actualites-evenements' || location.pathname === '/evenements';
    return location.pathname.startsWith(basePath);
  };

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-stone-100' : 'bg-white border-b border-stone-100/50'}`}>
      <div className={`mx-auto flex items-center justify-between transition-all duration-300 px-4 md:px-8 max-w-7xl ${isScrolled ? 'h-16' : 'h-20'}`}>
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className={`bg-[#E67E22] rounded-full flex items-center justify-center text-white font-bold ring-1 ring-[#D4AF37]/50 transition-all duration-300 group-hover:scale-105 ${isScrolled ? 'w-10 h-10 text-lg' : 'w-11 h-11 text-xl'}`}>F</div>
          <div className="flex flex-col">
            <span className={`font-bold tracking-tight leading-none text-[#6B3E1E] transition-all duration-300 ${isScrolled ? 'text-lg' : 'text-xl'}`}>FAFE</span>
            <span className={`uppercase tracking-widest text-[#6B3E1E]/60 transition-all duration-300 ${isScrolled ? 'text-[8px]' : 'text-[9px]'}`}>Panafricaine</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden xl:flex items-center gap-6 h-full">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`relative py-2 text-sm font-medium transition-colors group ${
                isActive(link.path) ? 'text-[#E67E22]' : 'text-stone-500 hover:text-[#6B3E1E]'
              }`}
            >
              {link.name}
              <span className={`absolute left-0 bottom-0 h-[2px] bg-[#E67E22] transition-all duration-300 ${isActive(link.path) ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
            </Link>
          ))}

          <Link to={user ? "/hub/dashboard" : "/hub/connexion"} className="relative py-2 text-sm font-medium transition-colors text-stone-500 hover:text-[#6B3E1E] flex items-center gap-1.5 group">
            FAFE Hub
            <span className="absolute left-0 bottom-0 h-[2px] bg-[#E67E22] transition-all duration-300 w-0 group-hover:w-full"></span>
          </Link>

          <Link to="/dons" className="relative py-2 text-sm font-medium transition-colors text-[#E67E22] hover:text-[#c96a1a] group">
            Don
            <span className="absolute left-0 bottom-0 h-[2px] bg-[#E67E22] transition-all duration-300 w-0 group-hover:w-full"></span>
          </Link>
          
          <div className="flex items-center gap-1 ml-4 border-l border-stone-200 pl-4">
            <button onClick={toggleLanguage} aria-label="Changer de langue" className="text-xs font-bold uppercase text-stone-400 hover:text-[#6B3E1E] transition-colors p-2 rounded-full hover:bg-stone-50">
              {language}
            </button>
            <button aria-label="Rechercher" className="text-stone-400 hover:text-[#6B3E1E] transition-colors p-2 rounded-full hover:bg-stone-50">
              <Search className="w-4 h-4" />
            </button>
            <Link to="/marketplace" aria-label="Marketplace" title="Marketplace" className="text-[#6B3E1E] hover:text-[#E67E22] transition-colors p-2 rounded-full hover:bg-stone-50 group">
              <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </Link>
          </div>
        </nav>

        {/* Mobile Menu Toggle & Icons */}
        <div className="flex items-center gap-3 xl:hidden">
          <Link to="/marketplace" aria-label="Marketplace" className="p-2 text-[#6B3E1E] hover:text-[#E67E22] transition-colors rounded-full hover:bg-stone-50">
            <ShoppingCart className="w-5 h-5" />
          </Link>
          <button
            className="p-2 text-[#6B3E1E] hover:text-[#E67E22] transition-colors rounded-full hover:bg-stone-50"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="xl:hidden absolute top-full left-0 w-full bg-white shadow-xl h-[calc(100vh-4rem)] overflow-y-auto border-t border-stone-100">
          <div className="flex flex-col p-6 gap-6">
            <div className="flex items-center justify-between mb-2">
               <button onClick={toggleLanguage} className="flex items-center gap-2 px-4 py-2 bg-stone-50 rounded-lg text-stone-600 font-medium text-sm">
                 <Globe className="w-4 h-4" />
                 {language === 'fr' ? 'Français' : 'English'}
               </button>
               <button className="p-2 text-stone-400 bg-stone-50 rounded-lg">
                 <Search className="w-5 h-5" />
               </button>
            </div>

            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link 
                  key={link.path}
                  to={link.path} 
                  className={`text-lg font-medium p-3 rounded-xl transition-colors ${isActive(link.path) ? 'bg-orange-50 text-[#E67E22]' : 'text-[#6B3E1E] hover:bg-stone-50'}`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              
              <div className="h-px bg-stone-100 my-4" />

              <Link to={user ? "/hub/dashboard" : "/hub/connexion"} className="text-lg font-medium p-3 rounded-xl text-[#6B3E1E] hover:bg-stone-50 flex items-center gap-3 transition-colors" onClick={() => setIsOpen(false)}>
                <UserIcon className="w-5 h-5 text-[#D4AF37]" />
                FAFE Hub
              </Link>
              
              <Link to="/dons" className="text-lg font-medium p-3 rounded-xl text-[#E67E22] hover:bg-orange-50 transition-colors" onClick={() => setIsOpen(false)}>
                Don
              </Link>
              
              <Link to="/marketplace" className="text-lg font-medium p-3 rounded-xl text-[#6B3E1E] hover:bg-stone-50 flex items-center gap-3 transition-colors" onClick={() => setIsOpen(false)}>
                <ShoppingCart className="w-5 h-5" />
                Marketplace
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
