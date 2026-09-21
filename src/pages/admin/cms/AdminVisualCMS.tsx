import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { getCMSGlobal, updateCMSGlobal, defaultBankDetails } from '../../../lib/cms';
import { CMSBankDetails } from '../../../types';

export function AdminVisualCMS() {
  const [bankDetails, setBankDetails] = useState<CMSBankDetails>(defaultBankDetails);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCMS();
  }, []);

  const loadCMS = async () => {
    setLoading(true);
    const data = await getCMSGlobal();
    if (data) {
      if (data.bankDetails) setBankDetails(data.bankDetails);
    } else {
      setBankDetails(defaultBankDetails);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update Global CMS with bank details
      await updateCMSGlobal({
        bankDetails: bankDetails
      });

      alert('Coordonnées bancaires enregistrées avec succès.');
    } catch (error) {
      console.error(error);
      alert('Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Chargement de l'éditeur...</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 min-h-[calc(100vh-100px)] flex flex-col overflow-hidden">
      {/* Editor Topbar */}
      <div className="h-16 border-b border-stone-200 px-6 flex items-center justify-between bg-white">
        <h2 className="font-bold text-[#063F3A]">Coordonnées Bancaires FAFE</h2>
        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={saving} className="bg-[#00843D] hover:bg-[#007033] text-white">
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto p-8 bg-[#FAF9F6]">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="space-y-6">
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
        </div>
      </div>
    </div>
  );
}
