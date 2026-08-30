import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { About } from './About';
import { Actions } from './Actions';
import { MapPin, Phone, Mail, Globe, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function AboutAndActions() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [hash]);

  return (
    <div className="flex flex-col bg-[#FAF9F6] min-h-screen">
      <style>{`
        /* Make the containers transparent to flex layout */
        .about-container, .actions-container {
          display: contents;
        }

        /* Default order for anything else */
        .merged-section { order: 20; }

        /* --- Ordering Sections --- */
        /* 1. About Hero */
        #about-hero { order: 1; }
        
        /* 2. Presentation */
        #presentation { order: 2; }
        
        /* 3. Historique */
        #historique { order: 3; }
        
        /* 4. Vision / Mission / Valeurs */
        #vision { order: 4; }
        #valeurs { order: 5; }
        
        /* 5. Gouvernance / Equipe */
        #gouvernance { order: 6; }
        #bureau-executif { order: 7; }
        #equipe { order: 8; }
        
        /* 6. Nos actions */
        #actions-hero { display: none !important; }
        #categories { order: 9; }
        #featured { order: 10; }
        #all-actions { order: 11; }
        
        /* 7. Projets / initiatives */
        #projects { order: 12; }
        
        /* 8. Partenaires */
        #partenaires { order: 13; }
        
        /* 9. Impact */
        #stats { order: 14; }
        
        /* 10. Contact */
        #contact { order: 15; }
        
        /* Hidden duplicates or unnecessary sections */
        #events-section { display: none !important; }
        #marketplace-section { display: none !important; }
        #rapports { display: none !important; }
        #testimonials { display: none !important; }
        
        /* 11. CTA */
        #cta-join { order: 16; }
        #cta-donate { display: none !important; }
        #about-cta { display: none !important; }
      `}</style>
      
      <About />
      <Actions />
      <ContactSection />
    </div>
  );
}

function ContactSection() {
  return (
    <section className="merged-section py-24 bg-white" id="contact">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-[#6B3E1E] mb-6">
            Contactez-nous
          </h2>
          <p className="text-lg text-stone-600">
            Vous avez une question, une proposition de partenariat ou vous souhaitez en savoir plus sur nos activités ? N'hésitez pas à nous contacter.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Informations de contact */}
          <div>
            <h3 className="text-2xl font-bold font-heading text-[#6B3E1E] mb-6">Nos coordonnées</h3>
            <div className="space-y-6 mb-8">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-[#FAF9F6] rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                  <MapPin className="w-6 h-6 text-[#E67E22]" />
                </div>
                <div>
                  <h4 className="font-bold text-[#6B3E1E] mb-1">Siège social</h4>
                  <p className="text-stone-600">Abidjan, Côte d'Ivoire<br />Plateau, Immeuble Alpha 2000</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-12 h-12 bg-[#FAF9F6] rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                  <Phone className="w-6 h-6 text-[#E67E22]" />
                </div>
                <div>
                  <h4 className="font-bold text-[#6B3E1E] mb-1">Téléphone</h4>
                  <p className="text-stone-600">+225 00 00 00 00 00</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-12 h-12 bg-[#FAF9F6] rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                  <Mail className="w-6 h-6 text-[#E67E22]" />
                </div>
                <div>
                  <h4 className="font-bold text-[#6B3E1E] mb-1">Email</h4>
                  <p className="text-stone-600">contact@fafe-afrique.org</p>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-bold font-heading text-[#6B3E1E] mb-4">Suivez-nous</h3>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-[#FAF9F6] rounded-full flex items-center justify-center text-[#6B3E1E] hover:bg-[#E67E22] hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-[#FAF9F6] rounded-full flex items-center justify-center text-[#6B3E1E] hover:bg-[#E67E22] hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-[#FAF9F6] rounded-full flex items-center justify-center text-[#6B3E1E] hover:bg-[#E67E22] hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-[#FAF9F6] rounded-full flex items-center justify-center text-[#6B3E1E] hover:bg-[#E67E22] hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Formulaire */}
          <div className="bg-[#FAF9F6] p-8 rounded-2xl border border-stone-200">
            <h3 className="text-2xl font-bold font-heading text-[#6B3E1E] mb-6">Envoyez-nous un message</h3>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Prénom</label>
                  <input type="text" className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#E67E22]/20 focus:border-[#E67E22]" placeholder="Votre prénom" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Nom</label>
                  <input type="text" className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#E67E22]/20 focus:border-[#E67E22]" placeholder="Votre nom" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
                <input type="email" className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#E67E22]/20 focus:border-[#E67E22]" placeholder="votre@email.com" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Sujet</label>
                <select className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#E67E22]/20 focus:border-[#E67E22] bg-white">
                  <option>Demande d'information</option>
                  <option>Partenariat</option>
                  <option>Adhésion</option>
                  <option>Autre</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Message</label>
                <textarea rows={4} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#E67E22]/20 focus:border-[#E67E22] resize-none" placeholder="Comment pouvons-nous vous aider ?"></textarea>
              </div>
              
              <Button type="submit" className="w-full bg-[#E67E22] hover:bg-[#D3731F] text-white py-3 rounded-xl font-bold">
                Envoyer le message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
