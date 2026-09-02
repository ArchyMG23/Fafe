import { LocalizedString } from '../../../types';

interface CMSFieldWrapperProps {
  label: string;
  value: LocalizedString | string;
  onChange: (val: any) => void;
  type?: 'text' | 'textarea' | 'url';
  activeLang: 'fr' | 'en';
  onLangChange?: (lang: 'fr' | 'en') => void;
  placeholder?: string;
  helperText?: string;
  rows?: number;
  required?: boolean;
}

export function CMSFieldWrapper({
  label,
  value,
  onChange,
  type = 'text',
  activeLang,
  placeholder,
  helperText,
  rows = 4,
  required = false
}: CMSFieldWrapperProps) {
  const isLocalized = typeof value === 'object' && value !== null && ('fr' in value || 'en' in value);
  const localizedVal: LocalizedString = isLocalized ? (value as LocalizedString) : { fr: value as string, en: value as string };

  const handleInputChange = (text: string) => {
    if (isLocalized) {
      onChange({
        ...localizedVal,
        [activeLang]: text
      });
    } else {
      onChange(text);
    }
  };

  const currentVal = isLocalized ? (localizedVal[activeLang] || '') : (value as string || '');
  const hasFR = isLocalized ? !!localizedVal.fr?.trim() : !!value;
  const hasEN = isLocalized ? !!localizedVal.en?.trim() : !!value;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>

          {isLocalized && (
            <div className="flex items-center gap-1">
              <span 
                className={`w-2 h-2 rounded-full ${hasFR ? 'bg-emerald-500' : 'bg-amber-400'}`} 
                title={hasFR ? "Traduction FR présente" : "Traduction FR manquante"}
              />
              <span 
                className={`w-2 h-2 rounded-full ${hasEN ? 'bg-emerald-500' : 'bg-amber-400'}`} 
                title={hasEN ? "Traduction EN présente" : "Traduction EN manquante"}
              />
            </div>
          )}
        </div>

        {helperText && (
          <span className="text-[11px] text-stone-400 truncate max-w-xs">{helperText}</span>
        )}
      </div>

      <div className="relative">
        {type === 'textarea' ? (
          <textarea
            value={currentVal}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={placeholder || `Saisir le texte en ${activeLang === 'fr' ? 'français' : 'anglais'}...`}
            rows={rows}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-transparent transition-all placeholder:text-stone-300"
          />
        ) : (
          <input
            type={type === 'url' ? 'url' : 'text'}
            value={currentVal}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={placeholder || `Saisir en ${activeLang === 'fr' ? 'français' : 'anglais'}...`}
            className="w-full px-3.5 py-2 text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-transparent transition-all placeholder:text-stone-300"
          />
        )}

        {isLocalized && (
          <div className="absolute right-2.5 bottom-2.5 pointer-events-none">
            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-stone-100 text-stone-500 border border-stone-200">
              {activeLang === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
