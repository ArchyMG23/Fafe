import { useState } from 'react';
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
      console.error("Erreur lors de l'inscription à la newsletter:", error);
      setStatus('error');
    }
  };

  return (
    <footer className="bg-[#6B3E1E] text-white pt-20 pb-8 border-t-[4px] border-[#D4AF37]">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Newsletter Section */}
        <div className="bg-[#522d14] rounded-2xl p-8 md:p-12 mb-16 flex flex-col md:flex-row items-center justify-between gap-8 border border-[#D4AF37]/20 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-[#E67E22] opacity-10 rounded-full blur-3xl"></div>
          
          <div className="md:w-1/2 relative z-10">
            <h3 className="text-2xl font-bold font-heading text-white mb-2">Recevez les actualités du FAFE</h3>
            <p className="text-white/70">Restez informée de nos actions, événements et des dernières inspirations de l'entrepreneuriat féminin.</p>
          </div>
          
          <form onSubmit={handleSubscribe} className="w-full md:w-1/2 relative z-10">
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="email" 
                placeholder="Votre adresse e-mail" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-grow px-4 py-3 rounded-md border border-white/10 bg-white/5 text-white placeholder-white/50 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
              />
              <Button 
                type="submit" 
                disabled={status === 'loading'}
                className="bg-[#E67E22] hover:bg-[#c96a1a] text-white whitespace-nowrap px-8 py-3 rounded-md font-bold"
              >
                {status === 'loading' ? 'Inscription...' : "S'inscrire"}
              </Button>
            </div>
            {status === 'success' && <p className="text-[#D4AF37] text-sm mt-2 font-medium">Merci pour votre inscription !</p>}
            {status === 'error' && <p className="text-red-400 text-sm mt-2 font-medium">Une erreur est survenue, veuillez réessayer.</p>}
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-16">
          <div className="md:col-span-4 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#E67E22] font-bold text-xl ring-2 ring-[#D4AF37]">F</div>
              <div className="flex flex-col">
                <span className="font-bold text-xl tracking-tight leading-none text-white">FAFE</span>
                <span className="text-[10px] uppercase tracking-widest text-[#D4AF37]">Panafricaine</span>
              </div>
            </div>
            <p className="text-sm text-white/70 leading-relaxed pr-8">
              Le Forum Africain des Femmes Entrepreneures connecte, accompagne et valorise le leadership féminin pour construire une Afrique plus inclusive et prospère.
            </p>
            <div className="flex gap-4">
              {/* Social placeholders */}
              <div className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#E67E22] transition-colors flex items-center justify-center cursor-pointer">
                <span className="sr-only">Facebook</span>
                <div className="w-4 h-4 bg-white/80" style={{ maskImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z\'%3E%3C/path%3E%3C/svg%3E")', maskSize: 'cover', WebkitMaskImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z\'%3E%3C/path%3E%3C/svg%3E")', WebkitMaskSize: 'cover' }}></div>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#E67E22] transition-colors flex items-center justify-center cursor-pointer">
                <span className="sr-only">LinkedIn</span>
                <div className="w-4 h-4 bg-white/80" style={{ maskImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z\'%3E%3C/path%3E%3Crect x=\'2\' y=\'9\' width=\'4\' height=\'12\'%3E%3C/rect%3E%3Ccircle cx=\'4\' cy=\'4\' r=\'2\'%3E%3C/circle%3E%3C/svg%3E")', maskSize: 'cover', WebkitMaskImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z\'%3E%3C/path%3E%3Crect x=\'2\' y=\'9\' width=\'4\' height=\'12\'%3E%3C/rect%3E%3Ccircle cx=\'4\' cy=\'4\' r=\'2\'%3E%3C/circle%3E%3C/svg%3E")', WebkitMaskSize: 'cover' }}></div>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#E67E22] transition-colors flex items-center justify-center cursor-pointer">
                <span className="sr-only">Twitter</span>
                <div className="w-4 h-4 bg-white/80" style={{ maskImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z\'%3E%3C/path%3E%3C/svg%3E")', maskSize: 'cover', WebkitMaskImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z\'%3E%3C/path%3E%3C/svg%3E")', WebkitMaskSize: 'cover' }}></div>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-3 md:col-start-6">
            <h4 className="font-bold mb-6 text-[#D4AF37] uppercase tracking-wider text-xs">Navigation</h4>
            <ul className="space-y-3 text-sm text-white/80 font-medium">
              <li><Link to="/about" className="hover:text-[#E67E22] transition-colors">À propos</Link></li>
              <li><Link to="/actions" className="hover:text-[#E67E22] transition-colors">Nos actions</Link></li>
              <li><Link to="/entrepreneures" className="hover:text-[#E67E22] transition-colors">Annuaire</Link></li>
              <li><Link to="/dons" className="hover:text-[#E67E22] transition-colors">Soutenir le FAFE</Link></li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h4 className="font-bold mb-6 text-[#D4AF37] uppercase tracking-wider text-xs">Contact & Accès</h4>
            <ul className="space-y-3 text-sm text-white/80 font-medium mb-6">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 shrink-0 pt-0.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </div>
                contact@fafe-afrique.org (À configurer)
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 shrink-0 pt-0.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                </div>
                +225 00 00 00 00 00 (À configurer)
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 shrink-0 pt-0.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </div>
                Siège FAFE, Abidjan, Côte d'Ivoire (À configurer)
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-white/50">
          <p>© {new Date().getFullYear()} FAFE — Forum Africain des Femmes Entrepreneures. Tous droits réservés.</p>
          <div className="flex gap-6">
            <Link to="/mentions-legales" className="hover:text-[#D4AF37] transition-colors">Mentions légales</Link>
            <Link to="/confidentialite" className="hover:text-[#D4AF37] transition-colors">Politique de confidentialité</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
