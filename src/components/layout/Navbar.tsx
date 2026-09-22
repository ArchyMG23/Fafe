import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  User as UserIcon,
  Search,
  ShoppingCart,
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
    const [basePath, hash] = path.split('#');
    if (hash) {
      return location.pathname === basePath && location.hash === `#${hash}`;
    }
    if (basePath === '/') return location.pathname === '/' && !location.hash;
    if (basePath === '/nous') {
      return (
        !location.hash &&
        (location.pathname === '/nous' || location.pathname === '/a-propos' || location.pathname === '/nos-actions')
      );
    }
    if (basePath === '/actualites') {
      return (
        location.pathname === '/actualites' ||
        location.pathname === '/actualites-evenements' ||
        location.pathname === '/evenements'
      );
    }
    if (basePath === '/hub') {
      return location.pathname.startsWith('/hub');
    }
    return location.pathname.startsWith(basePath);
  };

  // Direct, single-level destinations for mobile Android
  const mobileNavLinks = [
    { label: 'ACCUEIL', path: '/' },
    { label: 'NOUS', path: '/nous' },
    { label: 'ACTUALITÉS', path: '/actualites' },
    { label: 'PROJETS SOCIAUX', path: '/projets-sociaux' },
    { label: 'ANNUAIRE PANAFRICAIN', path: '/entrepreneures' },
    { label: 'GALERIE', path: '/galerie' },
    { label: 'DONS', path: '/dons' },
    { label: 'REJOINDRE', path: '/rejoindre' },
    { label: 'FAFE HUB', path: user ? '/hub/dashboard' : '/hub' },
    { label: 'MARKETPLACE', path: '/marketplace' },
    { label: 'CONTACT', path: '/nous#contact' },
  ];

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
            to={cartItemsCount > 0 ? "/marketplace/panier" : "/marketplace"}
            aria-label={cartItemsCount > 0 ? "Panier FAFE" : "Marketplace FAFE"}
            title={cartItemsCount > 0 ? "Voir mon panier" : "Marketplace"}
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
            to={cartItemsCount > 0 ? "/marketplace/panier" : "/marketplace"}
            aria-label={cartItemsCount > 0 ? "Panier Marketplace" : "Marketplace FAFE"}
            title={cartItemsCount > 0 ? "Panier" : "Marketplace"}
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
                to={cartItemsCount > 0 ? "/marketplace/panier" : "/marketplace"}
                onClick={() => setIsOpen(false)}
                aria-label={cartItemsCount > 0 ? "Panier Marketplace" : "Marketplace FAFE"}
                title={cartItemsCount > 0 ? "Panier" : "Marketplace"}
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

          {/* Drawer Scrollable Content: Liste claire, directe et tactile des destinations principales */}
          <div className="flex-1 overflow-y-auto w-full px-5 py-6 flex flex-col justify-between max-w-lg mx-auto">
            {/* Single clean list of primary destinations - no submenus, no chevrons */}
            <nav className="flex flex-col space-y-1.5" aria-label="Navigation principale mobile">
              {mobileNavLinks.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-xl font-bold text-sm tracking-wide transition-all ${
                      active
                        ? 'bg-[#00843D] text-white shadow-xs'
                        : 'text-[#063F3A] hover:bg-stone-100/80 active:bg-stone-200/70'
                    }`}
                  >
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

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
