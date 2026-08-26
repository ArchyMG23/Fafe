import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { getCMSGlobal, defaultAboutData } from '../../lib/cms';
import { motion } from 'motion/react';
import { Star, Lightbulb, Users, TrendingUp, Target, Download, ArrowRight, LayoutTemplate, Globe } from 'lucide-react';
import { Button } from '../../components/ui/Button';

// Utility to get the right icon
const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'Star': return <Star className="w-8 h-8" />;
    case 'Lightbulb': return <Lightbulb className="w-8 h-8" />;
    case 'Users': return <Users className="w-8 h-8" />;
    case 'TrendingUp': return <TrendingUp className="w-8 h-8" />;
    case 'Target': return <Target className="w-8 h-8" />;
    default: return <Star className="w-8 h-8" />;
  }
};

export function About() {
  const [cmsData, setCmsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { hash } = useLocation();

  useEffect(() => {
    const fetchCMS = async () => {
      try {
        const data = await getCMSGlobal();
        if (data?.about) {
          // Merge with defaults to ensure structure
          setCmsData({ ...defaultAboutData, ...data.about });
        } else {
          setCmsData(defaultAboutData);
        }
      } catch (err) {
        console.error("Error fetching about CMS data", err);
        setCmsData(defaultAboutData);
      } finally {
        setLoading(false);
      }
    };
    fetchCMS();
  }, []);

  useEffect(() => {
    if (!loading && hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else if (!loading && !hash) {
      window.scrollTo(0, 0);
    }
  }, [loading, hash]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E67E22]"></div>
      </div>
    );
  }

  const { pcaHero, presentation, historique, vision, mission, valeurs, gouvernance, bureauExecutif, equipe, partenaires, rapports } = cmsData;

  


  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="bg-[#FAF9F6] min-h-screen">
      {/* 1. HERO PCA */}
      <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-32 overflow-hidden bg-[#FAF9F6]">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-32 -mr-32 w-[500px] h-[500px] bg-[#E67E22] opacity-5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 -mb-32 -ml-32 w-[400px] h-[400px] bg-[#D4AF37] opacity-5 rounded-full blur-[80px]"></div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            <motion.div 
              className="lg:w-1/2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <div className="inline-block px-4 py-1.5 bg-[#E67E22]/10 rounded-full mb-6">
                <span className="text-sm font-bold tracking-widest text-[#E67E22] uppercase">
                  {pcaHero?.heroLabelFR || "À PROPOS DU FAFE"}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-[#6B3E1E] leading-tight mb-6">
                {pcaHero?.heroTitleFR}
              </h1>
              <p className="text-lg md:text-xl text-stone-600 leading-relaxed mb-12 max-w-2xl">
                {pcaHero?.heroDescriptionFR}
              </p>

              <div className="border-l-4 border-[#E67E22] pl-6 py-2">
                <div className="text-sm font-bold tracking-widest text-stone-400 uppercase mb-1">
                  PCA DU FAFE
                </div>
                <h3 className="text-2xl font-bold font-heading text-[#6B3E1E] mb-1">
                  {pcaHero?.pcaName}
                </h3>
                <p className="text-[#E67E22] font-medium">
                  {pcaHero?.pcaTitleFR}
                </p>
              </div>
            </motion.div>

            <motion.div 
              className="lg:w-1/2 relative"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1, transition: { duration: 0.8 } }}
              viewport={{ once: true }}
            >
              <div className="relative rounded-[2rem] overflow-hidden aspect-[4/5] shadow-2xl">
                <img 
                  src={pcaHero?.pcaPhoto} 
                  alt={pcaHero?.pcaName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#6B3E1E]/40 to-transparent"></div>
              </div>
              
              {/* African motif decoration */}
              <div className="absolute -bottom-6 -left-6 w-32 h-32 border-[12px] border-[#D4AF37] rounded-full opacity-30 -z-10"></div>
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#E67E22] rounded-full opacity-10 -z-10"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. PRÉSENTATION */}
      <section className="py-24 bg-white" id="presentation">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-sm font-bold tracking-widest text-[#E67E22] uppercase mb-4">
              {presentation?.titleFR || "QUI SOMMES-NOUS ?"}
            </h2>
            <div className="w-16 h-1 bg-[#D4AF37] mx-auto"></div>
          </motion.div>

          <motion.div 
            className="prose prose-lg prose-stone mx-auto text-stone-600 leading-relaxed text-center whitespace-pre-wrap"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            {presentation?.descriptionFR}
          </motion.div>
        </div>
      </section>

      {/* 3. NOTRE HISTOIRE */}
      <section className="py-24 bg-[#FAF9F6]" id="historique">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div 
            className="text-center mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-sm font-bold tracking-widest text-[#E67E22] uppercase mb-3">
              {historique?.titleFR || "NOTRE HISTOIRE"}
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold font-heading text-[#6B3E1E]">
              Les jalons de notre évolution
            </h3>
          </motion.div>

          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative">
              {/* Line connector for desktop */}
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-[#6B3E1E]/10 -translate-y-1/2 z-0"></div>
              
              {historique?.events?.map((evt: any, idx: number) => (
                <motion.div 
                  key={idx} 
                  className="relative z-10 flex flex-row md:flex-col items-start md:items-center w-full md:w-1/4 mb-12 md:mb-0 group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: idx * 0.1 } }}
                  viewport={{ once: true }}
                >
                  {/* Vertical line connector for mobile */}
                  {idx !== historique.events.length - 1 && (
                    <div className="md:hidden absolute left-[15px] top-8 bottom-[-48px] w-0.5 bg-[#6B3E1E]/10 z-0"></div>
                  )}

                  <div className="w-8 h-8 rounded-full bg-[#E67E22] flex items-center justify-center shrink-0 md:mb-6 shadow-lg group-hover:scale-125 transition-transform duration-300 relative z-10">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                  <div className="ml-6 md:ml-0 md:text-center">
                    <div className="text-2xl font-bold font-heading text-[#D4AF37] mb-2">{evt.year}</div>
                    <h4 className="text-lg font-bold text-[#6B3E1E] mb-2">{evt.titleFR}</h4>
                    <p className="text-sm text-stone-600">{evt.descriptionFR}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. VISION ET MISSION */}
      <section className="py-24 bg-white" id="vision">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <motion.div 
              className="bg-[#FAF9F6] p-10 md:p-12 rounded-[2rem] border border-[#6B3E1E]/5 shadow-sm hover:shadow-lg transition-shadow"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0, transition: { duration: 0.6 } }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 bg-[#E67E22]/10 rounded-2xl flex items-center justify-center mb-8">
                <Globe className="w-8 h-8 text-[#E67E22]" />
              </div>
              <h3 className="text-2xl font-bold font-heading text-[#6B3E1E] mb-6">
                {vision?.titleFR || "NOTRE VISION"}
              </h3>
              <p className="text-lg text-stone-600 leading-relaxed">
                {vision?.descriptionFR}
              </p>
            </motion.div>

            <motion.div 
              className="bg-[#6B3E1E] p-10 md:p-12 rounded-[2rem] shadow-xl text-white relative overflow-hidden"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0, transition: { duration: 0.6 } }}
              viewport={{ once: true }}
            >
              <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-[#D4AF37] opacity-20 rounded-full blur-[40px]"></div>
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8 relative z-10 backdrop-blur-sm">
                <Target className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <h3 className="text-2xl font-bold font-heading text-white mb-6 relative z-10">
                {mission?.titleFR || "NOTRE MISSION"}
              </h3>
              <p className="text-lg text-white/90 leading-relaxed relative z-10">
                {mission?.descriptionFR}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. NOS VALEURS */}
      <section className="py-24 bg-[#FAF9F6]" id="valeurs">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-sm font-bold tracking-widest text-[#E67E22] uppercase mb-3">
              Notre fondation
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold font-heading text-[#6B3E1E]">
              Nos Valeurs
            </h3>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-6 max-w-5xl mx-auto">
            {valeurs?.map((valeur: any, idx: number) => (
              <motion.div
                key={idx}
                className="bg-white px-8 py-10 rounded-2xl border border-[#6B3E1E]/5 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 w-full sm:w-[calc(50%-12px)] md:w-[calc(33.33%-16px)] text-center group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0, transition: { duration: 0.4, delay: idx * 0.1 } }}
                viewport={{ once: true }}
              >
                <div className="w-16 h-16 mx-auto bg-[#FAF9F6] rounded-xl flex items-center justify-center mb-6 text-[#E67E22] group-hover:scale-110 group-hover:bg-[#E67E22] group-hover:text-white transition-all duration-300">
                  {getIcon(valeur.icon)}
                </div>
                <h4 className="text-lg font-bold text-[#6B3E1E] tracking-wide uppercase">
                  {valeur.titleFR}
                </h4>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. GOUVERNANCE */}
      <section className="py-24 bg-white border-b border-[#6B3E1E]/5" id="gouvernance">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-sm font-bold tracking-widest text-[#E67E22] uppercase mb-3">
              Organisation
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold font-heading text-[#6B3E1E] mb-8">
              {gouvernance?.titleFR || "Gouvernance"}
            </h3>
            
            {gouvernance?.descriptionFR === "Contenu en cours de rédaction" ? (
              <div className="flex flex-col items-center justify-center p-12 bg-stone-50 rounded-3xl border border-dashed border-stone-200">
                <LayoutTemplate className="w-12 h-12 text-stone-300 mb-4" />
                <h4 className="text-lg font-bold text-stone-500 mb-2">Contenu en cours de rédaction</h4>
                <p className="text-stone-400 text-sm max-w-sm">Les informations officielles concernant la structure de gouvernance seront publiées prochainement.</p>
              </div>
            ) : (
              <div className="prose prose-lg prose-stone mx-auto text-stone-600">
                {gouvernance?.descriptionFR}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* 7. BUREAU EXÉCUTIF */}
      <section className="py-24 bg-[#FAF9F6]" id="bureau-executif">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-sm font-bold tracking-widest text-[#E67E22] uppercase mb-3">
              Direction
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold font-heading text-[#6B3E1E]">
              {bureauExecutif?.titleFR || "Le Bureau Exécutif"}
            </h3>
          </motion.div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            {bureauExecutif?.members?.map((member: any, idx: number) => (
              <motion.div
                key={idx}
                className="bg-white rounded-[2rem] overflow-hidden border border-[#6B3E1E]/5 shadow-md hover:shadow-xl transition-shadow group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: idx * 0.1 } }}
                viewport={{ once: true }}
              >
                <div className="aspect-[4/5] overflow-hidden relative bg-stone-100">
                  {member.photo ? (
                    <img 
                      src={member.photo} 
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 grayscale group-hover:grayscale-0"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Users className="w-12 h-12 text-stone-300" />
                    </div>
                  )}
                </div>
                <div className="p-8 text-center bg-white relative">
                  {/* Small overlap accent */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 bg-[#D4AF37]/10 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-[#D4AF37] rounded-full"></div>
                    </div>
                  </div>
                  <h4 className="text-xl font-bold font-heading text-[#6B3E1E] mb-2 pt-2">{member.name}</h4>
                  <p className="text-[#E67E22] font-medium text-sm">{member.roleFR}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. ÉQUIPE OPÉRATIONNELLE */}
      <section className="py-24 bg-white" id="equipe">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-sm font-bold tracking-widest text-[#E67E22] uppercase mb-3">
              Au quotidien
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold font-heading text-[#6B3E1E]">
              {equipe?.titleFR || "L'Équipe Opérationnelle"}
            </h3>
          </motion.div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {equipe?.members?.map((member: any, idx: number) => (
              <motion.div
                key={idx}
                className="text-center group"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1, transition: { duration: 0.4, delay: idx * 0.1 } }}
                viewport={{ once: true }}
              >
                <div className="w-48 h-48 mx-auto rounded-full overflow-hidden mb-6 border-4 border-[#FAF9F6] shadow-lg relative bg-stone-100">
                  {member.photo ? (
                    <img 
                      src={member.photo} 
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Users className="w-12 h-12 text-stone-300" />
                    </div>
                  )}
                </div>
                <h4 className="text-lg font-bold text-[#6B3E1E] mb-1">{member.name}</h4>
                <p className="text-stone-500 text-sm">{member.roleFR}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. PARTENAIRES */}
      <section className="py-24 bg-[#FAF9F6]" id="partenaires">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-sm font-bold tracking-widest text-[#E67E22] uppercase mb-3">
              Confiance
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold font-heading text-[#6B3E1E]">
              {partenaires?.titleFR || "Nos Partenaires"}
            </h3>
          </motion.div>

          {(!partenaires?.list || partenaires.list.length === 0) ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-dashed border-stone-200">
              <p className="text-stone-400 text-sm text-center">La liste officielle des partenaires sera publiée prochainement.</p>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-8 items-center">
              {partenaires.list.map((part: any, idx: number) => (
                <motion.div
                  key={idx}
                  className="w-40 h-24 bg-white rounded-xl shadow-sm border border-stone-100 flex items-center justify-center p-4 grayscale hover:grayscale-0 transition-all duration-300"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1, transition: { duration: 0.5, delay: idx * 0.1 } }}
                  viewport={{ once: true }}
                >
                  {part.logo ? (
                    <img src={part.logo} alt={part.name} className="max-w-full max-h-full object-contain" />
                  ) : (
                    <span className="text-sm font-bold text-stone-400">{part.name}</span>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 10. RAPPORTS D'ACTIVITÉS */}
      <section className="py-24 bg-white" id="rapports">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-sm font-bold tracking-widest text-[#E67E22] uppercase mb-3">
              Transparence
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold font-heading text-[#6B3E1E]">
              {rapports?.titleFR || "Rapports d'Activités"}
            </h3>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6">
            {rapports?.list?.map((rapport: any, idx: number) => (
              <motion.a
                key={idx}
                href={rapport.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-6 bg-[#FAF9F6] rounded-2xl border border-stone-200 hover:border-[#E67E22]/30 hover:shadow-md transition-all group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0, transition: { duration: 0.4, delay: idx * 0.1 } }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#E67E22] shadow-sm">
                    <Download className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-[#6B3E1E] group-hover:text-[#E67E22] transition-colors">{rapport.titleFR}</span>
                </div>
                <ArrowRight className="w-5 h-5 text-stone-300 group-hover:text-[#E67E22] group-hover:translate-x-1 transition-all" />
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* 11. CTA */}
      <section className="py-24 bg-[#522d14] relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-32 -mr-32 w-[500px] h-[500px] bg-[#E67E22] opacity-10 rounded-full blur-[100px]"></div>
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-bold font-heading text-white mb-6">
            Prête à rejoindre notre réseau ?
          </h2>
          <p className="text-white/80 text-lg mb-10">
            Devenez membre du FAFE et accédez à un réseau puissant de femmes entrepreneures à travers l'Afrique.
          </p>
          <Link to="/rejoindre">
            <Button size="lg" className="bg-[#E67E22] hover:bg-[#c96a1a] text-white rounded-full px-10 py-6 text-lg shadow-xl hover:scale-105 transition-transform duration-300">
              Rejoindre le FAFE
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
