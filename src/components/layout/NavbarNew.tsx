import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Search, ShoppingCart, ChevronDown, Menu, X } from "lucide-react";
import { useLanguageStore } from "../../store/language";
import { Button } from "../ui/Button";

export function NavbarNew() {
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguageStore();
  const isAuthenticated = false; // Simplified

  const navLinks = [
    { name: "Accueil", path: "/" },
    { name: "Nous", path: "/nous" },
    { name: "Entrepreneures", path: "/entrepreneures" },
    { name: "Actualités", path: "/actualites" },
    { name: "Événements", path: "/evenements" },
    { name: "Boutique", path: "/boutique" },
    { name: "Don", path: "/dons" },
  ];

  return (
    <nav className="bg-[#063F3A] text-white py-4 sticky top-0 z-50">
      <div className="fafe-container flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="FAFE" className="h-8" />
          <span className="font-heading text-2xl font-bold">FAFE</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-[#D4AF37] ${
                  isActive ? "border-b-2 border-[#D4AF37] pb-1 text-[#D4AF37]" : ""
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        {/* Right Actions */}
        <div className="hidden lg:flex items-center gap-4">
          <Search className="w-5 h-5 cursor-pointer hover:text-[#D4AF37]" />
          <ShoppingCart className="w-5 h-5 cursor-pointer hover:text-[#D4AF37]" />
          
          <button className="flex items-center gap-1 text-sm font-medium hover:text-[#D4AF37]">
            {language.toUpperCase()} <ChevronDown className="w-4 h-4" />
          </button>

          {isAuthenticated ? (
            <Button variant="outline" className="border-white text-white hover:bg-white/10 rounded-full">
              Espace Membre
            </Button>
          ) : (
            <>
              <Link to="/connexion">
                <Button variant="outline" className="border-white text-white hover:bg-white/10 rounded-full">
                  Connexion
                </Button>
              </Link>
              <Link to="/rejoindre">
                <Button className="bg-[#C8102E] hover:bg-[#A30D25] text-white rounded-full px-6">
                  Rejoindre
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="lg:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
    </nav>
  );
}
