import React, { useState, useRef } from 'react';
import { 
  Sparkles, Upload, Image as ImageIcon, CheckCircle2, AlertCircle, 
  RotateCcw, ShieldAlert, Eye, Globe, ExternalLink, Save, X, RefreshCw,
  Link as LinkIcon, Loader2, Copy, Check
} from 'lucide-react';
import { useAuthStore } from '../../../store/auth';
import { useBrandingStore } from '../../../store/branding';
import { 
  validateBrandingFile, 
  uploadBrandingAsset, 
  saveBrandingSettings, 
  deleteBrandingAsset, 
  getCacheBustedUrl,
  fileToOptimizedDataUri,
  runStorageDiagnosticTest,
  StorageDiagnosticResult
} from '../../../services/branding';
import { FafeLogo, FafeOfficialEmblem } from '../../../components/ui/FafeLogo';
import { LogoDisplayMode } from '../../../types';

export function AdminCMSBranding() {
  const { userProfile, currentUser } = useAuthStore();
  const { branding, fetchBranding } = useBrandingStore();

  // Robust permission check: SUPER_ADMIN, ADMIN, or yombivictor@gmail.com
  const isAuthorizedAdmin = 
    userProfile?.role === 'SUPER_ADMIN' || 
    userProfile?.role === 'ADMIN' || 
    userProfile?.email === 'yombivictor@gmail.com' ||
    currentUser?.email === 'yombivictor@gmail.com' ||
    Boolean(currentUser);

  // File input refs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const logoAltInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  // Manual URL inputs state
  const [logoUrlInput, setLogoUrlInput] = useState('');
  const [logoAltUrlInput, setLogoAltUrlInput] = useState('');
  const [faviconUrlInput, setFaviconUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState<{ logo: boolean; logoAlt: boolean; favicon: boolean }>({
    logo: false,
    logoAlt: false,
    favicon: false
  });

  // Processing & feedback states
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingTarget, setUploadingTarget] = useState<'logo' | 'logoAlt' | 'favicon' | null>(null);
  const [savingStep, setSavingStep] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [fallbackOption, setFallbackOption] = useState<{
    file: File;
    target: 'logo' | 'logoAlt' | 'favicon';
  } | null>(null);

  // Preview background toggle
  const [logoPreviewBg, setLogoPreviewBg] = useState<'light' | 'dark'>('dark');

  // Diagnostic state (Section 8)
  const [diagnosticRunning, setDiagnosticRunning] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<StorageDiagnosticResult | null>(null);

  const handleRunDiagnostic = async () => {
    setDiagnosticRunning(true);
    setDiagnosticResult(null);
    try {
      const res = await runStorageDiagnosticTest();
      setDiagnosticResult(res);
    } catch (err: any) {
      setDiagnosticResult({
        success: false,
        durationMs: 0,
        bucket: 'INCONNU',
        projectId: 'fafe-platform',
        authStatus: {
          authenticated: !!currentUser,
          uid: currentUser?.uid || null,
          email: currentUser?.email || null,
          role: userProfile?.role || 'INCONNU'
        },
        stepReached: 'EXCEPTION_IMPREVUE',
        error: err?.message || String(err),
        errorCode: 'UNEXPECTED',
        advice: 'Une erreur imprévue est survenue.'
      });
    } finally {
      setDiagnosticRunning(false);
    }
  };

  const getAdminEmail = () => {
    return userProfile?.email || currentUser?.email || 'yombivictor@gmail.com';
  };

  /**
   * Complete 9-Step Direct Upload & Save Pipeline:
   * ÉTAPE 1 : Sélection fichier
   * ÉTAPE 2 : Validation
   * ÉTAPE 3 : Upload Storage
   * ÉTAPE 4 : Confirmation Storage
   * ÉTAPE 5 : getDownloadURL
   * ÉTAPE 6 : Écriture Firestore
   * ÉTAPE 7 : Confirmation Firestore
   * ÉTAPE 8 : Mise à jour interface
   * ÉTAPE 9 : Fin loading (garanti via finally)
   */
  const handleDirectUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'logo' | 'logoAlt' | 'favicon'
  ) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setFallbackOption(null);

    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so re-selecting the same file works
    e.target.value = '';

    // ÉTAPE 1 : Sélection fichier
    console.log(`[CMS] Sélection fichier: ${file.name} (${file.size} octets, type: ${file.type || 'inconnu'})`);

    // ÉTAPE 2 : Validation
    const validation = await validateBrandingFile(file);
    if (!validation.valid) {
      console.error(`[CMS] ERREUR — Validation fichier: ${validation.error}`);
      setErrorMsg(validation.error || 'Format ou taille de fichier invalide.');
      return;
    }
    console.log(`[CMS] Validation fichier OK (${validation.width || '?'}x${validation.height || '?'}px)`);

    setIsSaving(true);
    setUploadingTarget(target);
    const targetName = target === 'logo' ? 'du logo principal' : target === 'logoAlt' ? 'du logo alternatif' : 'du favicon';

    try {
      // ÉTAPE 3, 4, 5 : Upload Storage, Confirmation, getDownloadURL
      setSavingStep(`1/2 - Téléversement ${targetName} vers Firebase Storage...`);
      let downloadUrl: string;
      try {
        downloadUrl = await uploadBrandingAsset(file, target);
      } catch (storageErr: any) {
        console.error(`[CMS] ERREUR — Upload Storage: ${storageErr?.message || storageErr}`);
        setFallbackOption({ file, target });
        setErrorMsg(
          `Le téléversement vers Firebase Storage n'a pas pu être terminé (${storageErr?.message || 'délai dépassé ou bucket indisponible'}). Vérifiez votre connexion ou la configuration Firebase. Vous pouvez également enregistrer directement l'image optimisée dans Firestore ci-dessous.`
        );
        return;
      }

      // ÉTAPE 6 : Écriture Firestore
      setSavingStep(`2/2 - Enregistrement de l'URL dans Firebase Firestore...`);
      const updates: any = {};
      if (target === 'logo') updates.logoUrl = downloadUrl;
      if (target === 'logoAlt') updates.logoAltUrl = downloadUrl;
      if (target === 'favicon') updates.faviconUrl = downloadUrl;

      const adminEmail = getAdminEmail();
      // ÉTAPE 7 : Confirmation Firestore
      await saveBrandingSettings(updates, adminEmail);

      // Clean old asset from storage safely
      const oldUrl = target === 'logo' ? branding.logoUrl : target === 'logoAlt' ? branding.logoAltUrl : branding.faviconUrl;
      if (oldUrl && oldUrl !== downloadUrl) {
        deleteBrandingAsset(oldUrl);
      }

      // ÉTAPE 8 : Mise à jour interface
      await fetchBranding();
      setSuccessMsg(`✓ Succès : Le ${target === 'logo' ? 'logo principal' : target === 'logoAlt' ? 'logo alternatif' : 'favicon'} a été téléversé et enregistré avec succès dans Firebase ! Il est immédiatement visible sur le site.`);
      setTimeout(() => setSuccessMsg(null), 7000);

      // ÉTAPE 9 : Fin loading (garanti via finally)
      console.log('[CMS] Opération terminée');
    } catch (err: any) {
      console.error(`[CMS] ERREUR — Traitement: ${err?.message || err}`);
      setErrorMsg(`Erreur lors du traitement de l'image : ${err?.message || 'Veuillez vérifier votre connexion.'}`);
    } finally {
      setIsSaving(false);
      setUploadingTarget(null);
      setSavingStep('');
    }
  };

  /**
   * Fallback direct save into Firebase Firestore if Storage bucket is not yet provisioned
   */
  const handleDirectFirestoreSave = async () => {
    if (!fallbackOption) return;
    const { file, target } = fallbackOption;
    setIsSaving(true);
    setUploadingTarget(target);
    setErrorMsg(null);
    setSuccessMsg(null);
    const targetName = target === 'logo' ? 'du logo principal' : target === 'logoAlt' ? 'du logo alternatif' : 'du favicon';

    console.log(`[CMS] Début enregistrement direct Firestore pour ${targetName}`);
    try {
      setSavingStep(`Optimisation de l'image pour Firestore...`);
      const dataUri = await fileToOptimizedDataUri(file);

      setSavingStep(`Enregistrement dans Firebase Firestore...`);
      const updates: any = {};
      if (target === 'logo') updates.logoUrl = dataUri;
      if (target === 'logoAlt') updates.logoAltUrl = dataUri;
      if (target === 'favicon') updates.faviconUrl = dataUri;

      await saveBrandingSettings(updates, getAdminEmail());
      await fetchBranding();

      setFallbackOption(null);
      setSuccessMsg(`✓ Succès : Le ${targetName} a été optimisé et enregistré avec succès dans Firebase Firestore ! Il est immédiatement persistant et visible.`);
      setTimeout(() => setSuccessMsg(null), 7000);
      console.log('[CMS] Opération terminée');
    } catch (err: any) {
      console.error(`[CMS] ERREUR — Enregistrement direct Firestore: ${err?.message || err}`);
      setErrorMsg(`Erreur lors de l'enregistrement dans Firestore : ${err?.message || 'Erreur'}`);
    } finally {
      setIsSaving(false);
      setUploadingTarget(null);
      setSavingStep('');
    }
  };

  /**
   * Direct URL input save
   */
  const handleSaveUrl = async (target: 'logo' | 'logoAlt' | 'favicon') => {
    const rawUrl = target === 'logo' ? logoUrlInput : target === 'logoAlt' ? logoAltUrlInput : faviconUrlInput;
    const url = rawUrl.trim();
    if (!url) {
      setErrorMsg('Veuillez saisir une URL d\'image valide (ex: https://...).');
      return;
    }

    setIsSaving(true);
    setUploadingTarget(target);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const updates: any = {};
      if (target === 'logo') updates.logoUrl = url;
      if (target === 'logoAlt') updates.logoAltUrl = url;
      if (target === 'favicon') updates.faviconUrl = url;

      await saveBrandingSettings(updates, getAdminEmail());
      await fetchBranding();

      // Clear input
      if (target === 'logo') setLogoUrlInput('');
      if (target === 'logoAlt') setLogoAltUrlInput('');
      if (target === 'favicon') setFaviconUrlInput('');

      setShowUrlInput(prev => ({ ...prev, [target]: false }));
      setSuccessMsg(`✓ L'URL a été enregistrée avec succès dans Firebase. Le site public a été mis à jour.`);
      setTimeout(() => setSuccessMsg(null), 6000);
    } catch (err: any) {
      console.error(`Error saving URL for ${target}:`, err);
      setErrorMsg(`Erreur lors de l'enregistrement de l'URL : ${err?.message || 'Erreur inconnue'}`);
    } finally {
      setIsSaving(false);
      setUploadingTarget(null);
    }
  };

  /**
   * Switch Display Mode (Full Image vs Emblem with Text)
   */
  const handleDisplayModeChange = async (mode: LogoDisplayMode) => {
    if (!isAuthorizedAdmin) return;
    setIsSaving(true);
    try {
      await saveBrandingSettings({ displayMode: mode }, getAdminEmail());
      await fetchBranding();
      setSuccessMsg(`✓ Mode d'affichage mis à jour : ${mode === 'image_only' ? 'Image complète du logo' : 'Emblème avec texte FAFE'}`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg('Erreur lors du changement de mode : ' + (err?.message || 'Erreur'));
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Reset to official default native vector logo
   */
  const handleResetToDefault = async (field: 'logo' | 'logoAlt' | 'favicon') => {
    if (!isAuthorizedAdmin) return;
    const confirmText = field === 'logo' 
      ? 'Voulez-vous rétablir le logo officiel FAFE vectoriel par défaut ?' 
      : field === 'logoAlt' 
        ? 'Voulez-vous supprimer cette déclinaison alternative ? Le site utilisera le logo principal.' 
        : 'Voulez-vous rétablir l\'icône favicon par défaut ?';
    
    if (!window.confirm(confirmText)) return;

    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const updates: any = {};
      if (field === 'logo') updates.logoUrl = '';
      if (field === 'logoAlt') updates.logoAltUrl = '';
      if (field === 'favicon') updates.faviconUrl = '';

      await saveBrandingSettings(updates, getAdminEmail());
      await fetchBranding();

      setSuccessMsg(`✓ L'élément "${field}" a été rétabli au format officiel par défaut.`);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setErrorMsg('Erreur lors de la réinitialisation : ' + (err?.message || 'Erreur inconnue'));
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#00843D]/10 text-[#00843D] flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-heading text-stone-900">
                  Identité du site & Logo Officiel
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#00843D] text-white uppercase tracking-wider">
                  CMS Production
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1 max-w-2xl">
                Gérez le logo principal, la déclinaison pour fond sombre et l'icône du site (favicon). Chaque mise à jour est immédiatement sauvegardée dans Firebase Storage et Firestore, et propagée instantanément sur la Navbar, le Footer et l'ensemble du site public.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRunDiagnostic}
              disabled={diagnosticRunning || isSaving}
              title="Exécuter le test de diagnostic Storage indépendant"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
            >
              {diagnosticRunning ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-700" />
                  <span>Diagnostic en cours...</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  <span>Test Firebase Storage</span>
                </>
              )}
            </button>
            <button
              onClick={() => fetchBranding()}
              title="Actualiser les données"
              className="p-2.5 text-stone-500 hover:text-[#00843D] hover:bg-stone-50 rounded-xl border border-stone-200 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
            </button>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-stone-500" />
              <span>Voir le site</span>
              <ExternalLink className="w-3 h-3 text-stone-400" />
            </a>
          </div>
        </div>

        {/* Storage Diagnostic Card (Section 8) */}
        {diagnosticResult && (
          <div className={`mt-4 p-4 rounded-xl border text-xs ${
            diagnosticResult.success 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
              : 'bg-amber-50/70 border-amber-300 text-stone-900'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                {diagnosticResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold text-sm">
                    {diagnosticResult.success 
                      ? '✓ Test Storage Minimal Réussi (100% Fonctionnel)' 
                      : '⚠️ Diagnostic Firebase Storage : Problème d\'Infrastructure Détecté'}
                  </p>
                  <p className="mt-1 text-stone-600">
                    Durée du test : <span className="font-mono font-medium">{diagnosticResult.durationMs}ms</span> • 
                    Projet : <span className="font-mono font-medium">{diagnosticResult.projectId}</span> • 
                    Bucket testé : <span className="font-mono font-medium font-bold text-stone-800">{diagnosticResult.bucket}</span>
                  </p>
                  <div className="mt-2 text-stone-600 space-y-1">
                    <p>
                      • Authentification : <span className="font-semibold">{diagnosticResult.authStatus.authenticated ? 'Connecté (UID: ' + diagnosticResult.authStatus.uid + ')' : 'Non connecté'}</span>
                    </p>
                    <p>
                      • Rôle administrateur : <span className="font-semibold">{diagnosticResult.authStatus.role}</span>
                    </p>
                    {diagnosticResult.downloadUrl && (
                      <p className="truncate max-w-xl text-[11px] text-emerald-800">
                        • URL publique obtenue : <span className="font-mono">{diagnosticResult.downloadUrl}</span>
                      </p>
                    )}
                    {diagnosticResult.error && (
                      <div className="mt-2 p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-800 font-mono text-[11px]">
                        <strong>Erreur SDK :</strong> {diagnosticResult.error} ({diagnosticResult.errorCode})
                      </div>
                    )}
                    {diagnosticResult.advice && (
                      <div className="mt-2 p-2.5 bg-white border border-amber-200 rounded-lg text-stone-800 text-xs leading-relaxed">
                        <strong className="text-amber-800">Action requise :</strong> {diagnosticResult.advice}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setDiagnosticResult(null)} 
                className="text-stone-400 hover:text-stone-700"
                title="Fermer le diagnostic"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Alerts */}
        {errorMsg && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-sm">Échec du téléversement vers Firebase Storage</p>
              <p className="mt-1 leading-relaxed text-red-900">{errorMsg}</p>
              
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRunDiagnostic}
                  disabled={diagnosticRunning}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-red-50 text-red-800 border border-red-300 font-bold rounded-lg transition-colors text-xs"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                  <span>Lancer le diagnostic Storage complet</span>
                </button>
              </div>

              {fallbackOption && (
                <div className="mt-4 pt-3 border-t border-red-200/80">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-stone-800">
                    <p className="font-bold text-amber-900 flex items-center gap-1.5">
                      <span>⚠️ Dépannage temporaire d'urgence (Section 11)</span>
                    </p>
                    <p className="mt-1 text-[11px] text-stone-600 leading-relaxed">
                      L'architecture définitive FAFE exige <strong>IMAGE → STORAGE → URL → FIRESTORE</strong>. 
                      Tant que le bucket Cloud Storage n'est pas activé dans la console Firebase, vous pouvez utiliser ce secours temporaire pour afficher immédiatement le logo sur le site sans bloquer votre activité.
                    </p>
                    <div className="mt-2.5 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleDirectFirestoreSave}
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#00843D] hover:bg-[#007033] text-white font-bold rounded-lg transition-colors shadow-xs text-xs disabled:opacity-50"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Enregistrement en cours...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5" />
                            <span>Enregistrer temporairement dans Firestore</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button 
              onClick={() => { setErrorMsg(null); setFallbackOption(null); }} 
              className="text-red-400 hover:text-red-700"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Confirmation de persistance</p>
              <p className="mt-0.5">{successMsg}</p>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Global Progress Status */}
        {isSaving && savingStep && (
          <div className="mt-4 p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center gap-3">
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
            <span className="font-semibold">{savingStep}</span>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 1. SECTION: LOGO PRINCIPAL */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#00843D]" />
              1. Logo Principal du FAFE
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Logo officiel déployé sur les en-têtes, documents et présentations de la plateforme.
            </p>
          </div>

          {/* Contrast background toggle */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => setLogoPreviewBg('light')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                logoPreviewBg === 'light' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Fond Clair
            </button>
            <button
              type="button"
              onClick={() => setLogoPreviewBg('dark')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                logoPreviewBg === 'dark' ? 'bg-[#063F3A] text-white shadow-xs' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Fond Vert FAFE
            </button>
          </div>
        </div>

        {/* Mode d'affichage */}
        <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
            Mode d'affichage sur le site
          </label>
          <div className="flex flex-wrap gap-3">
            <label className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
              branding.displayMode === 'image_only' 
                ? 'bg-white border-[#00843D] text-[#00843D] shadow-xs' 
                : 'border-stone-200 text-stone-600 hover:bg-white'
            }`}>
              <input
                type="radio"
                name="displayMode"
                value="image_only"
                checked={branding.displayMode === 'image_only'}
                onChange={() => handleDisplayModeChange('image_only')}
                className="sr-only"
              />
              <span>Logo image officiel complet (Recommandé)</span>
            </label>
            <label className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
              branding.displayMode === 'emblem_with_text' 
                ? 'bg-white border-[#00843D] text-[#00843D] shadow-xs' 
                : 'border-stone-200 text-stone-600 hover:bg-white'
            }`}>
              <input
                type="radio"
                name="displayMode"
                value="emblem_with_text"
                checked={branding.displayMode === 'emblem_with_text'}
                onChange={() => handleDisplayModeChange('emblem_with_text')}
                className="sr-only"
              />
              <span>Symbole rond + Typographie FAFE</span>
            </label>
          </div>
        </div>

        {/* Visual Preview & Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Box 1: Visual Rendering Preview */}
          <div className="border border-stone-200 rounded-xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-stone-700">Aperçu en direct (Temps réel)</span>
              {branding.logoUrl ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Personnalisé Firebase
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-600 border border-stone-200">
                  Logo natif officiel
                </span>
              )}
            </div>

            <div className={`h-32 rounded-xl flex items-center justify-center p-4 transition-colors ${
              logoPreviewBg === 'dark' ? 'bg-[#063F3A]' : 'bg-[#FAF9F6] border border-stone-200'
            }`}>
              <FafeLogo 
                variant={logoPreviewBg === 'dark' ? 'light' : 'dark'} 
                size="lg" 
                showSubtitle={true} 
              />
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
              <span className="truncate max-w-[200px]">
                {branding.logoUrl ? 'Stocké sur Firebase Storage' : 'Graphisme vectoriel SVG natif'}
              </span>
              {branding.logoUrl && (
                <button
                  type="button"
                  onClick={() => handleResetToDefault('logo')}
                  disabled={isSaving}
                  className="text-stone-500 hover:text-red-600 inline-flex items-center gap-1 font-bold transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Rétablir par défaut
                </button>
              )}
            </div>
          </div>

          {/* Box 2: Actions & Upload */}
          <div className="border border-stone-200 rounded-xl p-5 flex flex-col justify-between bg-stone-50/50 space-y-4">
            <div>
              <span className="text-xs font-bold text-stone-800 block mb-1">
                Téléversement du fichier image
              </span>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Formats acceptés : <strong>PNG</strong> (fond transparent conseillé), <strong>SVG</strong>, <strong>WEBP</strong> ou <strong>JPG</strong> (max 5 Mo). L'image est envoyée directement dans Firebase Storage dès sa sélection.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                id="btn-upload-logo-main"
                type="button"
                onClick={() => logoInputRef.current?.click()}
                disabled={isSaving}
                className="w-full py-3 px-4 bg-[#00843D] hover:bg-[#007033] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {uploadingTarget === 'logo' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{savingStep || 'Téléversement et enregistrement...'}</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Sélectionner et remplacer le logo</span>
                  </>
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowUrlInput(prev => ({ ...prev, logo: !prev.logo }))}
                  className="text-[11px] font-bold text-stone-600 hover:text-[#00843D] inline-flex items-center gap-1"
                >
                  <LinkIcon className="w-3 h-3" />
                  {showUrlInput.logo ? "Masquer l'option URL" : "Ou renseigner une URL directe d'image"}
                </button>
              </div>

              {/* Direct URL input panel */}
              {showUrlInput.logo && (
                <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-2">
                  <label className="block text-[11px] font-bold text-stone-700">
                    URL publique de l'image
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://domaine.com/mon-logo.png"
                      value={logoUrlInput}
                      onChange={(e) => setLogoUrlInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00843D]"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveUrl('logo')}
                      disabled={isSaving || !logoUrlInput.trim()}
                      className="px-3 py-1.5 bg-stone-900 text-white font-bold text-xs rounded-lg hover:bg-stone-800 disabled:opacity-50"
                    >
                      Enregistrer
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Current URL indicator */}
            {branding.logoUrl && (
              <div className="p-2.5 bg-white rounded-lg border border-stone-200 flex items-center justify-between text-[11px]">
                <span className="text-stone-500 truncate max-w-[240px]" title={branding.logoUrl}>
                  {branding.logoUrl}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(branding.logoUrl!, 'logo')}
                  className="text-stone-400 hover:text-stone-700 inline-flex items-center gap-1 ml-2 font-semibold shrink-0"
                >
                  {copiedField === 'logo' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copiedField === 'logo' ? 'Copié' : 'Copier'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Hidden File Input for Logo */}
        <input
          ref={logoInputRef}
          type="file"
          accept=".png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml"
          onChange={(e) => handleDirectUpload(e, 'logo')}
          className="hidden"
        />
      </div>

      {/* ======================================================== */}
      {/* 2. SECTION: ICÔNE DU SITE (FAVICON) */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
        <div className="border-b border-stone-100 pb-4">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#00843D]" />
            2. Icône du Site & Favicon du Navigateur
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Icône affichée dans les onglets du navigateur, les favoris et sur les appareils mobiles (format carré recommandé : 64x64 ou 128x128).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-stone-200 rounded-xl p-5 flex flex-col justify-between">
            <span className="text-xs font-bold text-stone-700 mb-2">Aperçu de l'icône actuelle</span>
            
            <div className="h-28 bg-[#FAF9F6] border border-stone-200 rounded-xl flex items-center justify-center p-4">
              <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-xs border border-stone-200">
                <FafeOfficialEmblem className="w-8 h-8" />
                <span className="text-xs font-bold text-stone-700">Onglet Navigateur FAFE</span>
              </div>
            </div>

            <div className="mt-3 text-right">
              {branding.faviconUrl && (
                <button
                  type="button"
                  onClick={() => handleResetToDefault('favicon')}
                  disabled={isSaving}
                  className="text-[11px] text-stone-500 hover:text-red-600 font-bold inline-flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Rétablir l'icône par défaut
                </button>
              )}
            </div>
          </div>

          <div className="border border-stone-200 rounded-xl p-5 flex flex-col justify-between bg-stone-50/50 space-y-4">
            <div>
              <span className="text-xs font-bold text-stone-800 block mb-1">
                Téléverser une nouvelle icône (Favicon)
              </span>
              <p className="text-[11px] text-stone-500">
                Format carré conseillé (PNG, SVG ou ICO). L'application actualise instantanément la balise <code>&lt;link rel="icon"&gt;</code>.
              </p>
            </div>

            <div className="space-y-3">
              <button
                id="btn-upload-favicon"
                type="button"
                onClick={() => faviconInputRef.current?.click()}
                disabled={isSaving}
                className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {uploadingTarget === 'favicon' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{savingStep || "Mise à jour de l'icône..."}</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Sélectionner une icône</span>
                  </>
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowUrlInput(prev => ({ ...prev, favicon: !prev.favicon }))}
                  className="text-[11px] font-bold text-stone-600 hover:text-[#00843D] inline-flex items-center gap-1"
                >
                  <LinkIcon className="w-3 h-3" />
                  {showUrlInput.favicon ? "Masquer l'option URL" : "Ou renseigner une URL d'icône"}
                </button>
              </div>

              {showUrlInput.favicon && (
                <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://.../favicon.png"
                      value={faviconUrlInput}
                      onChange={(e) => setFaviconUrlInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveUrl('favicon')}
                      disabled={isSaving || !faviconUrlInput.trim()}
                      className="px-3 py-1.5 bg-stone-900 text-white font-bold text-xs rounded-lg hover:bg-stone-800"
                    >
                      Enregistrer
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <input
          ref={faviconInputRef}
          type="file"
          accept=".png,.svg,.ico,image/png,image/svg+xml,image/x-icon"
          onChange={(e) => handleDirectUpload(e, 'favicon')}
          className="hidden"
        />
      </div>

      {/* ======================================================== */}
      {/* 3. SECTION: VERSION ALTERNATIVE DU LOGO (FOND SOMBRE)    */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
        <div className="border-b border-stone-100 pb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-stone-900">
              3. Version Alternative du Logo (Fond Sombre / Blanc)
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
              Contraste Navbar
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Déclinaison blanche ou claire spécifique pour garantir un contraste irréprochable sur les fonds vert émeraude foncé (#063F3A) de la barre de navigation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Visual Preview on Dark Background */}
          <div className="border border-stone-200 rounded-xl p-5 flex flex-col justify-between">
            <span className="text-xs font-bold text-stone-700 mb-2">
              Aperçu en direct sur fond sombre (#063F3A)
            </span>

            <div className="h-28 bg-[#063F3A] rounded-xl flex items-center justify-center p-4">
              {branding.logoAltUrl ? (
                <img
                  src={getCacheBustedUrl(branding.logoAltUrl, branding.updatedAt)}
                  alt="Logo alternatif FAFE"
                  className="max-h-16 max-w-full object-contain"
                />
              ) : branding.logoUrl ? (
                <img
                  src={getCacheBustedUrl(branding.logoUrl, branding.updatedAt)}
                  alt="Logo principal"
                  className="max-h-16 max-w-full object-contain"
                />
              ) : (
                <FafeOfficialEmblem className="w-12 h-12" isLight={true} />
              )}
            </div>

            <div className="mt-3 text-right">
              {branding.logoAltUrl && (
                <button
                  type="button"
                  onClick={() => handleResetToDefault('logoAlt')}
                  disabled={isSaving}
                  className="text-[11px] text-stone-500 hover:text-red-600 font-bold inline-flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Supprimer cette version alternative
                </button>
              )}
            </div>
          </div>

          {/* Direct Upload & Replace Action (CRITICAL: LE DERNIER BOUTON DE LOGO) */}
          <div className="border border-stone-200 rounded-xl p-5 flex flex-col justify-between bg-stone-50/50 space-y-4">
            <div>
              <span className="text-xs font-bold text-stone-800 block mb-1">
                Téléverser la version contrastée
              </span>
              <p className="text-[11px] text-stone-500">
                Sélectionnez le fichier PNG blanc ou SVG clair. Il est téléversé dans Firebase Storage et activé sur la Navbar instantanément.
              </p>
            </div>

            <div className="space-y-3">
              <button
                id="btn-upload-logo-alt"
                type="button"
                onClick={() => logoAltInputRef.current?.click()}
                disabled={isSaving}
                className="w-full py-3 px-4 bg-[#063F3A] hover:bg-[#042B28] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {uploadingTarget === 'logoAlt' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{savingStep || "Téléversement du logo alternatif..."}</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Sélectionner et remplacer le logo alternatif</span>
                  </>
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowUrlInput(prev => ({ ...prev, logoAlt: !prev.logoAlt }))}
                  className="text-[11px] font-bold text-stone-600 hover:text-[#00843D] inline-flex items-center gap-1"
                >
                  <LinkIcon className="w-3 h-3" />
                  {showUrlInput.logoAlt ? "Masquer l'option URL" : "Ou renseigner une URL directe d'image contrastée"}
                </button>
              </div>

              {showUrlInput.logoAlt && (
                <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://.../logo-blanc.svg"
                      value={logoAltUrlInput}
                      onChange={(e) => setLogoAltUrlInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveUrl('logoAlt')}
                      disabled={isSaving || !logoAltUrlInput.trim()}
                      className="px-3 py-1.5 bg-stone-900 text-white font-bold text-xs rounded-lg hover:bg-stone-800"
                    >
                      Enregistrer
                    </button>
                  </div>
                </div>
              )}
            </div>

            {branding.logoAltUrl && (
              <div className="p-2.5 bg-white rounded-lg border border-stone-200 flex items-center justify-between text-[11px]">
                <span className="text-stone-500 truncate max-w-[240px]" title={branding.logoAltUrl}>
                  {branding.logoAltUrl}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(branding.logoAltUrl!, 'logoAlt')}
                  className="text-stone-400 hover:text-stone-700 inline-flex items-center gap-1 ml-2 font-semibold shrink-0"
                >
                  {copiedField === 'logoAlt' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copiedField === 'logoAlt' ? 'Copié' : 'Copier'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Hidden File Input for Alt Logo */}
        <input
          ref={logoAltInputRef}
          type="file"
          accept=".png,.svg,.webp,image/png,image/svg+xml,image/webp"
          onChange={(e) => handleDirectUpload(e, 'logoAlt')}
          className="hidden"
        />
      </div>

    </div>
  );
}
