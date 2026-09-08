import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Button } from '../ui/Button';
import { FafeLogo } from '../ui/FafeLogo';

export function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus('loading');
    try {
      await addDoc(collection(db, 'newsletter_subscribers'), {
        email,
        subscribedAt: Date.now()
      });
      setStatus('success');
      setEmail('');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <footer className="bg-[#063F3A] text-white pt-20 pb-10">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 lg:gap-8 mb-16">
          
          <div className="sm:col-span-2 md:col-span-4 lg:col-span-2">
            <Link to="/" className="inline-flex items-center mb-6 group">
              <FafeLogo variant="light" size="md" className="sm:hidden group-hover:opacity-90 transition-opacity" />
              <FafeLogo variant="light" size="lg" className="hidden sm:inline-flex group-hover:opacity-90 transition-opacity" />
            </Link>
            <p className="text-white/80 mb-6 max-w-sm text-sm leading-relaxed">
              Le premier réseau panafricain dédié à l'accompagnement, au financement et à la valorisation des femmes entrepreneures.
            </p>
            <div className="space-y-3 max-w-md">
              <h4 className="font-sans font-bold uppercase tracking-wider text-xs text-[#D4AF37]">Newsletter</h4>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  placeholder="Votre email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 w-full text-white text-sm placeholder:text-white/50 focus:outline-none focus:border-[#D4AF37]"
                  required
                />
                <Button type="submit" disabled={status === 'loading'} className="bg-[#C8102E] hover:bg-[#A30D25] text-white shrink-0 font-bold text-sm px-5">
                  OK
                </Button>
              </form>
              {status === 'success' && <p className="text-green-400 text-sm">Merci pour votre inscription !</p>}
            </div>
          </div>

          <div>
            <h4 className="font-sans font-bold uppercase tracking-wider text-xs text-[#D4AF37] mb-4">FAFE</h4>
            <ul className="space-y-2.5 text-sm text-white/80">
              <li><Link to="/nous" className="hover:text-white transition-colors">Nous</Link></li>
              <li><Link to="/actualites" className="hover:text-white transition-colors">Actualités</Link></li>
              <li><Link to="/galerie" className="hover:text-white transition-colors">Galerie</Link></li>
              <li><Link to="/nous#contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-sans font-bold uppercase tracking-wider text-xs text-[#D4AF37] mb-4">Communauté</h4>
            <ul className="space-y-2.5 text-sm text-white/80">
              <li><Link to="/rejoindre" className="hover:text-white transition-colors font-bold text-[#D4AF37]">Rejoindre le FAFE</Link></li>
              <li><Link to="/hub" className="hover:text-white transition-colors">FAFE Hub</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-sans font-bold uppercase tracking-wider text-xs text-[#D4AF37] mb-4">Services</h4>
            <ul className="space-y-2.5 text-sm text-white/80">
              <li><Link to="/marketplace" className="hover:text-white transition-colors">Marketplace</Link></li>
              <li><Link to="/dons" className="hover:text-white transition-colors flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#C8102E]"></span>Dons</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-sans font-bold uppercase tracking-wider text-xs text-[#D4AF37] mb-4">Informations</h4>
            <ul className="space-y-2.5 text-sm text-white/80">
              <li><Link to="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link></li>
              <li><Link to="/confidentialite" className="hover:text-white transition-colors">Confidentialité</Link></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-white/60 text-sm">
          <p>© {new Date().getFullYear()} FAFE. Tous droits réservés.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Facebook</a>
            <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">Instagram</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
