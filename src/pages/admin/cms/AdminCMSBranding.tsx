import React, { useState, useRef } from 'react';
import { 
  Sparkles, Upload, Image as ImageIcon, CheckCircle2, AlertCircle, 
  RotateCcw, ShieldAlert, Eye, Globe, ExternalLink, Save, X, RefreshCw
} from 'lucide-react';
import { useAuthStore } from '../../../store/auth';
import { useBrandingStore } from '../../../store/branding';
import { 
  validateBrandingFile, 
  uploadBrandingAsset, 
  saveBrandingSettings,
  deleteBrandingAsset,
  getCacheBustedUrl
} from '../../../services/branding';
import { FafeLogo, FafeOfficialEmblem } from '../../../components/ui/FafeLogo';
import { LogoDisplayMode } from '../../../types';

interface StagedItem {
  file: File;
  previewUrl: string;
  width?: number;
  height?: number;
}

export function AdminCMSBranding() {
  const { userProfile } = useAuthStore();
  const { branding, fetchBranding } = useBrandingStore();

  const isSuperAdmin = 
    userProfile?.role === 'SUPER_ADMIN' || 
    userProfile?.email === 'yombivictor@gmail.com';

  // Staged files for replacement
  const [stagedLogo, setStagedLogo] = useState<StagedItem | null>(null);
  const [stagedLogoAlt, setStagedLogoAlt] = useState<StagedItem | null>(null);
  const [stagedFavicon, setStagedFavicon] = useState<StagedItem | null>(null);

  // Selected display mode
  const [displayMode, setDisplayMode] = useState<LogoDisplayMode>(branding.displayMode || 'image_only');

  // Input file refs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const logoAltInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  // Processing & feedback states
  const [isSaving, setIsSaving] = useState(false);
  const [savingStep, setSavingStep] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Preview background toggle
  const [logoPreviewBg, setLogoPreviewBg] = useState<'light' | 'dark'>('dark');

  // Handle file selection and strict client-side validation
  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'logo' | 'logoAlt' | 'favicon'
  ) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = await validateBrandingFile(file);
    if (!validation.valid) {
      setErrorMsg(validation.error || 'Fichier invalide.');
      e.target.value = '';
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const staged: StagedItem = {
      file,
      previewUrl,
      width: validation.width,
      height: validation.height
    };

    if (type === 'logo') setStagedLogo(staged);
    if (type === 'logoAlt') setStagedLogoAlt(staged);
    if (type === 'favicon') setStagedFavicon(staged);
  };

  const cancelStaged = (type: 'logo' | 'logoAlt' | 'favicon') => {
    if (type === 'logo' && stagedLogo) {
      URL.revokeObjectURL(stagedLogo.previewUrl);
      setStagedLogo(null);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
    if (type === 'logoAlt' && stagedLogoAlt) {
      URL.revokeObjectURL(stagedLogoAlt.previewUrl);
      setStagedLogoAlt(null);
      if (logoAltInputRef.current) logoAltInputRef.current.value = '';
    }
    if (type === 'favicon' && stagedFavicon) {
      URL.revokeObjectURL(stagedFavicon.previewUrl);
      setStagedFavicon(null);
      if (faviconInputRef.current) faviconInputRef.current.value = '';
    }
  };

  // Save all modified elements to Firebase Storage & Firestore
  const handleSaveAll = async () => {
    if (!isSuperAdmin) {
      setErrorMsg('Permission refusée : Seul le SUPER_ADMIN peut modifier l\'identité du site.');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const updates: any = {
        displayMode
      };

      // 1. Upload new Logo if staged
      if (stagedLogo) {
        setSavingStep('Téléversement du logo principal vers Firebase Storage...');
        const downloadUrl = await uploadBrandingAsset(stagedLogo.file, 'logo');
        updates.logoUrl = downloadUrl;
        
        // Clean old asset if safe
        if (branding.logoUrl && branding.logoUrl !== downloadUrl) {
          deleteBrandingAsset(branding.logoUrl);
        }
      }

      // 2. Upload new Alt Logo if staged
      if (stagedLogoAlt) {
        setSavingStep('Téléversement du logo alternatif vers Firebase Storage...');
        const downloadUrl = await uploadBrandingAsset(stagedLogoAlt.file, 'logoAlt');
        updates.logoAltUrl = downloadUrl;

        if (branding.logoAltUrl && branding.logoAltUrl !== downloadUrl) {
          deleteBrandingAsset(branding.logoAltUrl);
        }
      }

      // 3. Upload new Favicon if staged
      if (stagedFavicon) {
        setSavingStep('Téléversement de l\'icône vers Firebase Storage...');
        const downloadUrl = await uploadBrandingAsset(stagedFavicon.file, 'favicon');
        updates.faviconUrl = downloadUrl;

        if (branding.faviconUrl && branding.faviconUrl !== downloadUrl) {
          deleteBrandingAsset(branding.faviconUrl);
        }
      }

      // 4. Save to Firestore (siteSettings/branding)
      setSavingStep('Enregistrement de la configuration dans Firestore...');
      const saved = await saveBrandingSettings(
        updates,
        userProfile?.email || userProfile?.id || 'SUPER_ADMIN'
      );

      // Clean up staged local object URLs
      if (stagedLogo) cancelStaged('logo');
      if (stagedLogoAlt) cancelStaged('logoAlt');
      if (stagedFavicon) cancelStaged('favicon');

      setSuccessMsg('L\'identité du site a été mise à jour avec succès dans Firebase. Le logo et le favicon sont immédiatement synchronisés sur l\'ensemble du site public.');
      setTimeout(() => setSuccessMsg(null), 6000);

      // Force refresh store
      await fetchBranding();
    } catch (err: any) {
      console.error('Error saving branding:', err);
      setErrorMsg(err?.message || 'Une erreur est survenue lors de l\'enregistrement dans Firebase.');
    } finally {
      setIsSaving(false);
      setSavingStep('');
    }
  };

  // Reset to original default emblem/logo
  const handleResetToDefault = async (field: 'logo' | 'logoAlt' | 'favicon') => {
    if (!isSuperAdmin) return;
    if (!window.confirm('Voulez-vous rétablir l\'élément par défaut officiel FAFE ?')) return;

    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const updates: any = {};
      if (field === 'logo') updates.logoUrl = '';
      if (field === 'logoAlt') updates.logoAltUrl = '';
      if (field === 'favicon') updates.faviconUrl = '';

      await saveBrandingSettings(updates, userProfile?.email || 'SUPER_ADMIN');
      await fetchBranding();

      setSuccessMsg(`L'élément "${field}" a été rétabli au format par défaut officiel.`);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setErrorMsg('Erreur lors de la réinitialisation : ' + (err?.message || 'Erreur inconnue'));
    } finally {
      setIsSaving(false);
    }
  };

  const hasPendingChanges = Boolean(
    stagedLogo || 
    stagedLogoAlt || 
    stagedFavicon || 
    displayMode !== (branding.displayMode || 'image_only')
  );

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
                  Identité du site & Éléments de Marque
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#00843D] text-white uppercase tracking-wider">
                  CMS
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1 max-w-2xl">
                Configurez le logo officiel et l'icône (favicon) affichés sur la plateforme FAFE. Les fichiers sont stockés de manière permanente sur Firebase Storage et appliqués en temps réel sur la Navbar, le Footer et les onglets du navigateur.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => fetchBranding()}
              title="Rafraîchir les données Firebase"
              className="p-2.5 text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-xl border border-stone-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
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

        {/* Super Admin Notice */}
        {!isSuperAdmin && (
          <div className="mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Accès restreint :</strong> Vous visualisez les éléments d'identité en lecture seule. Seul le <strong>SUPER_ADMIN</strong> a l'autorisation de modifier ou remplacer le logo et le favicon du site.
            </span>
          </div>
        )}

        {/* Global Save Action Bar if pending changes */}
        {hasPendingChanges && (
          <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Des modifications sont en attente d'enregistrement sur Firebase.</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  cancelStaged('logo');
                  cancelStaged('logoAlt');
                  cancelStaged('favicon');
                  setDisplayMode(branding.displayMode || 'image_only');
                }}
                disabled={isSaving}
                className="px-3 py-1.5 text-xs font-bold text-stone-600 hover:bg-white rounded-lg transition-colors"
              >
                Annuler tout
              </button>
              <button
                type="button"
                onClick={handleSaveAll}
                disabled={isSaving || !isSuperAdmin}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#00843D] hover:bg-[#007033] text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{savingStep || 'Sauvegarde en cours...'}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Enregistrer les modifications</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Error / Success Notifications */}
        {errorMsg && (
          <div className="mt-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="text-red-500 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 1. SECTION: LOGO PRINCIPAL */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#00843D]" />
              Logo Principal
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Logo officiel utilisé sur la Navbar, le Footer, la Marketplace et les supports institutionnels.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-stone-400 font-medium">Aperçu :</span>
            <div className="inline-flex bg-stone-100 p-0.5 rounded-lg text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setLogoPreviewBg('dark')}
                className={`px-2 py-1 rounded-md transition-colors ${
                  logoPreviewBg === 'dark' ? 'bg-[#063F3A] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Navbar (#063F3A)
              </button>
              <button
                type="button"
                onClick={() => setLogoPreviewBg('light')}
                className={`px-2 py-1 rounded-md transition-colors ${
                  logoPreviewBg === 'light' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Fond clair
              </button>
            </div>
          </div>
        </div>

        {/* Display Mode Selection */}
        <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-stone-800">Mode d'intégration du logo :</span>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Choisissez si l'image téléchargée remplace l'ensemble du logo ou seulement le macaron circulaire.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-colors ${
              displayMode === 'image_only' 
                ? 'bg-white border-[#00843D] text-[#00843D] shadow-xs' 
                : 'border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}>
              <input
                type="radio"
                name="displayMode"
                value="image_only"
                checked={displayMode === 'image_only'}
                onChange={() => setDisplayMode('image_only')}
                className="sr-only"
                disabled={!isSuperAdmin}
              />
              <span>Image complète du logo</span>
            </label>
            <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-colors ${
              displayMode === 'emblem_with_text' 
                ? 'bg-white border-[#00843D] text-[#00843D] shadow-xs' 
                : 'border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}>
              <input
                type="radio"
                name="displayMode"
                value="emblem_with_text"
                checked={displayMode === 'emblem_with_text'}
                onChange={() => setDisplayMode('emblem_with_text')}
                className="sr-only"
                disabled={!isSuperAdmin}
              />
              <span>Symbole avec texte FAFE</span>
            </label>
          </div>
        </div>

        {/* Live Preview Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Current Live Version */}
          <div className="border border-stone-200 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-stone-600">Aperçu actuel en production</span>
              {branding.logoUrl ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Personnalisé
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-600">
                  Logo par défaut
                </span>
              )}
            </div>

            <div className={`h-24 rounded-lg flex items-center justify-center p-4 transition-colors ${
              logoPreviewBg === 'dark' ? 'bg-[#063F3A]' : 'bg-[#FAF9F6] border border-stone-200'
            }`}>
              <FafeLogo 
                variant={logoPreviewBg === 'dark' ? 'light' : 'dark'} 
                size="md" 
                showSubtitle={true} 
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-stone-400">
              <span className="truncate max-w-[200px]">
                {branding.logoUrl ? 'Hébergé sur Firebase Storage' : 'Vecteur SVG officiel natif'}
              </span>
              {branding.logoUrl && isSuperAdmin && (
                <button
                  type="button"
                  onClick={() => handleResetToDefault('logo')}
                  disabled={isSaving}
                  className="text-stone-500 hover:text-red-600 inline-flex items-center gap-1 font-semibold"
                >
                  <RotateCcw className="w-3 h-3" />
                  Rétablir par défaut
                </button>
              )}
            </div>
          </div>

          {/* Staged New Selection Preview */}
          <div className="border border-dashed border-stone-300 rounded-xl p-4 flex flex-col justify-between bg-stone-50/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-stone-700">
                {stagedLogo ? 'Aperçu avant validation' : 'Remplacer le logo'}
              </span>
              {stagedLogo && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                  En attente
                </span>
              )}
            </div>

            {stagedLogo ? (
              <div className={`h-24 rounded-lg flex items-center justify-center p-4 transition-colors ${
                logoPreviewBg === 'dark' ? 'bg-[#063F3A]' : 'bg-[#FAF9F6] border border-stone-200'
              }`}>
                {displayMode === 'image_only' ? (
                  <img
                    src={stagedLogo.previewUrl}
                    alt="Aperçu nouveau logo"
                    className="max-h-14 max-w-full object-contain"
                  />
                ) : (
                  <div className="inline-flex items-center gap-3">
                    <img
                      src={stagedLogo.previewUrl}
                      alt="Aperçu nouveau symbole"
                      className="w-12 h-12 rounded-full object-contain"
                    />
                    <div className="flex flex-col">
                      <span className={`font-heading font-extrabold text-2xl ${
                        logoPreviewBg === 'dark' ? 'text-white' : 'text-[#063F3A]'
                      }`}>
                        FAFE
                      </span>
                      <span className={`text-[8px] font-bold uppercase tracking-wider ${
                        logoPreviewBg === 'dark' ? 'text-[#D4AF37]' : 'text-[#063F3A]/70'
                      }`}>
                        Forum Africain des Femmes Entrepreneures
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div 
                onClick={() => isSuperAdmin && logoInputRef.current?.click()}
                className={`h-24 rounded-lg border-2 border-dashed border-stone-200 flex flex-col items-center justify-center gap-1.5 p-4 text-center cursor-pointer hover:bg-white hover:border-[#00843D]/50 transition-colors ${
                  !isSuperAdmin ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                <Upload className="w-5 h-5 text-stone-400" />
                <span className="text-xs font-bold text-stone-700">
                  Cliquez pour sélectionner un nouveau fichier
                </span>
                <span className="text-[10px] text-stone-400">
                  PNG, SVG, WEBP ou JPG (max. 4 Mo)
                </span>
              </div>
            )}

            <div className="mt-3 flex items-center justify-between">
              {stagedLogo ? (
                <>
                  <span className="text-[11px] text-stone-500 truncate max-w-[180px]">
                    {stagedLogo.file.name} ({(stagedLogo.file.size / 1024).toFixed(0)} Ko)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => cancelStaged('logo')}
                      disabled={isSaving}
                      className="px-2.5 py-1 text-[11px] font-bold text-stone-600 hover:bg-stone-200 rounded-lg"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveAll}
                      disabled={isSaving || !isSuperAdmin}
                      className="px-3 py-1 text-[11px] font-bold bg-[#00843D] text-white hover:bg-[#007033] rounded-lg shadow-xs"
                    >
                      {isSaving ? 'Envoi...' : 'Enregistrer'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full flex justify-end">
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={!isSuperAdmin}
                    className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
                  >
                    Modifier le logo
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hidden File Input for Logo */}
        <input
          ref={logoInputRef}
          type="file"
          accept=".png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml"
          onChange={(e) => handleFileSelect(e, 'logo')}
          className="hidden"
        />
      </div>

      {/* 2. SECTION: ICÔNE DU SITE (FAVICON) */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-5">
        <div className="border-b border-stone-100 pb-4">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#00843D]" />
            Icône du Site & Favicon
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Icône affichée dans les onglets du navigateur web, les favoris et sur mobile (format carré recommandé : 64x64 ou 128x128).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Current Live Favicon */}
          <div className="border border-stone-200 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-stone-600">Icône actuelle du navigateur</span>
              {branding.faviconUrl ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Personnalisée
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-600">
                  Icône par défaut
                </span>
              )}
            </div>

            {/* Simulated Browser Tab preview */}
            <div className="bg-stone-100 border border-stone-200 rounded-lg p-3">
              <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                Aperçu dans un onglet :
              </span>
              <div className="bg-white border border-stone-200 rounded-t-md px-3 py-2 flex items-center gap-2 max-w-[240px] shadow-xs">
                {branding.faviconUrl ? (
                  <img
                    src={getCacheBustedUrl(branding.faviconUrl, branding.updatedAt)}
                    alt="Favicon FAFE"
                    className="w-4 h-4 object-contain rounded-xs shrink-0"
                  />
                ) : (
                  <FafeOfficialEmblem className="w-4 h-4 shrink-0" />
                )}
                <span className="text-xs font-bold text-stone-800 truncate">
                  FAFE — Forum Africain...
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-stone-400">
              <span>{branding.faviconUrl ? 'Hébergé sur Firebase Storage' : 'Icône native vectorielle'}</span>
              {branding.faviconUrl && isSuperAdmin && (
                <button
                  type="button"
                  onClick={() => handleResetToDefault('favicon')}
                  disabled={isSaving}
                  className="text-stone-500 hover:text-red-600 inline-flex items-center gap-1 font-semibold"
                >
                  <RotateCcw className="w-3 h-3" />
                  Rétablir par défaut
                </button>
              )}
            </div>
          </div>

          {/* Staged New Favicon Preview */}
          <div className="border border-dashed border-stone-300 rounded-xl p-4 flex flex-col justify-between bg-stone-50/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-stone-700">
                {stagedFavicon ? 'Aperçu avant validation' : 'Remplacer l\'icône'}
              </span>
              {stagedFavicon && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                  En attente
                </span>
              )}
            </div>

            {stagedFavicon ? (
              <div className="bg-stone-100 border border-stone-200 rounded-lg p-3">
                <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                  Aperçu dans l'onglet :
                </span>
                <div className="bg-white border border-stone-200 rounded-t-md px-3 py-2 flex items-center gap-2 max-w-[240px] shadow-xs">
                  <img
                    src={stagedFavicon.previewUrl}
                    alt="Aperçu nouveau favicon"
                    className="w-4 h-4 object-contain rounded-xs shrink-0"
                  />
                  <span className="text-xs font-bold text-stone-800 truncate">
                    FAFE — Forum Africain...
                  </span>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => isSuperAdmin && faviconInputRef.current?.click()}
                className={`h-20 rounded-lg border-2 border-dashed border-stone-200 flex flex-col items-center justify-center gap-1 p-3 text-center cursor-pointer hover:bg-white hover:border-[#00843D]/50 transition-colors ${
                  !isSuperAdmin ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                <Upload className="w-4 h-4 text-stone-400" />
                <span className="text-xs font-bold text-stone-700">
                  Sélectionner une icône carrée (PNG ou SVG)
                </span>
                <span className="text-[10px] text-stone-400">
                  Résolution optimale : 64x64 ou 128x128
                </span>
              </div>
            )}

            <div className="mt-3 flex items-center justify-between">
              {stagedFavicon ? (
                <>
                  <span className="text-[11px] text-stone-500 truncate max-w-[180px]">
                    {stagedFavicon.file.name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => cancelStaged('favicon')}
                      disabled={isSaving}
                      className="px-2.5 py-1 text-[11px] font-bold text-stone-600 hover:bg-stone-200 rounded-lg"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveAll}
                      disabled={isSaving || !isSuperAdmin}
                      className="px-3 py-1 text-[11px] font-bold bg-[#00843D] text-white hover:bg-[#007033] rounded-lg shadow-xs"
                    >
                      {isSaving ? 'Envoi...' : 'Enregistrer'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full flex justify-end">
                  <button
                    type="button"
                    onClick={() => faviconInputRef.current?.click()}
                    disabled={!isSuperAdmin}
                    className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
                  >
                    Modifier l'icône
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hidden File Input for Favicon */}
        <input
          ref={faviconInputRef}
          type="file"
          accept=".png,.svg,.ico,image/png,image/svg+xml,image/x-icon"
          onChange={(e) => handleFileSelect(e, 'favicon')}
          className="hidden"
        />
      </div>

      {/* 3. SECTION: VERSION ALTERNATIVE DU LOGO (OPTIONNELLE) */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
        <div className="border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-stone-900">
              Version alternative du logo (Fond sombre / Blanc)
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-600">
              Optionnel
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Fournissez une déclinaison blanche ou lumineuse spécifique si votre logo principal n'offre pas un contraste suffisant sur la barre de navigation verte foncée (#063F3A).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-stone-200 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-xs font-bold text-stone-600 mb-2">Version actuelle sur fond sombre</span>
            <div className="h-20 bg-[#063F3A] rounded-lg flex items-center justify-center p-3">
              {branding.logoAltUrl ? (
                <img
                  src={getCacheBustedUrl(branding.logoAltUrl, branding.updatedAt)}
                  alt="Logo alternatif"
                  className="max-h-12 max-w-full object-contain"
                />
              ) : (
                <span className="text-xs text-white/50 italic">
                  Utilise le logo principal ou le logo par défaut
                </span>
              )}
            </div>
            {branding.logoAltUrl && isSuperAdmin && (
              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={() => handleResetToDefault('logoAlt')}
                  className="text-[11px] text-stone-500 hover:text-red-600 font-semibold"
                >
                  Supprimer cette version alternative
                </button>
              </div>
            )}
          </div>

          <div className="border border-dashed border-stone-300 rounded-xl p-4 flex flex-col justify-between bg-stone-50/50">
            <span className="text-xs font-bold text-stone-700 mb-2">
              {stagedLogoAlt ? 'Nouvelle version sélectionnée' : 'Téléverser une version alternative'}
            </span>

            {stagedLogoAlt ? (
              <div className="h-20 bg-[#063F3A] rounded-lg flex items-center justify-center p-3">
                <img
                  src={stagedLogoAlt.previewUrl}
                  alt="Aperçu logo alternatif"
                  className="max-h-12 max-w-full object-contain"
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => isSuperAdmin && logoAltInputRef.current?.click()}
                disabled={!isSuperAdmin}
                className="h-20 rounded-lg border-2 border-dashed border-stone-200 flex flex-col items-center justify-center text-xs font-bold text-stone-600 hover:bg-white hover:border-[#00843D]/50 transition-colors disabled:opacity-50"
              >
                <Upload className="w-4 h-4 text-stone-400 mb-1" />
                Sélectionner un fichier contrasté
              </button>
            )}

            {stagedLogoAlt && (
              <div className="mt-2 flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => cancelStaged('logoAlt')}
                  className="px-2.5 py-1 text-[11px] font-bold text-stone-600 hover:bg-stone-200 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSaveAll}
                  className="px-3 py-1 text-[11px] font-bold bg-[#00843D] text-white rounded-lg shadow-xs"
                >
                  Enregistrer
                </button>
              </div>
            )}
          </div>
        </div>

        <input
          ref={logoAltInputRef}
          type="file"
          accept=".png,.svg,.webp,image/png,image/svg+xml,image/webp"
          onChange={(e) => handleFileSelect(e, 'logoAlt')}
          className="hidden"
        />
      </div>

    </div>
  );
}
