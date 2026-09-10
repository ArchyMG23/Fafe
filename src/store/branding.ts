import { create } from 'zustand';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SiteBrandingSettings } from '../types';
import { 
  DEFAULT_BRANDING, 
  LOCAL_CACHE_KEY, 
  BRANDING_DOC_PATH, 
  BRANDING_DOC_ID, 
  getBrandingSettings, 
  applyFavicon 
} from '../services/branding';

interface BrandingStoreState {
  branding: SiteBrandingSettings;
  loading: boolean;
  initialized: boolean;
  fetchBranding: () => Promise<SiteBrandingSettings>;
  setBranding: (settings: SiteBrandingSettings) => void;
  initBrandingListener: () => () => void;
}

// Read initial state synchronously from localStorage cache if available
const getInitialBranding = (): SiteBrandingSettings => {
  try {
    const raw = localStorage.getItem(LOCAL_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_BRANDING, ...parsed };
    }
  } catch (e) {
    // Ignore error
  }
  return { ...DEFAULT_BRANDING };
};

const initialBranding = getInitialBranding();

// Apply initial favicon immediately if cached
if (typeof window !== 'undefined' && initialBranding.faviconUrl) {
  applyFavicon(initialBranding.faviconUrl, initialBranding.updatedAt);
}

export const useBrandingStore = create<BrandingStoreState>((set, get) => ({
  branding: initialBranding,
  loading: false,
  initialized: false,

  setBranding: (settings: SiteBrandingSettings) => {
    set({ branding: settings });
    applyFavicon(settings.faviconUrl, settings.updatedAt);
  },

  fetchBranding: async () => {
    set({ loading: true });
    try {
      const settings = await getBrandingSettings();
      set({ branding: settings, loading: false, initialized: true });
      applyFavicon(settings.faviconUrl, settings.updatedAt);
      return settings;
    } catch (error) {
      console.warn('Failed to fetch site branding:', error);
      set({ loading: false, initialized: true });
      return get().branding;
    }
  },

  initBrandingListener: () => {
    // 1. Initial fetch
    get().fetchBranding();

    // 2. Real-time Firestore subscription
    try {
      const docRef = doc(db, BRANDING_DOC_PATH, BRANDING_DOC_ID);
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as SiteBrandingSettings;
          const merged: SiteBrandingSettings = {
            ...DEFAULT_BRANDING,
            ...data
          };
          localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(merged));
          set({ branding: merged, initialized: true });
          applyFavicon(merged.faviconUrl, merged.updatedAt);
        }
      }, (error) => {
        console.warn('Branding real-time listener error:', error);
      });

      return unsubscribe;
    } catch (err) {
      console.warn('Error setting up branding listener:', err);
      return () => {};
    }
  }
}));
