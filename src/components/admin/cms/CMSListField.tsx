import React, { useState } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, Edit2, Check, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '../../ui/Button';
import { CMSImageField } from './CMSImageField';

interface CMSListFieldProps {
  label: string;
  items: any[];
  onChange: (items: any[]) => void;
  activeLang: 'fr' | 'en';
  itemType: 'stats' | 'timeline' | 'pillars' | 'members' | 'valeurs' | 'reports' | 'partners';
  helperText?: string;
}

export function CMSListField({
  label,
  items = [],
  onChange,
  activeLang,
  itemType,
  helperText
}: CMSListFieldProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAddItem = () => {
    let newItem: any = {};
    switch (itemType) {
      case 'stats':
        newItem = { value: "100+", label: { fr: "Nouvelle statistique", en: "New Statistic" }, icon: "TrendingUp" };
        break;
      case 'timeline':
        newItem = { year: `${new Date().getFullYear()}`, title: { fr: "Événement clé", en: "Key milestone" }, description: { fr: "Description de l'événement...", en: "Milestone description..." } };
        break;
      case 'pillars':
        newItem = { title: { fr: "Nouveau pilier", en: "New pillar" }, description: { fr: "Description du pilier...", en: "Pillar description..." }, icon: "Star" };
        break;
      case 'members':
        newItem = { name: "Nom du membre", role: { fr: "Rôle / Fonction", en: "Role / Position" }, photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400" };
        break;
      case 'valeurs':
        newItem = { title: { fr: "VALEUR", en: "VALUE" }, icon: "Star" };
        break;
      case 'reports':
        newItem = { title: { fr: "Rapport annuel (PDF)", en: "Annual report (PDF)" }, link: "#" };
        break;
      case 'partners':
        newItem = { name: "Nom du partenaire", logo: "" };
        break;
    }
    const updated = [...items, newItem];
    onChange(updated);
    setEditingIndex(updated.length - 1);
  };

  const handleRemoveItem = (index: number) => {
    if (confirm("Voulez-vous supprimer cet élément ?")) {
      const updated = items.filter((_, i) => i !== index);
      onChange(updated);
      if (editingIndex === index) setEditingIndex(null);
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= items.length) return;
    const updated = [...items];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;
    onChange(updated);
    if (editingIndex === index) setEditingIndex(target);
  };

  const handleItemFieldChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    const item = { ...updated[index] };
    
    // Check if field is localized
    if (item[field] && typeof item[field] === 'object' && ('fr' in item[field] || 'en' in item[field])) {
      item[field] = {
        ...item[field],
        [activeLang]: value
      };
    } else {
      item[field] = value;
    }
    
    updated[index] = item;
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
            {label} ({items.length})
          </label>
          {helperText && <p className="text-[11px] text-stone-400">{helperText}</p>}
        </div>
        <Button
          type="button"
          size="sm"
          onClick={handleAddItem}
          className="bg-[#E67E22] hover:bg-[#c96a1a] text-white text-xs h-8"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Ajouter un élément
        </Button>
      </div>

      <div className="space-y-2">
        {items.map((item, index) => {
          const isEditing = editingIndex === index;

          return (
            <div
              key={index}
              className={`rounded-xl border transition-all ${
                isEditing 
                  ? 'border-[#E67E22] bg-orange-50/10 shadow-sm' 
                  : 'border-stone-200 bg-stone-50/50 hover:bg-stone-50'
              }`}
            >
              {/* Item Header / Summary */}
              <div className="p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="w-6 h-6 rounded-full bg-stone-200 text-stone-600 font-bold text-xs flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>

                  {item.photo && (
                    <img src={item.photo} alt="mini" className="w-8 h-8 rounded-lg object-cover border shrink-0" />
                  )}

                  <div className="min-w-0">
                    <p className="text-xs font-bold text-stone-800 truncate">
                      {item.title?.[activeLang] || item.name || item.value || `Élément #${index + 1}`}
                    </p>
                    <p className="text-[11px] text-stone-400 truncate">
                      {item.role?.[activeLang] || item.label?.[activeLang] || item.year || item.link || ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMove(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-30"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(index, 'down')}
                    disabled={index === items.length - 1}
                    className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-30"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingIndex(isEditing ? null : index)}
                    className="p-1.5 text-[#E67E22] hover:bg-[#E67E22]/10 rounded-lg transition-colors ml-1"
                  >
                    {isEditing ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Editing Form for this item */}
              {isEditing && (
                <div className="p-4 border-t border-stone-200 bg-white rounded-b-xl space-y-3">
                  
                  {itemType === 'stats' && (
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-stone-600 mb-1">Valeur / Chiffre</label>
                        <input
                          type="text"
                          value={item.value || ''}
                          onChange={(e) => handleItemFieldChange(index, 'value', e.target.value)}
                          placeholder="Ex: 5 000+"
                          className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-600 mb-1">
                          Libellé ({activeLang.toUpperCase()})
                        </label>
                        <input
                          type="text"
                          value={item.label?.[activeLang] || ''}
                          onChange={(e) => handleItemFieldChange(index, 'label', e.target.value)}
                          placeholder="Ex: Femmes accompagnées"
                          className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg"
                        />
                      </div>
                    </div>
                  )}

                  {itemType === 'timeline' && (
                    <div className="space-y-3">
                      <div className="grid sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-stone-600 mb-1">Année / Période</label>
                          <input
                            type="text"
                            value={item.year || ''}
                            onChange={(e) => handleItemFieldChange(index, 'year', e.target.value)}
                            placeholder="Ex: 2020 ou Aujourd'hui"
                            className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-stone-600 mb-1">
                            Titre de l'étape ({activeLang.toUpperCase()})
                          </label>
                          <input
                            type="text"
                            value={item.title?.[activeLang] || ''}
                            onChange={(e) => handleItemFieldChange(index, 'title', e.target.value)}
                            placeholder="Ex: Lancement officiel"
                            className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-600 mb-1">
                          Description ({activeLang.toUpperCase()})
                        </label>
                        <textarea
                          rows={2}
                          value={item.description?.[activeLang] || ''}
                          onChange={(e) => handleItemFieldChange(index, 'description', e.target.value)}
                          placeholder="Détaillez cette étape..."
                          className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg"
                        />
                      </div>
                    </div>
                  )}

                  {itemType === 'pillars' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-stone-600 mb-1">
                          Titre du pilier ({activeLang.toUpperCase()})
                        </label>
                        <input
                          type="text"
                          value={item.title?.[activeLang] || ''}
                          onChange={(e) => handleItemFieldChange(index, 'title', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-600 mb-1">
                          Description ({activeLang.toUpperCase()})
                        </label>
                        <textarea
                          rows={2}
                          value={item.description?.[activeLang] || ''}
                          onChange={(e) => handleItemFieldChange(index, 'description', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg"
                        />
                      </div>
                    </div>
                  )}

                  {itemType === 'members' && (
                    <div className="space-y-3">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-stone-600 mb-1">Nom complet</label>
                          <input
                            type="text"
                            value={item.name || ''}
                            onChange={(e) => handleItemFieldChange(index, 'name', e.target.value)}
                            className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-stone-600 mb-1">
                            Rôle / Titre ({activeLang.toUpperCase()})
                          </label>
                          <input
                            type="text"
                            value={item.role?.[activeLang] || ''}
                            onChange={(e) => handleItemFieldChange(index, 'role', e.target.value)}
                            className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg"
                          />
                        </div>
                      </div>
                      <CMSImageField
                        label="Photo du membre"
                        value={item.photo || ''}
                        onChange={(url) => handleItemFieldChange(index, 'photo', url)}
                        aspectRatio="portrait"
                      />
                    </div>
                  )}

                  {itemType === 'valeurs' && (
                    <div>
                      <label className="block text-xs font-bold text-stone-600 mb-1">
                        Valeur ({activeLang.toUpperCase()})
                      </label>
                      <input
                        type="text"
                        value={item.title?.[activeLang] || ''}
                        onChange={(e) => handleItemFieldChange(index, 'title', e.target.value)}
                        placeholder="Ex: SOLIDARITÉ"
                        className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg uppercase"
                      />
                    </div>
                  )}

                  {itemType === 'reports' && (
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-stone-600 mb-1">
                          Titre du rapport ({activeLang.toUpperCase()})
                        </label>
                        <input
                          type="text"
                          value={item.title?.[activeLang] || ''}
                          onChange={(e) => handleItemFieldChange(index, 'title', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-600 mb-1">Lien de téléchargement</label>
                        <input
                          type="text"
                          value={item.link || ''}
                          onChange={(e) => handleItemFieldChange(index, 'link', e.target.value)}
                          placeholder="https://... ou #"
                          className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg"
                        />
                      </div>
                    </div>
                  )}

                  {itemType === 'partners' && (
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-stone-600 mb-1">Nom de l'organisation</label>
                        <input
                          type="text"
                          value={item.name || ''}
                          onChange={(e) => handleItemFieldChange(index, 'name', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-600 mb-1">Logo (URL)</label>
                        <input
                          type="text"
                          value={item.logo || ''}
                          onChange={(e) => handleItemFieldChange(index, 'logo', e.target.value)}
                          placeholder="https://..."
                          className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setEditingIndex(null)}
                      className="bg-stone-800 text-white text-xs h-7"
                    >
                      Terminer la modification
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
