import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, storage, auth } from '../lib/firebase';
import { SiteBrandingSettings } from '../types';
import { cleanFirestoreData } from '../lib/cms';

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
 * Wraps a promise with a strict timeout to prevent indefinite hangs
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 12000,
  stepDescription: string = 'Opération réseau'
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(
        new Error(
          `Délai d'attente dépassé (${Math.round(timeoutMs / 1000)}s) lors de : "${stepDescription}". Vérifiez votre connexion ou les permissions Firebase, puis réessayez.`
        )
      );
    }, timeoutMs);

    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

/**
 * Converts an image file to an optimized Data URI suitable for direct Firestore storage
 */
export async function fileToOptimizedDataUri(
  file: File,
  maxWidth: number = 800,
  maxHeight: number = 400
): Promise<string> {
  // If SVG, read as standard Data URL
  if (file.type === 'image/svg+xml' || file.name.endsWith('.svg')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier SVG.'));
      reader.readAsDataURL(file);
    });
  }

  // Raster image: render to canvas to ensure reasonable size (< 200KB for Firestore)
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Erreur de lecture du fichier image.'));
        reader.readAsDataURL(file);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL(file.type || 'image/png', 0.9);
      resolve(dataUrl);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Impossible d'interpréter le fichier comme une image valide."));
    };
    img.src = objectUrl;
  });
}

export interface StorageDiagnosticResult {
  success: boolean;
  durationMs: number;
  bucket: string;
  projectId: string;
  authStatus: {
    authenticated: boolean;
    uid: string | null;
    email: string | null;
    role: string;
  };
  stepReached: string;
  downloadUrl?: string;
  error?: string;
  errorCode?: string;
  advice?: string;
}

/**
 * Section 8 : Test Storage Indépendant Minimal Contrôlé
 * SUPER_ADMIN -> upload d'un petit fichier de test -> confirmation upload -> getDownloadURL -> suppression
 */
