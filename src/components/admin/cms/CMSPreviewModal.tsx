import { useState } from 'react';
import { X, Monitor, Tablet, Smartphone, Globe, ExternalLink, ShieldCheck } from 'lucide-react';
import { Button } from '../../ui/Button';
import { CMSPageId } from '../../../types';

interface CMSPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageId: CMSPageId;
  draftData: any;
  activeLang: 'fr' | 'en';
  onLangChange: (lang: 'fr' | 'en') => void;
}

export function CMSPreviewModal({
  isOpen,
  onClose,
  pageId,
  draftData,
  activeLang,
  onLangChange
}: CMSPreviewModalProps) {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  if (!isOpen) return null;

  const getContainerWidth = () => {
    switch (device) {
      case 'mobile': return 'w-[375px]';
      case 'tablet': return 'w-[768px]';
      default: return 'w-full max-w-6xl';
    }
  };

  const renderPreviewContent = () => {
    // We render a high-fidelity preview reflecting draftData and activeLang
    switch (pageId) {
      case 'accueil': {
        const hero = draftData?.hero || {};
        const stats = draftData?.stats || [];
        const missions = draftData?.missions || {};
        const donationCta = draftData?.donationCta || {};

        return (
          <div className="bg-[#FAF9F6] text-stone-800 space-y-12 pb-16">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-[#6B3E1E] to-[#45250e] text-white p-8 md:p-16 rounded-b-3xl overflow-hidden shadow-xl">
              <div className="max-w-3xl space-y-6 relative z-10">
                <span className="inline-block px-3 py-1 bg-[#E67E22] text-white text-xs font-bold uppercase rounded-full">
                  {hero.badge?.[activeLang] || "RÉSEAU PANAFRICAIN"}
                </span>
                <h1 className="text-3xl md:text-5xl font-bold font-heading leading-tight">
                  {hero.title?.[activeLang] || "L'excellence au féminin"}
                </h1>
                <p className="text-stone-200 text-base md:text-lg leading-relaxed">
                  {hero.shortText?.[activeLang] || ""}
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <span className="px-6 py-3 bg-[#E67E22] text-white font-bold rounded-full text-sm shadow-md">
                    {hero.buttonText?.[activeLang] || "Rejoindre le réseau"}
                  </span>
                  <span className="px-6 py-3 bg-white/10 border border-white/20 text-white font-bold rounded-full text-sm">
                    {hero.secondaryButtonText?.[activeLang] || "Faire un don"}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="max-w-5xl mx-auto px-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((s: any, idx: number) => (
                  <div key={idx} className="bg-white p-6 rounded-2xl border border-stone-200 text-center shadow-sm">
                    <div className="text-3xl font-extrabold text-[#E67E22] mb-1">{s.value}</div>
                    <div className="text-xs font-bold text-stone-500 uppercase">{s.label?.[activeLang] || ""}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Missions Pillars */}
            <div className="max-w-5xl mx-auto px-6 space-y-8">
              <div className="text-center space-y-2">
                <span className="text-xs font-bold text-[#E67E22] uppercase tracking-widest">
                  {missions.badge?.[activeLang] || "NOTRE VOCATION"}
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-[#6B3E1E]">
                  {missions.title?.[activeLang] || ""}
                </h2>
                <p className="text-sm text-stone-500 max-w-xl mx-auto">
                  {missions.subtitle?.[activeLang] || ""}
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {missions.pillars?.map((p: any, idx: number) => (
                  <div key={idx} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3">
                    <h3 className="text-lg font-bold text-[#6B3E1E]">{p.title?.[activeLang] || ""}</h3>
                    <p className="text-xs text-stone-600 leading-relaxed">{p.description?.[activeLang] || ""}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Donation CTA */}
            <div className="max-w-5xl mx-auto px-6">
              <div className="bg-[#6B3E1E] text-white p-8 md:p-12 rounded-3xl text-center space-y-4">
                <h2 className="text-2xl md:text-3xl font-bold">{donationCta.title?.[activeLang] || ""}</h2>
                <p className="text-sm text-white/80 max-w-2xl mx-auto">{donationCta.description?.[activeLang] || ""}</p>
                <div className="pt-2">
                  <span className="inline-block px-8 py-3 bg-[#E67E22] text-white font-bold rounded-full text-sm">
                    {donationCta.buttonText?.[activeLang] || "Faire un don"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'nous': {
        const pcaHero = draftData?.pcaHero || {};
        const presentation = draftData?.presentation || {};
        const vision = draftData?.vision || {};
        const mission = draftData?.mission || {};
        const historique = draftData?.historique || {};
        const valeurs = draftData?.valeurs || [];
        const bureauExecutif = draftData?.bureauExecutif || {};
        const equipe = draftData?.equipe || {};

        return (
          <div className="bg-[#FAF9F6] text-stone-800 space-y-16 pb-16">
            {/* Hero PCA */}
            <div className="bg-white p-8 md:p-12 border-b border-stone-200">
              <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10">
                <div className="flex-1 space-y-4">
                  <span className="px-3 py-1 bg-[#E67E22]/10 text-[#E67E22] text-xs font-bold uppercase rounded-full">
                    {pcaHero.heroLabel?.[activeLang] || "À PROPOS DU FAFE"}
                  </span>
                  <h1 className="text-4xl md:text-5xl font-bold text-[#6B3E1E] font-heading">
                    {pcaHero.heroTitle?.[activeLang] || "NOUS"}
                  </h1>
                  <p className="text-stone-600 text-base leading-relaxed">
                    {pcaHero.heroDescription?.[activeLang] || ""}
                  </p>
                  <div className="border-l-4 border-[#E67E22] pl-4 py-1 mt-4">
                    <p className="text-xs font-bold uppercase text-stone-400">PCA DU FAFE</p>
                    <p className="text-lg font-bold text-[#6B3E1E]">{pcaHero.pcaName}</p>
                    <p className="text-xs text-[#E67E22] font-semibold">{pcaHero.pcaTitle?.[activeLang] || ""}</p>
                  </div>
                </div>

                <div className="w-64 h-80 rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-stone-100 shrink-0">
                  <img src={pcaHero.pcaPhoto} alt={pcaHero.pcaName} className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            {/* Presentation */}
            <div className="max-w-4xl mx-auto px-6 text-center space-y-4">
              <span className="text-xs font-bold text-[#E67E22] uppercase tracking-widest">
                {presentation.title?.[activeLang] || "QUI SOMMES-NOUS ?"}
              </span>
              <p className="text-stone-600 text-base leading-relaxed whitespace-pre-wrap">
                {presentation.description?.[activeLang] || ""}
              </p>
            </div>

            {/* History */}
            <div className="max-w-5xl mx-auto px-6 space-y-8">
              <div className="text-center">
                <span className="text-xs font-bold text-[#E67E22] uppercase tracking-widest">
                  {historique.title?.[activeLang] || "NOTRE HISTOIRE"}
                </span>
                <h3 className="text-2xl font-bold text-[#6B3E1E]">
                  {historique.subtitle?.[activeLang] || ""}
                </h3>
              </div>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                {historique.events?.map((evt: any, i: number) => (
                  <div key={i} className="bg-white p-5 rounded-2xl border border-stone-200 text-center shadow-sm">
                    <span className="text-2xl font-bold text-[#D4AF37] block mb-2">{evt.year}</span>
                    <h4 className="text-sm font-bold text-[#6B3E1E] mb-1">{evt.title?.[activeLang] || ""}</h4>
                    <p className="text-xs text-stone-500">{evt.description?.[activeLang] || ""}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Vision & Mission */}
            <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-3">
                <h3 className="text-xl font-bold text-[#6B3E1E]">{vision.title?.[activeLang] || "VISION"}</h3>
                <p className="text-sm text-stone-600 leading-relaxed">{vision.description?.[activeLang] || ""}</p>
              </div>
              <div className="bg-[#6B3E1E] text-white p-8 rounded-3xl shadow-xl space-y-3">
                <h3 className="text-xl font-bold text-[#D4AF37]">{mission.title?.[activeLang] || "MISSION"}</h3>
                <p className="text-sm text-stone-200 leading-relaxed">{mission.description?.[activeLang] || ""}</p>
              </div>
            </div>

            {/* Values */}
            <div className="max-w-5xl mx-auto px-6 space-y-6 text-center">
              <h3 className="text-2xl font-bold text-[#6B3E1E]">Nos Valeurs</h3>
              <div className="flex flex-wrap justify-center gap-4">
                {valeurs.map((val: any, idx: number) => (
                  <div key={idx} className="bg-white px-6 py-4 rounded-xl border border-stone-200 shadow-sm font-bold text-[#6B3E1E] text-sm">
                    {val.title?.[activeLang] || ""}
                  </div>
                ))}
              </div>
            </div>

            {/* Bureau & Equipe */}
            <div className="max-w-5xl mx-auto px-6 space-y-8">
              <h3 className="text-2xl font-bold text-[#6B3E1E] text-center">{bureauExecutif.title?.[activeLang] || "Le Bureau Exécutif"}</h3>
              <div className="grid sm:grid-cols-3 gap-6">
                {bureauExecutif.members?.map((m: any, idx: number) => (
                  <div key={idx} className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm text-center">
                    <img src={m.photo} alt={m.name} className="w-full aspect-[4/5] object-cover" />
                    <div className="p-4">
                      <h4 className="font-bold text-[#6B3E1E]">{m.name}</h4>
                      <p className="text-xs text-[#E67E22] font-semibold">{m.role?.[activeLang] || ""}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      case 'dons': {
        const hero = draftData?.hero || {};
        const instructions = draftData?.instructions || {};
        const bankDetails = draftData?.bankDetails || {};

        return (
          <div className="bg-[#FAF9F6] text-stone-800 p-8 max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-3">
              <span className="text-xs font-bold text-[#E67E22] uppercase tracking-widest">
                {hero.badge?.[activeLang] || "DONS & SOUTIEN"}
              </span>
              <h1 className="text-3xl font-bold text-[#6B3E1E]">{hero.title?.[activeLang] || ""}</h1>
              <p className="text-sm text-stone-600 max-w-xl mx-auto">{hero.description?.[activeLang] || ""}</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-[#6B3E1E] border-b pb-3">{instructions.title?.[activeLang] || "Coordonnées Bancaires"}</h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs font-bold text-stone-400 uppercase block">Banque</span>
                  <span className="font-semibold text-stone-700">{bankDetails.bankName}</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-stone-400 uppercase block">Numéro de compte</span>
                  <span className="font-semibold text-stone-700 font-mono">{bankDetails.accountNumber}</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-stone-400 uppercase block">IBAN</span>
                  <span className="font-semibold text-stone-700 font-mono">{bankDetails.iban}</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-stone-400 uppercase block">SWIFT / BIC</span>
                  <span className="font-semibold text-stone-700 font-mono">{bankDetails.swift}</span>
                </div>
              </div>
              <p className="text-xs text-stone-500 italic bg-stone-50 p-4 rounded-xl border">
                {instructions.note?.[activeLang] || ""}
              </p>
            </div>
          </div>
        );
      }

      default: {
        return (
          <div className="p-12 text-center text-stone-500">
            <ShieldCheck className="w-12 h-12 text-[#E67E22] mx-auto mb-3" />
            <h3 className="text-xl font-bold text-stone-700 mb-1">Prévisualisation active pour : {pageId}</h3>
            <p className="text-xs text-stone-400">Tous les champs de contenu sont enregistrés en mémoire vive.</p>
          </div>
        );
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-stone-900/90 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Top Bar Controls */}
      <div className="bg-stone-900 text-white px-6 py-3 border-b border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-300">Mode Prévisualisation</span>
          </div>
          <span className="text-xs text-stone-500">|</span>
          <span className="text-xs font-semibold text-[#E67E22] uppercase">Page : {pageId}</span>
        </div>

        {/* Device Switcher */}
        <div className="flex items-center gap-1 bg-stone-800 p-1 rounded-xl border border-stone-700">
          <button
            onClick={() => setDevice('desktop')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              device === 'desktop' ? 'bg-[#E67E22] text-white' : 'text-stone-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            Ordinateur
          </button>
          <button
            onClick={() => setDevice('tablet')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              device === 'tablet' ? 'bg-[#E67E22] text-white' : 'text-stone-400 hover:text-white'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            Tablette
          </button>
          <button
            onClick={() => setDevice('mobile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              device === 'mobile' ? 'bg-[#E67E22] text-white' : 'text-stone-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Mobile
          </button>
        </div>

        {/* Language & Close */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-stone-800 rounded-xl p-1 border border-stone-700 text-xs">
            <button
              onClick={() => onLangChange('fr')}
              className={`px-2.5 py-1 rounded-lg font-bold ${
                activeLang === 'fr' ? 'bg-[#E67E22] text-white' : 'text-stone-400 hover:text-white'
              }`}
            >
              🇫🇷 FR
            </button>
            <button
              onClick={() => onLangChange('en')}
              className={`px-2.5 py-1 rounded-lg font-bold ${
                activeLang === 'en' ? 'bg-[#E67E22] text-white' : 'text-stone-400 hover:text-white'
              }`}
            >
              🇬🇧 EN
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center items-start">
        <div className={`transition-all duration-300 bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-700 ${getContainerWidth()}`}>
          {renderPreviewContent()}
        </div>
      </div>

    </div>
  );
}
