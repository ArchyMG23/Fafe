import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User as UserIcon, Search } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../store/auth';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { user } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Accueil', path: '/' },
    { name: 'À propos', path: '/about' },
    { name: 'Nos actions', path: '/actions' },
    { name: 'Entrepreneures', path: '/entrepreneures' },
    { name: 'Pays', path: '/pays' },
    { name: 'Actualités', path: '/actualites' },
    { name: 'Projets', path: '/projets' },
    { name: 'Dons', path: '/dons' },
  ];

  const isActive = (path: string) => location.pathname === path;

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
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-semibold transition-all hover:text-[#E67E22] ${
                isActive(link.path) ? 'text-[#E67E22] relative after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-[#E67E22] after:rounded-full' : 'text-[#6B3E1E]'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-5">
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
                <Button className="bg-[#E67E22] hover:bg-[#c96a1a] text-white shadow-md hover:shadow-lg transition-all rounded-full px-6 font-bold">
                  Rejoindre le FAFE
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden p-2 text-[#6B3E1E] rounded-md hover:bg-orange-50 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="lg:hidden border-t border-stone-100 bg-white absolute top-full left-0 w-full shadow-xl h-[calc(100vh-64px)] overflow-y-auto">
          <div className="flex flex-col p-6 gap-6">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input 
                type="text" 
                placeholder="Rechercher..." 
                className="w-full pl-10 pr-4 py-3 border border-[#6B3E1E]/20 rounded-lg focus:outline-none focus:border-[#E67E22] bg-[#FAF9F6]"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-lg font-medium p-3 rounded-lg transition-colors ${
                    isActive(link.path) ? 'bg-orange-50 text-[#E67E22]' : 'text-[#6B3E1E] hover:bg-stone-50'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
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