export async function runStorageDiagnosticTest(): Promise<StorageDiagnosticResult> {
  const startTime = Date.now();
  const currentUser = auth.currentUser;
  const configuredBucket = storage.app.options.storageBucket || 'NON_DEFINI';
  const projectId = storage.app.options.projectId || 'fafe-platform';

  let role = 'NON_AUTHENTIFIE';
  if (currentUser) {
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      role = userDoc.exists() ? (userDoc.data()?.role || 'MEMBER') : 'DOCUMENT_UTILISATEUR_NON_TROUVE';
    } catch (e: any) {
      role = `ERREUR_FIRESTORE: ${e?.message || e}`;
    }
  }

  const authInfo = {
    authenticated: !!currentUser,
    uid: currentUser?.uid || null,
    email: currentUser?.email || null,
    role
  };

  const testPath = `system/diagnostic_${Date.now()}.txt`;
  console.log('[DIAGNOSTIC-STORAGE] Démarrage du test contrôlé minimal');
  console.log('[DIAGNOSTIC-STORAGE] Authentifié :', authInfo.authenticated ? 'OUI' : 'NON', 'UID:', authInfo.uid);
  console.log('[DIAGNOSTIC-STORAGE] Rôle :', authInfo.role);
  console.log('[DIAGNOSTIC-STORAGE] Bucket configuré :', configuredBucket);
  console.log('[DIAGNOSTIC-STORAGE] Chemin Storage :', testPath);

  const testBlob = new Blob(['FAFE_DIAGNOSTIC_PING_STORAGE'], { type: 'text/plain' });
  const testRef = ref(storage, testPath);

  try {
    // 1. Upload
    console.log('[DIAGNOSTIC-STORAGE] Étape 1/3 : Upload vers Firebase Storage...');
    await withTimeout(
      uploadBytes(testRef, testBlob, { contentType: 'text/plain' }),
      10000,
      'Upload test minimal'
    );
    console.log('[DIAGNOSTIC-STORAGE] Étape 1/3 : Confirmation upload OK');

    // 2. getDownloadURL
    console.log('[DIAGNOSTIC-STORAGE] Étape 2/3 : Lecture getDownloadURL...');
    const url = await withTimeout(
      getDownloadURL(testRef),
      6000,
      'Récupération downloadURL'
    );
    console.log('[DIAGNOSTIC-STORAGE] Étape 2/3 : getDownloadURL OK ->', url);

    // 3. Suppression
    console.log('[DIAGNOSTIC-STORAGE] Étape 3/3 : Suppression du fichier test...');
    try {
      await deleteObject(testRef);
      console.log('[DIAGNOSTIC-STORAGE] Étape 3/3 : Suppression OK');
    } catch (cleanupErr) {
      console.warn('[DIAGNOSTIC-STORAGE] Nettoyage non bloquant :', cleanupErr);
    }

    return {
      success: true,
      durationMs: Date.now() - startTime,
      bucket: configuredBucket,
      projectId,
      authStatus: authInfo,
      stepReached: 'COMPLET_REUSSI',
      downloadUrl: url
    };
  } catch (err: any) {
    const duration = Date.now() - startTime;
    console.error('[DIAGNOSTIC-STORAGE] ÉCHEC DU TEST MINIMAL :', err);

    let advice = 'Vérifiez la connexion réseau et la configuration du projet.';
    const isRetryLimit = err?.code === 'storage/retry-limit-exceeded' || err?.message?.includes('retry-limit-exceeded');
    const isUnknown = err?.code === 'storage/unknown';

    if (isRetryLimit || isUnknown) {
      advice = `Le bucket "${configuredBucket}" est inaccessible ou inexistant (HTTP 404). Cloud Storage doit être activé dans la console Firebase (menu "Build > Storage > Commencer"). Si le bucket a un nom différent (ex: fafe-platform.appspot.com), mettez à jour la variable VITE_FIREBASE_STORAGE_BUCKET.`;
    } else if (err?.code === 'storage/unauthorized') {
      advice = 'Accès refusé par les règles de sécurité Firebase Storage. Vérifiez que votre compte possède le rôle SUPER_ADMIN.';
    }

    return {
      success: false,
      durationMs: duration,
      bucket: configuredBucket,
      projectId,
      authStatus: authInfo,
      stepReached: 'ECHEC_UPLOAD',
      error: err?.message || String(err),
      errorCode: err?.code || 'UNKNOWN',
      advice
    };
  }
}

/**
 * Uploads an image asset to Firebase Storage in /branding/ with strict timeout & diagnostic logs
 */
