import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LocalizedString {
  fr: string;
  en: string;
}

interface LanguageState {
  language: 'fr' | 'en';
  setLanguage: (lang: 'fr' | 'en') => void;
  t: (fr: string, en?: string) => string;
  tl: (localizedString?: LocalizedString | null) => string;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'fr',
      setLanguage: (lang) => set({ language: lang }),
      t: (fr, en) => get().language === 'fr' ? fr : (en || fr),
      tl: (localizedString) => {
        if (!localizedString) return '';
        return get().language === 'fr' ? localizedString.fr : (localizedString.en || localizedString.fr);
      }
    }),
    { name: 'fafe-language' }
  )
);
