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
    <>
      <header
      className={`fixed top-0 z-50 w-full transition-all duration-500 ${isScrolled ? 'bg-[#063F3A]/80 backdrop-blur-lg shadow-md border-b border-white/10 py-1' : 'bg-[#063F3A]/80 backdrop-blur-lg py-2'}`}
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
            <FafeLogo variant="light" size="sm" showSubtitle={false} className="group-hover:opacity-95 transition-opacity" />
          </div>
          {/* Laptop (1024px - 1279px) Logo: compact without long subtitle to give room for nav */}
          <div className="hidden md:block xl:hidden">
            <FafeLogo variant="light" size="sm" showSubtitle={false} className="group-hover:opacity-95 transition-opacity" />
          </div>
          {/* Large Desktop Logo */}
          <div className="hidden xl:block">
            <FafeLogo variant="light" size={isScrolled ? "sm" : "md"} showSubtitle={!isScrolled} className="group-hover:opacity-95 transition-opacity" />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center justify-center flex-1 gap-2.5 lg:gap-3.5 xl:gap-6 2xl:gap-8 h-full mx-2 lg:mx-3 xl:mx-6">
          <Link
            to="/"
            className={`relative py-2 text-xs xl:text-sm font-semibold whitespace-nowrap transition-colors ${
              isActive('/') ? 'text-white font-bold drop-shadow-sm' : 'text-white/80 hover:text-white'
            }`}
          >
            Accueil
            {isActive('/') && (
              <span className="absolute left-0 bottom-0 h-[2px] w-full bg-[#C8102E] rounded-full" />
            )}
          </Link>

          <Link
            to="/nous"
            className={`relative py-2 text-xs xl:text-sm font-semibold whitespace-nowrap transition-colors ${
              isActive('/nous') ? 'text-white font-bold drop-shadow-sm' : 'text-white/80 hover:text-white'
            }`}
          >
            Nous
            {isActive('/nous') && (
              <span className="absolute left-0 bottom-0 h-[2px] w-full bg-[#C8102E] rounded-full" />
            )}
          </Link>

          <Link
            to="/entrepreneures"
            className={`relative py-2 text-xs xl:text-sm font-semibold whitespace-nowrap transition-colors ${
              isActive('/entrepreneures') ? 'text-white font-bold drop-shadow-sm' : 'text-white/80 hover:text-white'
            }`}
          >
            Entrepreneures
            {isActive('/entrepreneures') && (
              <span className="absolute left-0 bottom-0 h-[2px] w-full bg-[#C8102E] rounded-full" />
            )}
          </Link>

          <Link
            to="/actualites"
            className={`relative py-2 text-xs xl:text-sm font-semibold whitespace-nowrap transition-colors ${
              isActive('/actualites') && !isActive('/evenements') ? 'text-white font-bold drop-shadow-sm' : 'text-white/80 hover:text-white'
            }`}
          >
            Actualités
            {isActive('/actualites') && !isActive('/evenements') && (
              <span className="absolute left-0 bottom-0 h-[2px] w-full bg-[#C8102E] rounded-full" />
            )}
          </Link>

          <Link
            to="/evenements"
            className={`relative py-2 text-xs xl:text-sm font-semibold whitespace-nowrap transition-colors ${
              isActive('/evenements') ? 'text-white font-bold drop-shadow-sm' : 'text-white/80 hover:text-white'
            }`}
          >
            Événements
            {isActive('/evenements') && (
              <span className="absolute left-0 bottom-0 h-[2px] w-full bg-[#C8102E] rounded-full" />
            )}
          </Link>

          <Link
            to="/marketplace"
            className={`relative py-2 text-xs xl:text-sm font-semibold whitespace-nowrap transition-colors ${
              isActive('/marketplace') ? 'text-white font-bold drop-shadow-sm' : 'text-white/80 hover:text-white'
            }`}
          >
            Boutique
            {isActive('/marketplace') && (
              <span className="absolute left-0 bottom-0 h-[2px] w-full bg-[#C8102E] rounded-full" />
            )}
          </Link>

          <Link
            to="/dons"
            className={`relative py-2 text-xs xl:text-sm font-semibold whitespace-nowrap transition-colors ${
              isActive('/dons') ? 'text-white font-bold drop-shadow-sm' : 'text-white/80 hover:text-white'
            }`}
          >
            Don
            {isActive('/dons') && (
              <span className="absolute left-0 bottom-0 h-[2px] w-full bg-[#C8102E] rounded-full" />
            )}
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-1.5 lg:gap-2 xl:gap-3 shrink-0 border-l border-white/20 pl-3 xl:pl-6 ml-auto">
          <Link
            to="/recherche"
            aria-label="Recherche"
            title="Recherche"
            className="text-white/80 hover:text-white transition-colors p-1.5 xl:p-2 rounded-full hover:bg-white/10"
          >
            <Search className="w-4.5 h-4.5 xl:w-5 xl:h-5" />
          </Link>
          
          <Link
            to="/marketplace"
            aria-label="Marketplace FAFE"
            title="Marketplace"
            className="text-white/80 hover:text-white transition-colors p-1.5 xl:p-2 rounded-full hover:bg-white/10 relative"
          >
            <ShoppingCart className="w-4.5 h-4.5 xl:w-5 xl:h-5" />
            {cartItemsCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full">
                {cartItemsCount}
              </span>
            )}
          </Link>
          
          <button
            onClick={toggleLanguage}
            aria-label="Changer de langue"
            className="text-xs font-bold uppercase text-white/80 hover:text-white transition-colors p-1.5 xl:p-2 rounded-full hover:bg-white/10"
          >
            {language}
          </button>
          
          {user ? (
            <Link to="/hub/dashboard" className="ml-1 xl:ml-2">
              <Button className="bg-[#00843D] hover:bg-[#006830] text-white py-1.5 px-3 xl:px-4 rounded-full font-bold text-xs shadow-md whitespace-nowrap">
                Espace Membre
              </Button>
            </Link>
          ) : (
            <div className="flex items-center gap-1.5 xl:gap-2 ml-1 xl:ml-2">
              <Link to="/hub/connexion">
                <Button variant="outline" className="border-white/40 text-white hover:bg-white/10 py-1.5 px-3 xl:px-4 backdrop-blur-sm rounded-full font-bold text-xs whitespace-nowrap">
                  Connexion
                </Button>
              </Link>
              <Link to="/rejoindre">
                <Button className="bg-[#C8102E] hover:bg-[#A30D25] text-white py-1.5 px-3 xl:px-4 rounded-full font-bold text-xs shadow-md whitespace-nowrap">
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
            className="p-2.5 text-white hover:text-[#FCD116] rounded-full hover:bg-white/10 active:scale-95 transition-transform relative"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartItemsCount > 0 && (
              <span className="absolute top-1 right-1 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full">
                {cartItemsCount}
              </span>
            )}
          </Link>

          <button
            className="p-2.5 text-white hover:text-[#FCD116] rounded-full hover:bg-white/10 active:scale-95 transition-transform ml-0.5"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
          </button>
        </div>
      </div>
    </header>

    {/* Mobile Drawer (Rendered outside <header> to prevent CSS backdrop-filter containing block entrapment) */}
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="lg:hidden fixed inset-0 z-50 flex flex-col bg-white shadow-2xl overflow-hidden"
        >
          {/* Drawer Top Header (Maintains high-contrast emerald bar with visible close X) */}
          <div className="bg-[#063F3A] text-white px-4 md:px-8 py-3.5 flex items-center justify-between border-b border-white/10 shrink-0 shadow-md">
            <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center" aria-label="Accueil FAFE">
              <FafeLogo variant="light" size="sm" showSubtitle={false} />
            </Link>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleLanguage}
                aria-label="Changer de langue"
                className="text-xs font-bold uppercase text-white/90 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10 mr-1"
              >
                {language}
              </button>

              <Link
                to="/marketplace/panier"
                onClick={() => setIsOpen(false)}
                aria-label="Panier Marketplace"
                className="p-2 text-white hover:text-[#FCD116] rounded-full hover:bg-white/10 relative transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemsCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full">
                    {cartItemsCount}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-white hover:text-[#FCD116] rounded-full hover:bg-white/10 active:scale-95 transition-all"
                aria-label="Fermer le menu"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          {/* Drawer Scrollable Content */}
          <div className="flex-1 overflow-y-auto w-full px-5 py-6 flex flex-col justify-between max-w-lg mx-auto">
            <div className="space-y-6">
              
              {/* 1. ACCUEIL */}
              <div>
                <Link
                  to="/"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between p-3.5 rounded-xl font-bold text-base transition-colors ${
                    isActive('/') ? 'bg-[#00843D]/10 text-[#00843D]' : 'text-[#063F3A] hover:bg-stone-50'
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
                    className="flex items-center gap-3 p-3 rounded-xl text-stone-700 hover:text-[#063F3A] hover:bg-stone-50 text-sm font-semibold transition-colors"
                  >
                    <span>Présentation & Vision</span>
                  </Link>
                  <Link
                    to="/nous#categories"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl text-stone-700 hover:text-[#063F3A] hover:bg-stone-50 text-sm font-semibold transition-colors"
                  >
                    <span>Nos actions & programmes</span>
                  </Link>
                  <Link
                    to="/nous#contact"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl text-stone-700 hover:text-[#063F3A] hover:bg-stone-50 text-sm font-semibold transition-colors"
                  >
                    <span>Contact & Secrétariat</span>
                  </Link>
                </div>
              </div>

              {/* 3. ACTUALITÉS & ÉDITORIAL */}
              <div className="border-t border-stone-100 pt-3">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest px-3 mb-1 block">
                  ACTUALITÉS & ÉDITORIAL
                </span>
                <div className="space-y-1">
                  <Link
                    to="/actualites"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl text-stone-700 hover:text-[#063F3A] hover:bg-stone-50 text-sm font-semibold transition-colors"
                  >
                    <span>Actualités & Articles</span>
                  </Link>
                  <Link
                    to="/evenements"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl text-stone-700 hover:text-[#063F3A] hover:bg-stone-50 text-sm font-semibold transition-colors"
                  >
                    <span>Événements & Conférences</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                      Agenda
                    </span>
                  </Link>
                  <Link
                    to="/galerie"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl text-stone-700 hover:text-[#063F3A] hover:bg-stone-50 text-sm font-semibold transition-colors"
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
                  className="flex items-center justify-between p-3 rounded-xl text-stone-700 hover:text-[#063F3A] hover:bg-stone-50 text-sm font-semibold transition-colors"
                >
                  <span>Annuaire Panafricain</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#063F3A]">
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
                    className="flex items-center justify-between p-3 rounded-xl text-stone-700 hover:text-[#063F3A] hover:bg-stone-50 text-sm font-semibold transition-colors"
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
                    className="flex items-center justify-between p-3 rounded-xl text-stone-700 hover:text-[#063F3A] hover:bg-stone-50 text-sm font-semibold transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-[#063F3A]" />
                      <span className="font-semibold text-stone-900">Boutique & Marketplace</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-stone-400">Produits locaux</span>
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
                    className="flex items-center justify-between p-3 rounded-xl bg-orange-50/80 text-[#00843D] text-sm font-bold transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-[#00843D]" />
                      <span>Faire un don</span>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider">Soutenir</span>
                  </Link>

                  <Link
                    to="/recherche"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl text-stone-600 hover:bg-stone-50 text-sm font-medium transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-stone-400" />
                      <span>Recherche globale</span>
                    </div>
                  </Link>
                </div>
              </div>

            </div>

            {/* Bottom Actions: Connexion / Inscription */}
            <div className="pt-6 mt-6 border-t border-stone-200/80 space-y-3 pb-4">
              {user ? (
                <Link to="/hub/dashboard" onClick={() => setIsOpen(false)} className="block">
                  <Button className="w-full bg-[#00843D] hover:bg-[#006830] text-white py-3.5 rounded-full font-bold text-sm shadow-md flex items-center justify-center gap-2">
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
                    <Button className="w-full bg-[#C8102E] hover:bg-[#A30D25] text-white py-3 rounded-full font-bold text-xs sm:text-sm shadow-md">
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
  </>
);
}
