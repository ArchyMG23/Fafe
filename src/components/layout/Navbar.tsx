import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  User as UserIcon,
  Search,
  Globe,
  ChevronDown,
  ShoppingCart,
  Heart,
  Briefcase,
  Users,
  Compass,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/Button';
import { FafeLogo } from '../ui/FafeLogo';
import { useAuthStore } from '../../store/auth';
import { useLanguageStore } from '../../store/language';
import { useCartStore } from '../../store/cart';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const location = useLocation();
  const { currentUser: user } = useAuthStore();
  const { language, setLanguage } = useLanguageStore();
  const cartItemsCount = useCartStore(state => state.getTotalItems());


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsOpen(false);
    setOpenSubmenu(null);
  }, [location.pathname, location.hash]);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'en' : 'fr');
  };

  const isActive = (path: string) => {
    const basePath = path.split('#')[0];
    if (basePath === '/') return location.pathname === '/' && !location.hash;
    if (basePath === '/nous') {
      return location.pathname === '/nous' || location.pathname === '/a-propos' || location.pathname === '/nos-actions';
    }
    if (basePath === '/actualites') {
      return (
        location.pathname === '/actualites' ||
        location.pathname === '/actualites-evenements' ||
        location.pathname === '/evenements'
      );
    }
    return location.pathname.startsWith(basePath);
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-stone-100'
          : 'bg-white border-b border-stone-100/70'
      }`}
    >
      <div
        className={`w-full mx-auto flex items-center justify-between transition-all duration-300 px-4 md:px-8 lg:px-12 max-w-[1600px] ${
          isScrolled ? 'h-16' : 'h-18 md:h-20'
        }`}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center group py-1 z-50 shrink-0" aria-label="Accueil FAFE">
          {/* Mobile Logo */}
          <div className="md:hidden">
            <FafeLogo size="sm" showSubtitle={false} className="group-hover:opacity-95 transition-opacity" />
          </div>
          {/* Desktop Logo */}
          <div className="hidden md:block">
            <FafeLogo size={isScrolled ? 'sm' : 'md'} className="group-hover:opacity-95 transition-opacity" />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center justify-center flex-1 gap-8 xl:gap-14 h-full mx-8 xl:mx-20">
          <Link
            to="/"
            className={`relative py-2 text-sm font-semibold transition-colors ${
              isActive('/') ? 'text-[#E67E22]' : 'text-stone-600 hover:text-[#6B3E1E]'
            }`}
          >
            Accueil
            {isActive('/') && (
              <span className="absolute left-0 bottom-0 h-[2px] w-full bg-[#E67E22] rounded-full" />
            )}
          </Link>

          <Link
            to="/nous"
            className={`relative py-2 text-sm font-semibold transition-colors ${
              isActive('/nous') ? 'text-[#E67E22]' : 'text-stone-600 hover:text-[#6B3E1E]'
            }`}
          >
            Nous
            {isActive('/nous') && (
              <span className="absolute left-0 bottom-0 h-[2px] w-full bg-[#E67E22] rounded-full" />
            )}
          </Link>

          <Link
            to="/entrepreneures"
            className={`relative py-2 text-sm font-semibold transition-colors ${
              isActive('/entrepreneures') ? 'text-[#E67E22]' : 'text-stone-600 hover:text-[#6B3E1E]'
            }`}
          >
            Entrepreneures
            {isActive('/entrepreneures') && (
              <span className="absolute left-0 bottom-0 h-[2px] w-full bg-[#E67E22] rounded-full" />
            )}
          </Link>

          <Link
            to="/actualites"
            className={`relative py-2 text-sm font-semibold transition-colors ${
              isActive('/actualites') && !isActive('/evenements') ? 'text-[#E67E22]' : 'text-stone-600 hover:text-[#6B3E1E]'
            }`}
          >
            Actualités
            {isActive('/actualites') && !isActive('/evenements') && (
              <span className="absolute left-0 bottom-0 h-[2px] w-full bg-[#E67E22] rounded-full" />
            )}
          </Link>

          <Link
            to="/evenements"
            className={`relative py-2 text-sm font-semibold transition-colors ${
              isActive('/evenements') ? 'text-[#E67E22]' : 'text-stone-600 hover:text-[#6B3E1E]'
            }`}
          >
            Événements
            {isActive('/evenements') && (
              <span className="absolute left-0 bottom-0 h-[2px] w-full bg-[#E67E22] rounded-full" />
            )}
          </Link>

          <Link
            to="/dons"
            className={`relative py-2 text-sm font-semibold transition-colors ${
              isActive('/dons') ? 'text-[#E67E22]' : 'text-stone-600 hover:text-[#6B3E1E]'
            }`}
          >
            Don
            {isActive('/dons') && (
              <span className="absolute left-0 bottom-0 h-[2px] w-full bg-[#E67E22] rounded-full" />
            )}
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-2 xl:gap-3 shrink-0 border-l border-stone-200 pl-6 xl:pl-8 ml-auto">
          <Link
            to="/recherche"
            aria-label="Recherche"
            title="Recherche"
            className="text-stone-500 hover:text-[#6B3E1E] transition-colors p-2 rounded-full hover:bg-stone-50"
          >
            <Search className="w-5 h-5" />
          </Link>
          
          <Link
            to="/marketplace"
            aria-label="Marketplace FAFE"
            title="Marketplace"
            className="text-stone-500 hover:text-[#E67E22] transition-colors p-2 rounded-full hover:bg-stone-50 relative"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartItemsCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full">
                {cartItemsCount}
              </span>
            )}
          </Link>
          
          <button
            onClick={toggleLanguage}
            aria-label="Changer de langue"
            className="text-xs font-bold uppercase text-stone-500 hover:text-[#6B3E1E] transition-colors p-2 rounded-full hover:bg-stone-50"
          >
            {language}
          </button>
          
          {user ? (
            <Link to="/hub/dashboard" className="ml-2">
              <Button className="bg-[#6B3E1E] hover:bg-[#532f17] text-white py-1.5 px-4 rounded-full font-bold text-xs shadow-md">
                Espace Membre
              </Button>
            </Link>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Link to="/hub/connexion">
                <Button variant="outline" className="border-stone-200 text-stone-700 hover:bg-stone-50 py-1.5 px-4 rounded-full font-bold text-xs">
                  Connexion
                </Button>
              </Link>
              <Link to="/rejoindre">
                <Button className="bg-[#E67E22] hover:bg-[#c96a1a] text-white py-1.5 px-4 rounded-full font-bold text-xs shadow-md">
                  Rejoindre
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Header Actions (Compact, Thumb-friendly) */}
        <div className="flex items-center gap-1 sm:gap-2 lg:hidden">
          <Link
            to="/marketplace/panier"
            aria-label="Marketplace"
            className="p-2.5 text-[#6B3E1E] hover:text-[#E67E22] rounded-full hover:bg-stone-100 active:scale-95 transition-transform relative"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartItemsCount > 0 && (
              <span className="absolute top-1 right-1 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full">
                {cartItemsCount}
              </span>
            )}
          </Link>

          <button
            className="p-2.5 text-[#6B3E1E] hover:text-[#E67E22] rounded-full hover:bg-stone-100 active:scale-95 transition-transform ml-0.5"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="w-6 h-6 text-[#E67E22]" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Polished, Fast & Thumb-friendly) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-x-0 top-[64px] bottom-0 bg-white/98 backdrop-blur-md z-50 overflow-y-auto border-t border-stone-100 flex flex-col shadow-2xl"
          >
            <div className="w-full mx-auto px-5 py-6 flex-grow flex flex-col justify-between max-w-lg">
              
              <div className="space-y-6">
                
                {/* 1. ACCUEIL */}
                <div>
                  <Link
                    to="/"
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between p-3.5 rounded-xl font-bold text-base transition-colors ${
                      isActive('/') ? 'bg-[#E67E22]/10 text-[#E67E22]' : 'text-[#6B3E1E] hover:bg-stone-50'
                    }`}
                  >
                    <span>ACCUEIL</span>
                    <ArrowRight className="w-4 h-4 opacity-50" />
                  </Link>
                </div>

                {/* 2. NOUS */}
                <div className="border-t border-stone-100 pt-3">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest px-3 mb-1 block">
                    NOUS
                  </span>
                  <div className="space-y-1">
                    <Link
                      to="/nous"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-xl text-stone-700 hover:text-[#6B3E1E] hover:bg-stone-50 text-sm font-semibold transition-colors"
                    >
                      <span>Présentation & Vision</span>
                    </Link>
                    <Link
                      to="/nous#categories"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-xl text-stone-700 hover:text-[#6B3E1E] hover:bg-stone-50 text-sm font-semibold transition-colors"
                    >
                      <span>Nos actions & programmes</span>
                    </Link>
                    <Link
                      to="/nous#contact"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-xl text-stone-700 hover:text-[#6B3E1E] hover:bg-stone-50 text-sm font-semibold transition-colors"
                    >
                      <span>Contact & Secrétariat</span>
                    </Link>
                  </div>
                </div>

                {/* 3. ACTUALITÉS & MÉDIAS */}
                <div className="border-t border-stone-100 pt-3">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest px-3 mb-1 block">
                    ACTUALITÉS & ÉDITORIAL
                  </span>
                  <div className="space-y-1">
                    <Link
                      to="/actualites"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-xl text-stone-700 hover:text-[#6B3E1E] hover:bg-stone-50 text-sm font-semibold transition-colors"
                    >
                      <span>Actualités & Événements</span>
                    </Link>
                    <Link
                      to="/galerie"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-xl text-stone-700 hover:text-[#6B3E1E] hover:bg-stone-50 text-sm font-semibold transition-colors"
                    >
                      <span>Médiathèque (Photos & Vidéos)</span>
                    </Link>
                  </div>
                </div>

                {/* 4. ENTREPRENEURES */}
                <div className="border-t border-stone-100 pt-3">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest px-3 mb-1 block">
                    ENTREPRENEURES
                  </span>
                  <Link
                    to="/entrepreneures"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl text-stone-700 hover:text-[#6B3E1E] hover:bg-stone-50 text-sm font-semibold transition-colors"
                  >
                    <span>Annuaire Panafricain</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#6B3E1E]">
                      Talents
                    </span>
                  </Link>
                </div>

                {/* 5. SERVICES & HUB */}
                <div className="border-t border-stone-100 pt-3">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest px-3 mb-1 block">
                    SERVICES & ENGAGEMENT
                  </span>
                  <div className="space-y-1">
                    <Link
                      to={user ? "/hub/dashboard" : "/hub"}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between p-3 rounded-xl text-stone-700 hover:text-[#6B3E1E] hover:bg-stone-50 text-sm font-semibold transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                        <span>FAFE Hub</span>
                      </div>
                      <span className="text-xs text-stone-400">Espace membre</span>
                    </Link>

                    <Link
                      to="/marketplace"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between p-3 rounded-xl text-stone-700 hover:text-[#6B3E1E] hover:bg-stone-50 text-sm font-semibold transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-[#6B3E1E]" />
                        <span>Marketplace</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-stone-400">Boutique</span>
                        {cartItemsCount > 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 mt-1">
                            {cartItemsCount} article{cartItemsCount > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </Link>

                    <Link
                      to="/dons"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between p-3 rounded-xl bg-orange-50/80 text-[#E67E22] text-sm font-bold transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-[#E67E22]" />
                        <span>Faire un don</span>
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wider">Soutenir</span>
                    </Link>
                  </div>
                </div>

              </div>

              {/* Bottom Actions: Connexion / Inscription */}
              <div className="pt-6 mt-6 border-t border-stone-200/80 space-y-3 pb-4">
                {user ? (
                  <Link to="/hub/dashboard" onClick={() => setIsOpen(false)} className="block">
                    <Button className="w-full bg-[#6B3E1E] hover:bg-[#532f17] text-white py-3.5 rounded-full font-bold text-sm shadow-md flex items-center justify-center gap-2">
                      <UserIcon className="w-4 h-4 text-[#D4AF37]" />
                      Mon Espace Membre
                    </Button>
                  </Link>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Link to="/hub/connexion" onClick={() => setIsOpen(false)}>
                      <Button
                        variant="outline"
                        className="w-full border-stone-200 text-stone-700 hover:bg-stone-50 py-3 rounded-full font-bold text-xs sm:text-sm"
                      >
                        Connexion
                      </Button>
                    </Link>
                    <Link to="/rejoindre" onClick={() => setIsOpen(false)}>
                      <Button className="w-full bg-[#E67E22] hover:bg-[#c96a1a] text-white py-3 rounded-full font-bold text-xs sm:text-sm shadow-md">
                        Rejoindre le FAFE
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
