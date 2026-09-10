import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, storage } from '../lib/firebase';
import { SiteBrandingSettings } from '../types';

export const BRANDING_STORAGE_FOLDER = 'branding';
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

// File validation limits & types
const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/svg+xml'
];

const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.svg'];
const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024; // 4 MB

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  width?: number;
  height?: number;
}

/**
 * Validates an uploaded file strictly before upload:
 * - MIME type
 * - Extension
 * - Max size
 * - Real image exploitation check
 * - SVG anti-XSS safety check
 */
export async function validateBrandingFile(file: File): Promise<FileValidationResult> {
  if (!file) {
    return { valid: false, error: 'Aucun fichier sélectionné.' };
  }

  // 1. Size check
  if (file.size === 0) {
    return { valid: false, error: 'Le fichier sélectionné est vide.' };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { 
      valid: false, 
      error: `Le fichier est trop volumineux (${(file.size / (1024 * 1024)).toFixed(1)} Mo). La taille maximale est de 4 Mo.` 
    };
  }

  // 2. MIME type check
  const mimeType = file.type.toLowerCase();
  const hasValidMime = ALLOWED_MIME_TYPES.includes(mimeType);
  if (!hasValidMime && mimeType !== '') {
    return {
      valid: false,
      error: `Format de fichier non autorisé (${mimeType}). Utilisez PNG, JPG, WEBP ou SVG.`
    };
  }

  // 3. Extension check
  const fileName = file.name.toLowerCase();
  const hasValidExt = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));
  if (!hasValidExt) {
    return {
      valid: false,
      error: `Extension de fichier non autorisée. Formats acceptés : .png, .jpg, .jpeg, .webp, .svg`
    };
  }

  // 4. If SVG: sanitize check against script injection
  if (mimeType === 'image/svg+xml' || fileName.endsWith('.svg')) {
    try {
      const text = await file.text();
      const lowerText = text.toLowerCase();
      if (
        lowerText.includes('<script') ||
        lowerText.includes('javascript:') ||
        lowerText.includes('onload=') ||
        lowerText.includes('onerror=') ||
        lowerText.includes('onclick=')
      ) {
        return {
          valid: false,
          error: 'Le fichier SVG contient des balises de script ou des gestionnaires d\'événements non sécurisés.'
        };
      }
    } catch {
      return { valid: false, error: 'Impossible de lire le fichier SVG pour validation de sécurité.' };
    }
    return { valid: true };
  }

  // 5. Check real image loading in browser
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      URL.revokeObjectURL(objectUrl);
      if (width === 0 || height === 0) {
        resolve({ valid: false, error: 'L\'image semble endommagée ou invalide.' });
      } else {
        resolve({ valid: true, width, height });
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ valid: false, error: 'Le fichier sélectionné ne peut pas être interprété comme une image valide.' });
    };
    img.src = objectUrl;
  });
}

/**
 * Uploads an image asset to Firebase Storage in /branding/
 */
export async function uploadBrandingAsset(
  file: File,
  assetType: 'logo' | 'logoAlt' | 'favicon'
): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const timestamp = Date.now();
  const path = `${BRANDING_STORAGE_FOLDER}/${assetType}_${timestamp}_${safeName}`;
  const storageRef = ref(storage, path);

  const metadata = {
    contentType: file.type || (file.name.endsWith('.svg') ? 'image/svg+xml' : 'image/png'),
    customMetadata: {
      assetType,
      uploadedAt: timestamp.toString()
    }
  };

  await uploadBytes(storageRef, file, metadata);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
}

/**
 * Safely tries to delete an old asset from Firebase Storage if it's hosted there
 */
export async function deleteBrandingAsset(url?: string): Promise<void> {
  if (!url || !url.includes('firebasestorage.googleapis.com')) return;
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch (err) {
    // If delete fails (e.g. storage permissions or object not found), silently continue
    console.warn('Unable to delete old branding asset from Storage:', err);
  }
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
  await setDoc(docRef, newSettings, { merge: true });

  // 2. Also mirror to site_settings/branding for robust rule compatibility
  try {
    const docRefAlt = doc(db, 'site_settings', BRANDING_DOC_ID);
    await setDoc(docRefAlt, newSettings, { merge: true });
  } catch (e) {
    // Non-blocking mirror
  }

  // 3. Update localStorage cache
  localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(newSettings));

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
 * Cache-busting helper that adds ?v=timestamp to ensure browsers fetch fresh version
 * when updated, without creating invalid requests on every render.
 */
export function getCacheBustedUrl(url?: string, version?: number): string {
  if (!url) return '';
  if (!version) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${version}`;
}
