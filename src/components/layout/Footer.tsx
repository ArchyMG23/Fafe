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
    <footer className="bg-[#6B3E1E] text-white pt-20 pb-10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8 mb-16">
          
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center mb-6 group">
              <FafeLogo variant="light" size="lg" className="group-hover:opacity-90 transition-opacity" />
            </Link>
            <p className="text-white/80 mb-6 max-w-sm">
              Le premier réseau panafricain dédié à l'accompagnement, au financement et à la valorisation des femmes entrepreneures.
            </p>
            <div className="space-y-4">
              <h4 className="font-bold uppercase tracking-wider text-sm text-[#D4AF37]">Newsletter</h4>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  placeholder="Votre email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 w-full text-white placeholder:text-white/50 focus:outline-none focus:border-[#D4AF37]"
                  required
                />
                <Button type="submit" disabled={status === 'loading'} className="bg-[#E67E22] hover:bg-[#c96a1a] text-white">
                  OK
                </Button>
              </form>
              {status === 'success' && <p className="text-green-400 text-sm">Merci pour votre inscription !</p>}
            </div>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-wider text-sm text-[#D4AF37] mb-6">FAFE</h4>
            <ul className="space-y-3 text-white/80">
              <li><Link to="/nous" className="hover:text-white transition-colors">Nous</Link></li>
              <li><Link to="/actualites" className="hover:text-white transition-colors">Actualités</Link></li>
              <li><Link to="/galerie" className="hover:text-white transition-colors">Galerie</Link></li>
              <li><Link to="/nous#contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-wider text-sm text-[#D4AF37] mb-6">Communauté</h4>
            <ul className="space-y-3 text-white/80">
              <li><Link to="/rejoindre" className="hover:text-white transition-colors font-bold text-[#D4AF37]">Rejoindre le FAFE</Link></li>
              <li><Link to="/hub" className="hover:text-white transition-colors">FAFE Hub</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-wider text-sm text-[#D4AF37] mb-6">Services</h4>
            <ul className="space-y-3 text-white/80">
              <li><Link to="/marketplace" className="hover:text-white transition-colors">Marketplace</Link></li>
              <li><Link to="/dons" className="hover:text-white transition-colors flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#E67E22]"></span>Dons</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-wider text-sm text-[#D4AF37] mb-6">Informations</h4>
            <ul className="space-y-3 text-white/80">
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
