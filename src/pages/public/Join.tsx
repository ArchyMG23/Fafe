import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, CheckCircle, FileText, Upload, CreditCard, ArrowRight, User as UserIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/auth';
import { useLanguageStore } from '../../store/language';

export function Join() {
  const { currentUser: user } = useAuthStore();
  const { language, tl } = useLanguageStore();
  
  const content = {
    title: { fr: 'Rejoindre le FAFE', en: 'Join FAFE' },
    subtitle: { 
      fr: "Intégrez le premier réseau panafricain d'accompagnement et de financement des femmes entrepreneures.", 
      en: "Join the first pan-African network for supporting and funding women entrepreneurs." 
    },
    whyJoin: { fr: 'Pourquoi rejoindre le FAFE ?', en: 'Why join FAFE?' },
    stepsTitle: { fr: "Processus d'adhésion", en: 'Membership Process' },
    step1: { fr: 'Création du compte', en: 'Account Creation' },
    step2: { fr: 'Demande & Paiement', en: 'Application & Payment' },
    step3: { fr: 'Vérification', en: 'Verification' },
    step4: { fr: 'Validation', en: 'Validation' },
    benefits: [
      { fr: 'Accès exclusif aux financements du fonds général', en: 'Exclusive access to general fund financing' },
      { fr: 'Réseau de mentorat et masterclasses', en: 'Mentorship network and masterclasses' },
      { fr: 'Visibilité internationale', en: 'International visibility' },
      { fr: 'Invitation aux événements VIP', en: 'Invitation to VIP events' }
    ]
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24">
      {/* Hero Header */}
      <section className="bg-[#6B3E1E] text-white pt-32 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-[#D4AF37] opacity-10 rounded-full blur-[80px]"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">{tl(content.title)}</h1>
          <p className="text-xl max-w-2xl mx-auto text-white/80">
            {tl(content.subtitle)}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            
            {/* Left: Info */}
            <div className="space-y-12">
              <div>
                <h2 className="text-3xl font-bold font-heading text-[#6B3E1E] mb-8">{tl(content.whyJoin)}</h2>
                <div className="space-y-4">
                  {content.benefits.map((b, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-[#E67E22]/10 flex items-center justify-center shrink-0 mt-1">
                        <CheckCircle className="w-5 h-5 text-[#E67E22]" />
                      </div>
                      <p className="text-lg text-stone-700 leading-relaxed">{tl(b)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold font-heading text-[#6B3E1E] mb-6">{tl(content.stepsTitle)}</h2>
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[#D4AF37] before:to-transparent">
                  {[
                    { icon: UserIcon, text: content.step1 },
                    { icon: CreditCard, text: content.step2 },
                    { icon: Shield, text: content.step3 },
                    { icon: CheckCircle, text: content.step4 },
                  ].map((step, i) => (
                    <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white bg-[#D4AF37] text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                        <step.icon className="w-4 h-4" />
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-stone-200 bg-white shadow-sm">
                        <h3 className="font-bold text-[#6B3E1E]">{i + 1}. {tl(step.text)}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Call to action Box */}
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-stone-100 sticky top-32">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-[#E67E22]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-[#E67E22]" />
                </div>
                <h3 className="text-2xl font-bold font-heading text-[#6B3E1E] mb-2">
                  {language === 'fr' ? 'Démarrer votre adhésion' : 'Start your application'}
                </h3>
                <p className="text-stone-500">
                  {language === 'fr' 
                    ? 'Le processus prend environ 5 minutes.' 
                    : 'The process takes about 5 minutes.'}
                </p>
              </div>

              {user ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-100 rounded-xl text-green-800 text-sm flex gap-3 mb-6">
                    <CheckCircle className="w-5 h-5 shrink-0" />
                    <p>{language === 'fr' ? 'Vous êtes connecté. Vous pouvez procéder à la demande.' : 'You are logged in. You can proceed with the application.'}</p>
                  </div>
                  <Link to="/dashboard/adhesion">
                    <Button className="w-full bg-[#E67E22] hover:bg-[#c96a1a] text-white py-6 text-lg font-bold shadow-lg">
                      {language === 'fr' ? "Accéder à ma demande" : "Access my application"}
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <Link to="/inscription">
                    <Button className="w-full bg-[#E67E22] hover:bg-[#c96a1a] text-white py-6 text-lg font-bold shadow-lg">
                      {language === 'fr' ? 'Créer un compte' : 'Create an account'}
                    </Button>
                  </Link>
                  <p className="text-center text-sm text-stone-500 mt-4">
                    {language === 'fr' ? 'Déjà un compte ?' : 'Already have an account?'} <Link to="/connexion" className="text-[#6B3E1E] font-bold underline">{language === 'fr' ? 'Se connecter' : 'Log in'}</Link>
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
