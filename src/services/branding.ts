import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SiteBrandingSettings } from '../types';
import { cleanFirestoreData } from '../lib/cms';
import { uploadImage } from '../lib/imageUpload';

export const BRANDING_DOC_PATH = 'siteSettings';
export const BRANDING_DOC_ID = 'branding';
export const LOCAL_CACHE_KEY = 'fafe_site_branding';

export const DEFAULT_BRANDING: SiteBrandingSettings = {
  logoUrl: '',
  logoAltUrl: '',
  faviconUrl: '',
  displayMode: 'image_only',
  siteName: 'FAFE',
  updatedAt: 0
};

/**
 * Validates a file for branding (logo/favicon)
 */
export async function validateBrandingFile(file: File): Promise<{ valid: boolean; error?: string }> {
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Format non supporté.' };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { valid: false, error: 'Fichier trop volumineux (> 5 Mo).' };
  }
  return { valid: true };
}

/**
 * Uploads an image asset to branding (returns data URL)
 */
export async function uploadBrandingAsset(
  file: File,
  assetType: 'logo' | 'logoAlt' | 'favicon'
): Promise<string> {
  const kind = assetType === 'favicon' ? 'favicon' : 'logo';
  try {
    const dataUrl = await uploadImage(file, kind);
    return dataUrl;
  } catch (err: any) {
    console.error(`[CMS] ERREUR — Upload Branding: ${err?.message || err}`);
    throw new Error(`Échec de l'upload de l'asset : ${err?.message || 'Erreur inconnue'}.`);
  }
}

/**
 * Safely tries to delete an old asset (does nothing as we use data URLs now)
 */
export async function deleteBrandingAsset(url?: string): Promise<void> {
  // Data URLs are embedded in Firestore, no storage file to delete
  return Promise.resolve();
}

/**
 * Reads branding settings from Firestore with local fallback
 */
export async function getBrandingSettings(): Promise<SiteBrandingSettings> {
  // Check local cache first
  let cached: SiteBrandingSettings = { ...DEFAULT_BRANDING };
  try {
    const raw = localStorage.getItem(LOCAL_CACHE_KEY);
    if (raw) {
      cached = { ...DEFAULT_BRANDING, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Error reading branding cache:', e);
  }

  try {
    const docRef = doc(db, BRANDING_DOC_PATH, BRANDING_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as SiteBrandingSettings;
      const merged: SiteBrandingSettings = {
        ...DEFAULT_BRANDING,
        ...data
      };
      localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(merged));
      applyFavicon(merged.faviconUrl, merged.updatedAt);
      return merged;
    }
  } catch (err) {
    console.warn('Error reading branding from Firestore:', err);
  }

  return cached;
}

/**
 * Saves branding settings to Firestore and updates local cache & favicon
 */
export async function saveBrandingSettings(
  updates: Partial<SiteBrandingSettings>,
  updatedBy: string = 'SUPER_ADMIN'
): Promise<SiteBrandingSettings> {
  console.log('[CMS] Début sauvegarde Firestore dans siteSettings/branding');
  const current = await getBrandingSettings();
  const timestamp = Date.now();

  const newSettings: SiteBrandingSettings = {
    ...current,
    ...updates,
    updatedAt: timestamp,
    updatedBy
  };

  // 1. Update Firestore in siteSettings/branding
  const docRef = doc(db, BRANDING_DOC_PATH, BRANDING_DOC_ID);
  try {
    await setDoc(docRef, cleanFirestoreData(newSettings), { merge: true });
    console.log('[CMS] Firestore sauvegardé');
  } catch (err: any) {
    console.error(`[CMS] ERREUR — Sauvegarde Firestore: ${err?.message || err}`);
    throw new Error(`Erreur lors de l'enregistrement dans Firebase Firestore : ${err?.message || 'timeout'}.`);
  }

  // 2. Mirroring (non-blocking)
  try {
    const docRefAlt = doc(db, 'site_settings', BRANDING_DOC_ID);
    await setDoc(docRefAlt, cleanFirestoreData(newSettings), { merge: true });
  } catch (e) {}

  try {
    const globalCmsRef = doc(db, 'cms', 'global');
    await setDoc(globalCmsRef, { 
      logoUrl: newSettings.logoUrl, 
      branding: cleanFirestoreData(newSettings) 
    }, { merge: true });
  } catch (e) {}

  // 3. Update localStorage cache
  localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(newSettings));
  console.log('[CMS] Mise à jour interface');

  // 4. Update favicon dynamically
  applyFavicon(newSettings.faviconUrl, timestamp);

  return newSettings;
}

/**
 * Dynamically updates the browser tab favicon in HTML head
 */
export function applyFavicon(faviconUrl?: string, version?: number): void {
  if (typeof document === 'undefined') return;

  const url = faviconUrl ? getCacheBustedUrl(faviconUrl, version) : '/favicon.svg';

  // Find or create link[rel='icon']
  let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  
  if (url.endsWith('.svg') || url.includes('image%2Fsvg')) {
    link.type = 'image/svg+xml';
  } else if (url.endsWith('.png') || url.includes('image%2Fpng')) {
    link.type = 'image/png';
  } else if (url.endsWith('.ico')) {
    link.type = 'image/x-icon';
  }

  link.href = url;

  // Also update apple-touch-icon if present
  let appleLink: HTMLLinkElement | null = document.querySelector("link[rel='apple-touch-icon']");
  if (appleLink) {
    appleLink.href = url;
  }
}

/**
 * Cache-busting helper
 */
export function getCacheBustedUrl(url?: string, version?: number): string {
  if (!url) return '';
  if (!version) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${version}`;
}
