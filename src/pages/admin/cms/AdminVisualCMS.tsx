import { useState, useEffect } from 'react';
import { Save, Plus, Trash, Image as ImageIcon } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { useLanguageStore } from '../../../store/language';
import { getCMSGlobal, updateCMSGlobal, defaultHeroSlides, defaultBankDetails } from '../../../lib/cms';
import { CMSHeroSlide, CMSBankDetails } from '../../../types';

export function AdminVisualCMS() {
  const [slides, setSlides] = useState<CMSHeroSlide[]>([]);
  const [bankDetails, setBankDetails] = useState<CMSBankDetails>(defaultBankDetails);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'FR' | 'EN'>('FR');
  const [activeSection, setActiveSection] = useState<'HERO' | 'BANK'>('HERO');
  
  const { language } = useLanguageStore();

  useEffect(() => {
    loadCMS();
  }, []);

  const loadCMS = async () => {
    setLoading(true);
    const data = await getCMSGlobal();
    if (data) {
      if (data.heroSlides) setSlides(data.heroSlides);
      if (data.bankDetails) setBankDetails(data.bankDetails);
    } else {
      setSlides(defaultHeroSlides);
      setBankDetails(defaultBankDetails);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateCMSGlobal({
        heroSlides: slides,
        bankDetails: bankDetails
      });
      alert('Modifications enregistrées avec succès.');
    } catch (error) {
      alert('Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  const addSlide = () => {
    const newSlide: CMSHeroSlide = {
      id: `slide-${Date.now()}`,
      image: '',
      title: { fr: '', en: '' },
      shortText: { fr: '', en: '' },
      buttonText: { fr: '', en: '' },
      link: '/rejoindre',
      status: 'ACTIVE',
      order: slides.length + 1
    };
    setSlides([...slides, newSlide]);
  };

  const updateSlide = (id: string, field: string, value: string, isLocalized: boolean = true) => {
    setSlides(slides.map(s => {
      if (s.id !== id) return s;
      
      if (isLocalized) {
        return {
          ...s,
          [field]: {
            ...(s as any)[field],
            [activeTab.toLowerCase()]: value
          }
        };
      } else {
        return {
          ...s,
          [field]: value
        };
      }
    }));
  };

  const removeSlide = (id: string) => {
    if (confirm('Supprimer ce slide ?')) {
      setSlides(slides.filter(s => s.id !== id));
    }
  };

  if (loading) return <div>Chargement de l'éditeur...</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 min-h-[calc(100vh-100px)] flex overflow-hidden">
      
      {/* Sidebar - Sections */}
      <div className="w-64 bg-stone-50 border-r border-stone-200 p-4">
        <h2 className="font-bold text-[#6B3E1E] mb-6 px-2">Éditeur Visuel</h2>
        
        <nav className="space-y-2">
          <button 
            onClick={() => setActiveSection('HERO')}
            className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
              activeSection === 'HERO' ? 'bg-[#E67E22]/10 text-[#E67E22]' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Homepage Hero
          </button>
          <button 
            onClick={() => setActiveSection('BANK')}
            className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
              activeSection === 'BANK' ? 'bg-[#E67E22]/10 text-[#E67E22]' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Coordonnées Bancaires
          </button>
        </nav>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Editor Topbar */}
        <div className="h-16 border-b border-stone-200 px-6 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('FR')}
              className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                activeTab === 'FR' ? 'bg-white shadow-sm text-[#6B3E1E]' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              FR
            </button>
            <button 
              onClick={() => setActiveTab('EN')}
              className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                activeTab === 'EN' ? 'bg-white shadow-sm text-[#6B3E1E]' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              EN
            </button>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving} className="bg-[#00843D] hover:bg-[#007033] text-white">
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Enregistrement...' : 'Publier'}
            </Button>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#FAF9F6]">
          <div className="max-w-3xl mx-auto space-y-8">
            
            {activeSection === 'HERO' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold font-heading text-[#6B3E1E]">Slides Hero (Homepage)</h3>
                  <Button onClick={addSlide} variant="outline" size="sm" className="gap-2">
                    <Plus className="w-4 h-4" /> Ajouter Slide
                  </Button>
                </div>
                
                {slides.map((slide, index) => (
                  <div key={slide.id} className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                    <div className="flex justify-between items-center mb-6 border-b border-stone-100 pb-4">
                      <h4 className="font-bold text-stone-700">Slide {index + 1}</h4>
                      <button onClick={() => removeSlide(slide.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Image URL</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={slide.image} 
                            onChange={(e) => updateSlide(slide.id, 'image', e.target.value, false)}
                            className="flex-1 px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Titre ({activeTab})</label>
                        <input 
                          type="text" 
                          value={activeTab === 'FR' ? slide.title.fr : slide.title.en} 
                          onChange={(e) => updateSlide(slide.id, 'title', e.target.value, true)}
                          className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Texte ({activeTab})</label>
                        <textarea 
                          rows={3}
                          value={activeTab === 'FR' ? slide.shortText.fr : slide.shortText.en} 
                          onChange={(e) => updateSlide(slide.id, 'shortText', e.target.value, true)}
                          className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-1">Bouton ({activeTab})</label>
                          <input 
                            type="text" 
                            value={activeTab === 'FR' ? slide.buttonText.fr : slide.buttonText.en} 
                            onChange={(e) => updateSlide(slide.id, 'buttonText', e.target.value, true)}
                            className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-1">Lien de destination</label>
                          <input 
                            type="text" 
                            value={slide.link} 
                            onChange={(e) => updateSlide(slide.id, 'link', e.target.value, false)}
                            className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Statut</label>
                        <select 
                          value={slide.status}
                          onChange={(e) => updateSlide(slide.id, 'status', e.target.value, false)}
                          className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                        >
                          <option value="ACTIVE">Actif</option>
                          <option value="INACTIVE">Inactif</option>
                        </select>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'BANK' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold font-heading text-[#6B3E1E] mb-4">Coordonnées Bancaires FAFE</h3>
                
                <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Nom de la Banque</label>
                    <input 
                      type="text" 
                      value={bankDetails.bankName} 
                      onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                      className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Numéro de compte</label>
                    <input 
                      type="text" 
                      value={bankDetails.accountNumber} 
                      onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                      className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">IBAN</label>
                    <input 
                      type="text" 
                      value={bankDetails.iban} 
                      onChange={(e) => setBankDetails({...bankDetails, iban: e.target.value})}
                      className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">SWIFT / BIC</label>
                    <input 
                      type="text" 
                      value={bankDetails.swift} 
                      onChange={(e) => setBankDetails({...bankDetails, swift: e.target.value})}
                      className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