export async function uploadBrandingAsset(
  file: File,
  assetType: 'logo' | 'logoAlt' | 'favicon'
): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const timestamp = Date.now();
  const path = `${BRANDING_STORAGE_FOLDER}/${assetType}_${timestamp}_${safeName}`;
  const storageRef = ref(storage, path);
  const configuredBucket = storage.app.options.storageBucket || 'NON_DEFINI';

  // Section 7 : Vérification et traçabilité de l'authentification au moment exact de l'upload
  const currentUser = auth.currentUser;
  const isAuthenticated = !!currentUser;
  const uid = currentUser?.uid || 'NON_CONNECTE';

  let roleInFirestore = 'NON_AUTHENTIFIE';
  if (currentUser) {
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      roleInFirestore = userDoc.exists() ? (userDoc.data()?.role || 'MEMBER') : 'DOCUMENT_NON_TROUVE';
    } catch {
      roleInFirestore = 'ERREUR_LECTURE_FIRESTORE';
    }
  }

  // Logs temporaires stricts (sans token ni donnée sensible)
  console.log(`[CMS-AUTH] Utilisateur authentifié : ${isAuthenticated ? 'OUI' : 'NON'}`);
  console.log(`[CMS-AUTH] UID utilisateur : ${uid}`);
  console.log(`[CMS-AUTH] Rôle Firestore détecté : ${roleInFirestore}`);
  console.log(`[CMS-AUTH] Chemin Storage ciblé : ${path}`);
  console.log(`[CMS-AUTH] Bucket configuré : ${configuredBucket}`);

  const metadata = {
    contentType: file.type || (file.name.endsWith('.svg') ? 'image/svg+xml' : 'image/png'),
    customMetadata: {
      assetType,
      uploadedAt: timestamp.toString()
    }
  };

  console.log(`[CMS] Début upload Storage vers ${path}`);
  try {
    await withTimeout(
      uploadBytes(storageRef, file, metadata),
      12000,
      'Upload Storage'
    );
    console.log('[CMS] Upload Storage terminé avec succès');
  } catch (err: any) {
    console.error(`[CMS] ERREUR — Upload Storage: ${err?.message || err}`);
    let explanation = `Échec de l'upload vers Firebase Storage (${err?.message || 'délai dépassé ou bucket inaccessible'}).`;
    if (err?.code === 'storage/retry-limit-exceeded' || err?.message?.includes('retry-limit-exceeded')) {
      explanation = `Le bucket "${configuredBucket}" est introuvable ou Cloud Storage n'est pas encore activé dans votre projet Firebase "fafe-platform" (HTTP 404). Veuillez activer Cloud Storage dans la console Firebase (Build > Storage > Commencer) ou vérifier le nom exact du bucket.`;
    }
    throw new Error(explanation);
  }

  console.log("[CMS] Récupération de l'URL...");
  try {
    const downloadURL = await withTimeout(
      getDownloadURL(storageRef),
      6000,
      'Récupération URL Storage'
    );
    console.log(`[CMS] URL publique récupérée: ${downloadURL}`);
    return downloadURL;
  } catch (err: any) {
    console.error(`[CMS] ERREUR — Récupération URL: ${err?.message || err}`);
    throw new Error(`Impossible de récupérer l'URL publique Firebase Storage : ${err?.message || 'délai dépassé'}.`);
  }
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
  console.log('[CMS] Début sauvegarde Firestore dans siteSettings/branding');
  const current = await getBrandingSettings();
  const timestamp = Date.now();

  const newSettings: SiteBrandingSettings = {
    ...current,
    ...updates,
    updatedAt: timestamp,
    updatedBy
  };

  // 1. Update Firestore in siteSettings/branding with timeout
  const docRef = doc(db, BRANDING_DOC_PATH, BRANDING_DOC_ID);
  try {
    await withTimeout(
      setDoc(docRef, cleanFirestoreData(newSettings), { merge: true }),
      15000,
      'Enregistrement Firestore (siteSettings/branding)'
    );
    console.log('[CMS] Firestore sauvegardé');
  } catch (err: any) {
    console.error(`[CMS] ERREUR — Sauvegarde Firestore: ${err?.message || err}`);
    throw new Error(`Erreur lors de l'enregistrement dans Firebase Firestore : ${err?.message || 'timeout'}.`);
  }

  // 2. Also mirror to site_settings/branding and cms/global for robust rule and legacy compatibility
  try {
    const docRefAlt = doc(db, 'site_settings', BRANDING_DOC_ID);
    await setDoc(docRefAlt, cleanFirestoreData(newSettings), { merge: true });
  } catch (e) {
    // Non-blocking mirror
  }

  try {
    const globalCmsRef = doc(db, 'cms', 'global');
    await setDoc(globalCmsRef, { 
      logoUrl: newSettings.logoUrl, 
      branding: cleanFirestoreData(newSettings) 
    }, { merge: true });
  } catch (e) {
    // Non-blocking mirror
  }

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
 * Cache-busting helper that adds ?v=timestamp to ensure browsers fetch fresh version
 * when updated, without creating invalid requests on every render.
 */
export function getCacheBustedUrl(url?: string, version?: number): string {
  if (!url) return '';
  if (!version) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${version}`;
}
