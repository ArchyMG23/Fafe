import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Button } from '../ui/Button';

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
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#E67E22] rounded-full flex items-center justify-center text-white font-bold text-xl ring-2 ring-[#D4AF37]">
                F
              </div>
              <div className="flex flex-col">
                <span className="font-bold tracking-tight leading-none text-2xl">FAFE</span>
                <span className="uppercase tracking-widest text-white/60 text-[10px]">Panafricaine</span>
              </div>
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
            <h4 className="font-bold uppercase tracking-wider text-sm text-[#D4AF37] mb-6">À propos</h4>
            <ul className="space-y-3 text-white/80">
              <li><Link to="/a-propos/historique" className="hover:text-white transition-colors">Historique</Link></li>
              <li><Link to="/a-propos/vision" className="hover:text-white transition-colors">Vision & Mission</Link></li>
              <li><Link to="/a-propos/gouvernance" className="hover:text-white transition-colors">Gouvernance</Link></li>
              <li><Link to="/a-propos/rapports" className="hover:text-white transition-colors">Rapports d'activités</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-wider text-sm text-[#D4AF37] mb-6">Nos actions</h4>
            <ul className="space-y-3 text-white/80">
              <li><Link to="/actions/formation" className="hover:text-white transition-colors">Formation</Link></li>
              <li><Link to="/projets-sociaux" className="hover:text-white transition-colors">Projets sociaux</Link></li>
              <li><Link to="/evenements" className="hover:text-white transition-colors">Événements</Link></li>
              <li><Link to="/actions/commerce" className="hover:text-white transition-colors">Commerce</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-wider text-sm text-[#D4AF37] mb-6">Ressources</h4>
            <ul className="space-y-3 text-white/80">
              <li><Link to="/entrepreneures" className="hover:text-white transition-colors">Annuaire</Link></li>
              <li><Link to="/actualites" className="hover:text-white transition-colors">Actualités</Link></li>
              <li><Link to="/dons" className="hover:text-white transition-colors flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#E67E22]"></span>Faire un don</Link></li>
              <li><Link to="/rejoindre" className="hover:text-white transition-colors font-bold text-[#D4AF37]">Rejoindre le FAFE</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-wider text-sm text-[#D4AF37] mb-6">Contact</h4>
            <ul className="space-y-3 text-white/80">
              <li><Link to="/contact" className="hover:text-white transition-colors">Nous contacter</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
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
