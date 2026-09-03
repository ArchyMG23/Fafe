import { useState, useEffect } from 'react';
import { 
  Save, Eye, CheckCircle2, RotateCcw, AlertTriangle, Globe,
  LayoutTemplate, Image as ImageIcon, Users, Award, FileText, 
  Target, TrendingUp, Heart, Phone, ShieldCheck, Sparkles, Building, Loader2
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { CMSPageId, CMSPageRecord } from '../../../types';
import { getCMSPageRecord, saveCMSDraft, publishCMSPage, CMS_PAGE_DEFAULTS } from '../../../lib/cms';
import { useAuthStore } from '../../../store/auth';
import { CMSFieldWrapper } from './CMSFieldWrapper';
import { CMSImageField } from './CMSImageField';
import { CMSListField } from './CMSListField';
import { CMSSectionCard } from './CMSSectionCard';
import { CMSPreviewModal } from './CMSPreviewModal';

interface CMSPageEditorProps {
  pageId: CMSPageId;
  pageTitle: string;
  pageDescription: string;
}

export function CMSPageEditor({ pageId, pageTitle, pageDescription }: CMSPageEditorProps) {
  const { userProfile } = useAuthStore();
  const [record, setRecord] = useState<CMSPageRecord | null>(null);
  const [draftData, setDraftData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [activeLang, setActiveLang] = useState<'fr' | 'en'>('fr');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadPageData();
  }, [pageId]);

  const loadPageData = async () => {
    setLoading(true);
    try {
      const pageRecord = await getCMSPageRecord(pageId);
      setRecord(pageRecord);
      setDraftData(pageRecord.draftContent);
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error("Failed to load page data:", err);
      setDraftData(CMS_PAGE_DEFAULTS[pageId]);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (section: string, field: string, value: any) => {
    setDraftData((prev: any) => {
      const updated = { ...prev };
      if (!updated[section]) updated[section] = {};
      updated[section] = {
        ...updated[section],
        [field]: value
      };
      return updated;
    });
    setHasUnsavedChanges(true);
  };

  const handleNestedFieldChange = (section: string, subSection: string, field: string, value: any) => {
    setDraftData((prev: any) => {
      const updated = { ...prev };
      if (!updated[section]) updated[section] = {};
      if (!updated[section][subSection]) updated[section][subSection] = {};
      updated[section][subSection] = {
        ...updated[section][subSection],
        [field]: value
      };
      return updated;
    });
    setHasUnsavedChanges(true);
  };

  const handleArrayChange = (section: string, value: any[]) => {
    setDraftData((prev: any) => ({
      ...prev,
      [section]: value
    }));
    setHasUnsavedChanges(true);
  };

  const handleSaveDraft = async () => {
    if (!userProfile) return;
    setSaving(true);
    setFeedback(null);
    try {
      await saveCMSDraft(pageId, draftData, {
        id: userProfile.id,
        name: `${userProfile.firstName} ${userProfile.lastName}`,
        email: userProfile.email
      });
      setHasUnsavedChanges(false);
      setFeedback({ type: 'success', message: "Brouillon enregistré avec succès dans la base de données." });
      const updatedRecord = await getCMSPageRecord(pageId);
      setRecord(updatedRecord);
    } catch (err) {
      console.error("Save draft error:", err);
      setFeedback({ type: 'error', message: "Erreur lors de l'enregistrement du brouillon." });
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!userProfile) return;
    if (!confirm(`Êtes-vous sûr de vouloir publier les modifications pour la page "${pageTitle}" ? Le contenu sera immédiatement visible sur le site public.`)) {
      return;
    }
    setPublishing(true);
    setFeedback(null);
    try {
      await publishCMSPage(pageId, draftData, {
        id: userProfile.id,
        name: `${userProfile.firstName} ${userProfile.lastName}`,
        email: userProfile.email
      });
      setHasUnsavedChanges(false);
      setFeedback({ type: 'success', message: `La page "${pageTitle}" a été publiée avec succès sur le site public.` });
      const updatedRecord = await getCMSPageRecord(pageId);
      setRecord(updatedRecord);
    } catch (err) {
      console.error("Publish error:", err);
      setFeedback({ type: 'error', message: "Erreur lors de la publication de la page." });
    } finally {
      setPublishing(false);
    }
  };

  const handleResetToPublished = () => {
    if (!record) return;
    if (confirm("Voulez-vous annuler toutes vos modifications non publiées et rétablir la dernière version publiée ?")) {
      setDraftData(record.publishedContent);
      setHasUnsavedChanges(false);
      setFeedback({ type: 'success', message: "Les modifications ont été réinitialisées." });
    }
  };

  if (loading || !draftData) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-stone-400">
        <Loader2 className="w-10 h-10 animate-spin text-[#E67E22] mb-3" />
        <p className="text-sm font-medium">Chargement des données du CMS...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Sticky Action Header */}
      <div className="sticky top-16 z-20 bg-white/95 backdrop-blur-md p-4 md:p-6 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Page Identity & Meta */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl md:text-2xl font-bold font-heading text-[#6B3E1E]">
              {pageTitle}
            </h1>
            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
              hasUnsavedChanges 
                ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
            }`}>
              {hasUnsavedChanges ? '● Modifications non enregistrées' : '✓ À jour'}
            </span>
          </div>
          <p className="text-xs text-stone-500 max-w-xl">{pageDescription}</p>
          {record && (
            <div className="flex items-center gap-2 mt-1.5 text-[11px]">
              {record.publishedAt ? (
                <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium border border-emerald-100">
                  Dernière publication : {new Date(record.publishedAt).toLocaleString('fr-FR')} par {record.publishedBy || 'Admin'}
                </span>
              ) : (
                <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-medium border border-amber-100">
                  ⚠️ Jamais publié
                </span>
              )}
              {record.status === 'DRAFT' && record.publishedAt && (
                <span className="text-red-600 bg-red-50 px-1.5 py-0.5 rounded font-medium border border-red-100 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Modifications en brouillon (Non publiées)
                </span>
              )}
            </div>
          )}
        </div>

        {/* Global Controls & Actions */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          
          {/* Language Switcher */}
          <div className="flex items-center bg-stone-100 rounded-xl p-1 border border-stone-200">
            <button
              type="button"
              onClick={() => setActiveLang('fr')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeLang === 'fr' 
                  ? 'bg-white text-[#E67E22] shadow-sm' 
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              🇫🇷 Français
            </button>
            <button
              type="button"
              onClick={() => setActiveLang('en')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeLang === 'en' 
                  ? 'bg-white text-[#E67E22] shadow-sm' 
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              🇬🇧 English
            </button>
          </div>

          {/* Reset / Revert */}
          {hasUnsavedChanges && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetToPublished}
              className="text-stone-600 border-stone-300 text-xs h-9"
              title="Annuler les modifications et recharger la version publiée"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Rétablir
            </Button>
          )}

          {/* Save Draft */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            disabled={saving || publishing}
            className="text-stone-700 border-stone-300 hover:bg-stone-50 text-xs h-9"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Save className="w-3.5 h-3.5 mr-1.5 text-stone-500" />}
            Enregistrer le brouillon
          </Button>

          {/* Preview */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPreviewOpen(true)}
            className="text-[#6B3E1E] border-stone-300 hover:bg-stone-50 text-xs h-9"
          >
            <Eye className="w-3.5 h-3.5 mr-1.5 text-[#E67E22]" />
            Prévisualiser
          </Button>

          {/* Publish */}
          <Button
            type="button"
            size="sm"
            onClick={handlePublish}
            disabled={saving || publishing}
            className="bg-[#E67E22] hover:bg-[#c96a1a] text-white text-xs font-bold h-9 shadow-md"
          >
            {publishing ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />}
            Publier sur le site
          </Button>
        </div>
      </div>

      {/* Status Feedback Toast */}
      {feedback && (
        <div className={`p-4 rounded-xl text-sm flex items-center justify-between animate-in fade-in duration-150 ${
          feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-red-600" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs font-bold hover:underline">Fermer</button>
        </div>
      )}

      {/* ======================================================= */}
      {/* 1. SECTIONS ACCUEIL */}
      {/* ======================================================= */}
      {pageId === 'accueil' && (
        <div className="space-y-6">
          
          {/* Section 1: Hero */}
          <CMSSectionCard
            id="hero"
            title="1. Section Hero & Accroche Principale"
            description="Le titre percutant, l'accroche, les boutons et l'image d'en-tête."
            icon={Sparkles}
            badge="Haut de page"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <CMSFieldWrapper
                  label="Badge / Surtitre"
                  value={draftData.hero?.badge}
                  onChange={(val) => handleFieldChange('hero', 'badge', val)}
                  activeLang={activeLang}
                  placeholder="RÉSEAU PANAFRICAIN"
                />

                <CMSFieldWrapper
                  label="Titre Principal (H1)"
                  value={draftData.hero?.title}
                  onChange={(val) => handleFieldChange('hero', 'title', val)}
                  activeLang={activeLang}
                  placeholder="L'excellence au féminin..."
                  required
                />

                <CMSFieldWrapper
                  label="Texte d'accroche / Description"
                  value={draftData.hero?.shortText}
                  onChange={(val) => handleFieldChange('hero', 'shortText', val)}
                  activeLang={activeLang}
                  type="textarea"
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <CMSFieldWrapper
                    label="Texte Bouton 1"
                    value={draftData.hero?.buttonText}
                    onChange={(val) => handleFieldChange('hero', 'buttonText', val)}
                    activeLang={activeLang}
                  />
                  <CMSFieldWrapper
                    label="Lien Bouton 1"
                    value={draftData.hero?.buttonLink || '/rejoindre'}
                    onChange={(val) => handleFieldChange('hero', 'buttonLink', val)}
                    activeLang={activeLang}
                    type="url"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <CMSFieldWrapper
                    label="Texte Bouton 2"
                    value={draftData.hero?.secondaryButtonText}
                    onChange={(val) => handleFieldChange('hero', 'secondaryButtonText', val)}
                    activeLang={activeLang}
                  />
                  <CMSFieldWrapper
                    label="Lien Bouton 2"
                    value={draftData.hero?.secondaryButtonLink || '/dons'}
                    onChange={(val) => handleFieldChange('hero', 'secondaryButtonLink', val)}
                    activeLang={activeLang}
                    type="url"
                  />
                </div>

                <CMSImageField
                  label="Image d'en-tête / Visuel Hero"
                  value={draftData.hero?.heroImage || ''}
                  onChange={(url) => handleFieldChange('hero', 'heroImage', url)}
                  aspectRatio="landscape"
                />
              </div>
            </div>
          </CMSSectionCard>

          {/* Section 2: Chiffres Clés */}
          <CMSSectionCard
            id="stats"
            title="2. Chiffres Clés & Statistiques"
            description="Mettez en avant 4 indicateurs d'impact du FAFE."
            icon={TrendingUp}
          >
            <CMSListField
              label="Statistiques"
              items={draftData.stats || []}
              onChange={(val) => handleArrayChange('stats', val)}
              activeLang={activeLang}
              itemType="stats"
            />
          </CMSSectionCard>

          {/* Section 3: Missions & Piliers */}
          <CMSSectionCard
            id="missions"
            title="3. Notre Vocation (3 Piliers)"
            description="Financement, Formation & Mentorat, et Réseau Panafricain."
            icon={Award}
          >
            <div className="space-y-4 mb-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <CMSFieldWrapper
                  label="Badge Section"
                  value={draftData.missions?.badge}
                  onChange={(val) => handleFieldChange('missions', 'badge', val)}
                  activeLang={activeLang}
                />
                <CMSFieldWrapper
                  label="Titre de la section"
                  value={draftData.missions?.title}
                  onChange={(val) => handleFieldChange('missions', 'title', val)}
                  activeLang={activeLang}
                />
              </div>
              <CMSFieldWrapper
                label="Sous-titre explicatif"
                value={draftData.missions?.subtitle}
                onChange={(val) => handleFieldChange('missions', 'subtitle', val)}
                activeLang={activeLang}
              />
            </div>

            <CMSListField
              label="Piliers de réussite"
              items={draftData.missions?.pillars || []}
              onChange={(val) => handleNestedFieldChange('missions', 'pillars', '', val)}
              activeLang={activeLang}
              itemType="pillars"
            />
          </CMSSectionCard>

          {/* Section 4: Annuaire */}
          <CMSSectionCard
            id="directory"
            title="4. Section Annuaire des Talents"
            description="Bloc incitant à découvrir les profils des entrepreneures."
            icon={Users}
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <CMSFieldWrapper
                label="Badge"
                value={draftData.directory?.badge}
                onChange={(val) => handleFieldChange('directory', 'badge', val)}
                activeLang={activeLang}
              />
              <CMSFieldWrapper
                label="Titre"
                value={draftData.directory?.title}
                onChange={(val) => handleFieldChange('directory', 'title', val)}
                activeLang={activeLang}
              />
            </div>
            <CMSFieldWrapper
              label="Sous-titre"
              value={draftData.directory?.subtitle}
              onChange={(val) => handleFieldChange('directory', 'subtitle', val)}
              activeLang={activeLang}
            />
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <CMSFieldWrapper
                label="Texte du Bouton"
                value={draftData.directory?.buttonText}
                onChange={(val) => handleFieldChange('directory', 'buttonText', val)}
                activeLang={activeLang}
              />
              <CMSFieldWrapper
                label="Lien du Bouton"
                value={draftData.directory?.buttonLink || '/entrepreneures'}
                onChange={(val) => handleFieldChange('directory', 'buttonLink', val)}
                activeLang={activeLang}
                type="url"
              />
            </div>
          </CMSSectionCard>

          {/* Section 5: Appel aux dons / CTA */}
          <CMSSectionCard
            id="donationCta"
            title="5. Appel aux Dons (CTA)"
            description="Bannière d'engagement pour soutenir les projets du FAFE."
            icon={Heart}
          >
            <div className="space-y-4">
              <CMSFieldWrapper
                label="Titre du CTA"
                value={draftData.donationCta?.title}
                onChange={(val) => handleFieldChange('donationCta', 'title', val)}
                activeLang={activeLang}
              />
              <CMSFieldWrapper
                label="Texte d'explication"
                value={draftData.donationCta?.description}
                onChange={(val) => handleFieldChange('donationCta', 'description', val)}
                activeLang={activeLang}
                type="textarea"
                rows={3}
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <CMSFieldWrapper
                  label="Texte du Bouton"
                  value={draftData.donationCta?.buttonText}
                  onChange={(val) => handleFieldChange('donationCta', 'buttonText', val)}
                  activeLang={activeLang}
                />
                <CMSFieldWrapper
                  label="Lien du Bouton"
                  value={draftData.donationCta?.buttonLink || '/dons'}
                  onChange={(val) => handleFieldChange('donationCta', 'buttonLink', val)}
                  activeLang={activeLang}
                  type="url"
                />
              </div>
            </div>
          </CMSSectionCard>

          {/* Section 6: Partenaires */}
          <CMSSectionCard
            id="partners"
            title="6. Partenaires Institutionnels"
            description="Liste des organisations partenaires du FAFE."
            icon={Building}
          >
            <div className="space-y-4">
              <CMSFieldWrapper
                label="Titre de la section partenaires"
                value={draftData.partners?.title}
                onChange={(val) => handleFieldChange('partners', 'title', val)}
                activeLang={activeLang}
              />
              <CMSListField
                label="Partenaires"
                items={draftData.partners?.list || []}
                onChange={(val) => handleFieldChange('partners', 'list', val)}
                activeLang={activeLang}
                itemType="partners"
              />
            </div>
          </CMSSectionCard>

          {/* Section 7: SEO */}
          <CMSSectionCard
            id="seo"
            title="7. SEO & Métadonnées"
            description="Balises pour Google, WhatsApp, Facebook et Twitter."
            icon={Globe}
          >
            <div className="space-y-4">
              <CMSFieldWrapper
                label="Meta Title (Titre dans l'onglet du navigateur)"
                value={draftData.seo?.metaTitle}
                onChange={(val) => handleFieldChange('seo', 'metaTitle', val)}
                activeLang={activeLang}
              />
              <CMSFieldWrapper
                label="Meta Description (Résumé pour les moteurs de recherche)"
                value={draftData.seo?.metaDescription}
                onChange={(val) => handleFieldChange('seo', 'metaDescription', val)}
                activeLang={activeLang}
                type="textarea"
                rows={2}
              />
              <CMSImageField
                label="Image de partage sur les réseaux sociaux (OG Image)"
                value={draftData.seo?.ogImage || ''}
                onChange={(url) => handleFieldChange('seo', 'ogImage', url)}
              />
            </div>
          </CMSSectionCard>

        </div>
      )}

      {/* ======================================================= */}
      {/* 2. SECTIONS PAGE NOUS */}
      {/* ======================================================= */}
      {pageId === 'nous' && (
        <div className="space-y-6">
          
          {/* Section 1: Hero PCA */}
          <CMSSectionCard
            id="pcaHero"
            title="1. Hero & Mot de la Présidente (PCA)"
            description="Présentation officielle de la PCA et mot d'ouverture."
            icon={Users}
            badge="Haut de page"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <CMSFieldWrapper
                  label="Label / Badge"
                  value={draftData.pcaHero?.heroLabel}
                  onChange={(val) => handleFieldChange('pcaHero', 'heroLabel', val)}
                  activeLang={activeLang}
                />
                <CMSFieldWrapper
                  label="Titre visible de la page"
                  value={draftData.pcaHero?.heroTitle}
                  onChange={(val) => handleFieldChange('pcaHero', 'heroTitle', val)}
                  activeLang={activeLang}
                  placeholder="NOUS"
                  required
                />
                <CMSFieldWrapper
                  label="Citation / Message de la PCA"
                  value={draftData.pcaHero?.heroDescription}
                  onChange={(val) => handleFieldChange('pcaHero', 'heroDescription', val)}
                  activeLang={activeLang}
                  type="textarea"
                  rows={4}
                />
              </div>

              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                      Nom complet de la PCA
                    </label>
                    <input
                      type="text"
                      value={draftData.pcaHero?.pcaName || ''}
                      onChange={(e) => handleFieldChange('pcaHero', 'pcaName', e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E67E22]"
                    />
                  </div>
                  <CMSFieldWrapper
                    label="Titre du mandat"
                    value={draftData.pcaHero?.pcaTitle}
                    onChange={(val) => handleFieldChange('pcaHero', 'pcaTitle', val)}
                    activeLang={activeLang}
                  />
                </div>

                <CMSImageField
                  label="Photo officielle de la PCA"
                  value={draftData.pcaHero?.pcaPhoto || ''}
                  onChange={(url) => handleFieldChange('pcaHero', 'pcaPhoto', url)}
                  aspectRatio="portrait"
                />
              </div>
            </div>
          </CMSSectionCard>

          {/* Section 2: Présentation */}
          <CMSSectionCard
            id="presentation"
            title="2. Présentation Générale (Qui sommes-nous ?)"
            description="Le texte officiel décrivant la mission et la portée du FAFE."
            icon={FileText}
          >
            <div className="space-y-4">
              <CMSFieldWrapper
                label="Titre de la section"
                value={draftData.presentation?.title}
                onChange={(val) => handleFieldChange('presentation', 'title', val)}
                activeLang={activeLang}
              />
              <CMSFieldWrapper
                label="Texte de présentation"
                value={draftData.presentation?.description}
                onChange={(val) => handleFieldChange('presentation', 'description', val)}
                activeLang={activeLang}
                type="textarea"
                rows={6}
              />
            </div>
          </CMSSectionCard>

          {/* Section 3: Historique */}
          <CMSSectionCard
            id="historique"
            title="3. Notre Histoire (Jalons & Chronologie)"
            description="Les étapes fondatrices de l'évolution du FAFE."
            icon={TrendingUp}
          >
            <div className="space-y-4 mb-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <CMSFieldWrapper
                  label="Titre"
                  value={draftData.historique?.title}
                  onChange={(val) => handleFieldChange('historique', 'title', val)}
                  activeLang={activeLang}
                />
                <CMSFieldWrapper
                  label="Sous-titre"
                  value={draftData.historique?.subtitle}
                  onChange={(val) => handleFieldChange('historique', 'subtitle', val)}
                  activeLang={activeLang}
                />
              </div>
            </div>

            <CMSListField
              label="Étapes chronologiques"
              items={draftData.historique?.events || []}
              onChange={(val) => handleFieldChange('historique', 'events', val)}
              activeLang={activeLang}
              itemType="timeline"
            />
          </CMSSectionCard>

          {/* Section 4: Vision & Mission */}
          <CMSSectionCard
            id="vision-mission"
            title="4. Vision et Mission"
            description="Les deux piliers doctrinaux du réseau."
            icon={Target}
          >
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4 p-4 bg-stone-50 rounded-2xl border border-stone-200">
                <CMSFieldWrapper
                  label="Titre Vision"
                  value={draftData.vision?.title}
                  onChange={(val) => handleFieldChange('vision', 'title', val)}
                  activeLang={activeLang}
                />
                <CMSFieldWrapper
                  label="Description Vision"
                  value={draftData.vision?.description}
                  onChange={(val) => handleFieldChange('vision', 'description', val)}
                  activeLang={activeLang}
                  type="textarea"
                  rows={4}
                />
              </div>

              <div className="space-y-4 p-4 bg-stone-50 rounded-2xl border border-stone-200">
                <CMSFieldWrapper
                  label="Titre Mission"
                  value={draftData.mission?.title}
                  onChange={(val) => handleFieldChange('mission', 'title', val)}
                  activeLang={activeLang}
                />
                <CMSFieldWrapper
                  label="Description Mission"
                  value={draftData.mission?.description}
                  onChange={(val) => handleFieldChange('mission', 'description', val)}
                  activeLang={activeLang}
                  type="textarea"
                  rows={4}
                />
              </div>
            </div>
          </CMSSectionCard>

          {/* Section 5: Valeurs */}
          <CMSSectionCard
            id="valeurs"
            title="5. Nos Valeurs Fondamentales"
            description="Les principes d'action du réseau."
            icon={Award}
          >
            <CMSListField
              label="Liste des valeurs"
              items={draftData.valeurs || []}
              onChange={(val) => handleArrayChange('valeurs', val)}
              activeLang={activeLang}
              itemType="valeurs"
            />
          </CMSSectionCard>

          {/* Section 6: Gouvernance */}
          <CMSSectionCard
            id="gouvernance"
            title="6. Gouvernance Institutionnelle"
            description="Organisation et structure décisionnelle."
            icon={ShieldCheck}
          >
            <div className="space-y-4">
              <CMSFieldWrapper
                label="Titre"
                value={draftData.gouvernance?.title}
                onChange={(val) => handleFieldChange('gouvernance', 'title', val)}
                activeLang={activeLang}
              />
              <CMSFieldWrapper
                label="Description"
                value={draftData.gouvernance?.description}
                onChange={(val) => handleFieldChange('gouvernance', 'description', val)}
                activeLang={activeLang}
                type="textarea"
                rows={4}
              />
            </div>
          </CMSSectionCard>

          {/* Section 7: Bureau Exécutif */}
          <CMSSectionCard
            id="bureau"
            title="7. Le Bureau Exécutif"
            description="Membres élus du Bureau Exécutif."
            icon={Users}
          >
            <div className="space-y-4 mb-6">
              <CMSFieldWrapper
                label="Titre de la section"
                value={draftData.bureauExecutif?.title}
                onChange={(val) => handleFieldChange('bureauExecutif', 'title', val)}
                activeLang={activeLang}
              />
            </div>
            <CMSListField
              label="Membres du Bureau"
              items={draftData.bureauExecutif?.members || []}
              onChange={(val) => handleFieldChange('bureauExecutif', 'members', val)}
              activeLang={activeLang}
              itemType="members"
            />
          </CMSSectionCard>

          {/* Section 8: Équipe Opérationnelle */}
          <CMSSectionCard
            id="equipe"
            title="8. L'Équipe Opérationnelle"
            description="Équipe en charge de la gestion quotidienne."
            icon={Users}
          >
            <div className="space-y-4 mb-6">
              <CMSFieldWrapper
                label="Titre de la section"
                value={draftData.equipe?.title}
                onChange={(val) => handleFieldChange('equipe', 'title', val)}
                activeLang={activeLang}
              />
            </div>
            <CMSListField
              label="Membres de l'équipe"
              items={draftData.equipe?.members || []}
              onChange={(val) => handleFieldChange('equipe', 'members', val)}
              activeLang={activeLang}
              itemType="members"
            />
          </CMSSectionCard>

          {/* Section 9: Rapports d'activités */}
          <CMSSectionCard
            id="rapports"
            title="9. Rapports d'Activités & Transparence"
            description="Rapports annuels téléchargeables."
            icon={FileText}
          >
            <div className="space-y-4 mb-6">
              <CMSFieldWrapper
                label="Titre de la section"
                value={draftData.rapports?.title}
                onChange={(val) => handleFieldChange('rapports', 'title', val)}
                activeLang={activeLang}
              />
            </div>
            <CMSListField
              label="Rapports d'activités"
              items={draftData.rapports?.list || []}
              onChange={(val) => handleFieldChange('rapports', 'list', val)}
              activeLang={activeLang}
              itemType="reports"
            />
          </CMSSectionCard>

          {/* Section 10: Contact */}
          <CMSSectionCard
            id="contact"
            title="10. Coordonnées & Secrétariat"
            description="Adresse physique, téléphone, email et réseaux sociaux."
            icon={Phone}
          >
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <CMSFieldWrapper
                  label="Titre"
                  value={draftData.contact?.title}
                  onChange={(val) => handleFieldChange('contact', 'title', val)}
                  activeLang={activeLang}
                />
                <CMSFieldWrapper
                  label="Description courte"
                  value={draftData.contact?.description}
                  onChange={(val) => handleFieldChange('contact', 'description', val)}
                  activeLang={activeLang}
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Adresse physique
                  </label>
                  <input
                    type="text"
                    value={draftData.contact?.address || ''}
                    onChange={(e) => handleFieldChange('contact', 'address', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Téléphone officiel
                  </label>
                  <input
                    type="text"
                    value={draftData.contact?.phone || ''}
                    onChange={(e) => handleFieldChange('contact', 'phone', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Email officiel
                  </label>
                  <input
                    type="email"
                    value={draftData.contact?.email || ''}
                    onChange={(e) => handleFieldChange('contact', 'email', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-stone-200 rounded-xl"
                  />
                </div>
              </div>
            </div>
          </CMSSectionCard>

          {/* Section 11: SEO */}
          <CMSSectionCard
            id="seo"
            title="11. SEO & Métadonnées Page Nous"
            description="Référencement naturel de la page Nous."
            icon={Globe}
          >
            <div className="space-y-4">
              <CMSFieldWrapper
                label="Meta Title"
                value={draftData.seo?.metaTitle}
                onChange={(val) => handleFieldChange('seo', 'metaTitle', val)}
                activeLang={activeLang}
              />
              <CMSFieldWrapper
                label="Meta Description"
                value={draftData.seo?.metaDescription}
                onChange={(val) => handleFieldChange('seo', 'metaDescription', val)}
                activeLang={activeLang}
                type="textarea"
                rows={2}
              />
            </div>
          </CMSSectionCard>

        </div>
      )}

      {/* ======================================================= */}
      {/* 3. SECTIONS ACTUALITÉS */}
      {/* ======================================================= */}
      {pageId === 'actualites' && (
        <div className="space-y-6">
          <CMSSectionCard
            id="header"
            title="En-tête de la Médiathèque & Agenda"
            description="Le titre et le texte explicatif affichés en tête de page."
            icon={FileText}
          >
            <div className="space-y-4">
              <CMSFieldWrapper
                label="Badge"
                value={draftData.header?.badge}
                onChange={(val) => handleFieldChange('header', 'badge', val)}
                activeLang={activeLang}
              />
              <CMSFieldWrapper
                label="Titre Principal"
                value={draftData.header?.title}
                onChange={(val) => handleFieldChange('header', 'title', val)}
                activeLang={activeLang}
                required
              />
              <CMSFieldWrapper
                label="Description d'introduction"
                value={draftData.header?.description}
                onChange={(val) => handleFieldChange('header', 'description', val)}
                activeLang={activeLang}
                type="textarea"
                rows={3}
              />
            </div>
          </CMSSectionCard>

          <CMSSectionCard
            id="seo"
            title="SEO & Métadonnées"
            description="Référencement naturel de la page Actualités."
            icon={Globe}
          >
            <div className="space-y-4">
              <CMSFieldWrapper
                label="Meta Title"
                value={draftData.seo?.metaTitle}
                onChange={(val) => handleFieldChange('seo', 'metaTitle', val)}
                activeLang={activeLang}
              />
              <CMSFieldWrapper
                label="Meta Description"
                value={draftData.seo?.metaDescription}
                onChange={(val) => handleFieldChange('seo', 'metaDescription', val)}
                activeLang={activeLang}
                type="textarea"
                rows={2}
              />
            </div>
          </CMSSectionCard>
        </div>
      )}

      {/* ======================================================= */}
      {/* 4. SECTIONS GALERIE */}
      {/* ======================================================= */}
      {pageId === 'galerie' && (
        <div className="space-y-6">
          <CMSSectionCard
            id="header"
            title="En-tête de la Galerie & Médiathèque"
            description="Titre et description de la médiathèque multimédia."
            icon={ImageIcon}
          >
            <div className="space-y-4">
              <CMSFieldWrapper
                label="Badge"
                value={draftData.header?.badge}
                onChange={(val) => handleFieldChange('header', 'badge', val)}
                activeLang={activeLang}
              />
              <CMSFieldWrapper
                label="Titre Principal"
                value={draftData.header?.title}
                onChange={(val) => handleFieldChange('header', 'title', val)}
                activeLang={activeLang}
                required
              />
              <CMSFieldWrapper
                label="Description"
                value={draftData.header?.description}
                onChange={(val) => handleFieldChange('header', 'description', val)}
                activeLang={activeLang}
                type="textarea"
                rows={3}
              />
            </div>
          </CMSSectionCard>

          <CMSSectionCard
            id="seo"
            title="SEO & Métadonnées"
            description="Référencement de la Galerie."
            icon={Globe}
          >
            <div className="space-y-4">
              <CMSFieldWrapper
                label="Meta Title"
                value={draftData.seo?.metaTitle}
                onChange={(val) => handleFieldChange('seo', 'metaTitle', val)}
                activeLang={activeLang}
              />
              <CMSFieldWrapper
                label="Meta Description"
                value={draftData.seo?.metaDescription}
                onChange={(val) => handleFieldChange('seo', 'metaDescription', val)}
                activeLang={activeLang}
                type="textarea"
                rows={2}
              />
            </div>
          </CMSSectionCard>
        </div>
      )}

      {/* ======================================================= */}
      {/* 5. SECTIONS DONS */}
      {/* ======================================================= */}
      {pageId === 'dons' && (
        <div className="space-y-6">
          <CMSSectionCard
            id="hero"
            title="1. En-tête & Appel aux Dons"
            description="Message d'encouragement et titre de la page Dons."
            icon={Heart}
          >
            <div className="space-y-4">
              <CMSFieldWrapper
                label="Badge"
                value={draftData.hero?.badge}
                onChange={(val) => handleFieldChange('hero', 'badge', val)}
                activeLang={activeLang}
              />
              <CMSFieldWrapper
                label="Titre Principal"
                value={draftData.hero?.title}
                onChange={(val) => handleFieldChange('hero', 'title', val)}
                activeLang={activeLang}
                required
              />
              <CMSFieldWrapper
                label="Description explicative"
                value={draftData.hero?.description}
                onChange={(val) => handleFieldChange('hero', 'description', val)}
                activeLang={activeLang}
                type="textarea"
                rows={3}
              />
            </div>
          </CMSSectionCard>

          <CMSSectionCard
            id="bankDetails"
            title="2. Coordonnées Bancaires Officielles"
            description="Informations utilisées pour les virements bancaires nationaux et internationaux."
            icon={Building}
          >
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Nom de la Banque
                  </label>
                  <input
                    type="text"
                    value={draftData.bankDetails?.bankName || ''}
                    onChange={(e) => handleFieldChange('bankDetails', 'bankName', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Numéro de compte / RIB
                  </label>
                  <input
                    type="text"
                    value={draftData.bankDetails?.accountNumber || ''}
                    onChange={(e) => handleFieldChange('bankDetails', 'accountNumber', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-stone-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    IBAN
                  </label>
                  <input
                    type="text"
                    value={draftData.bankDetails?.iban || ''}
                    onChange={(e) => handleFieldChange('bankDetails', 'iban', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-stone-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Code SWIFT / BIC
                  </label>
                  <input
                    type="text"
                    value={draftData.bankDetails?.swift || ''}
                    onChange={(e) => handleFieldChange('bankDetails', 'swift', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-stone-200 rounded-xl font-mono uppercase"
                  />
                </div>
              </div>

              <CMSFieldWrapper
                label="Note / Consigne de virement"
                value={draftData.instructions?.note}
                onChange={(val) => handleFieldChange('instructions', 'note', val)}
                activeLang={activeLang}
                type="textarea"
                rows={2}
              />
            </div>
          </CMSSectionCard>

          <CMSSectionCard
            id="seo"
            title="3. SEO & Métadonnées"
            description="Référencement de la page de don."
            icon={Globe}
          >
            <div className="space-y-4">
              <CMSFieldWrapper
                label="Meta Title"
                value={draftData.seo?.metaTitle}
                onChange={(val) => handleFieldChange('seo', 'metaTitle', val)}
                activeLang={activeLang}
              />
              <CMSFieldWrapper
                label="Meta Description"
                value={draftData.seo?.metaDescription}
                onChange={(val) => handleFieldChange('seo', 'metaDescription', val)}
                activeLang={activeLang}
                type="textarea"
                rows={2}
              />
            </div>
          </CMSSectionCard>
        </div>
      )}

      {/* ======================================================= */}
      {/* 6. SECTIONS GLOBAL (NAVBAR & FOOTER) */}
      {/* ======================================================= */}
      {pageId === 'global' && (
        <div className="space-y-6">
          <CMSSectionCard
            id="navbar"
            title="1. En-tête & Barre de Navigation (Navbar)"
            description="Textes et labels de la barre de navigation supérieure."
            icon={LayoutTemplate}
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Nom de marque principal
                </label>
                <input
                  type="text"
                  value={draftData.navbar?.brandTitle || 'FAFE'}
                  onChange={(e) => handleFieldChange('navbar', 'brandTitle', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-stone-200 rounded-xl"
                />
              </div>
              <CMSFieldWrapper
                label="Sous-titre de marque"
                value={draftData.navbar?.brandSubtitle}
                onChange={(val) => handleFieldChange('navbar', 'brandSubtitle', val)}
                activeLang={activeLang}
                placeholder="Panafricaine"
              />
            </div>
          </CMSSectionCard>

          <CMSSectionCard
            id="footer"
            title="2. Pied de Page (Footer)"
            description="Slogan, mentions de copyright et coordonnées globales."
            icon={LayoutTemplate}
          >
            <div className="space-y-4">
              <CMSFieldWrapper
                label="Slogan officiel"
                value={draftData.footer?.tagline}
                onChange={(val) => handleFieldChange('footer', 'tagline', val)}
                activeLang={activeLang}
                type="textarea"
                rows={2}
              />

              <CMSFieldWrapper
                label="Texte de copyright"
                value={draftData.footer?.copyright}
                onChange={(val) => handleFieldChange('footer', 'copyright', val)}
                activeLang={activeLang}
              />

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Adresse physique
                  </label>
                  <input
                    type="text"
                    value={draftData.footer?.address || ''}
                    onChange={(e) => handleFieldChange('footer', 'address', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Email de contact
                  </label>
                  <input
                    type="email"
                    value={draftData.footer?.email || ''}
                    onChange={(e) => handleFieldChange('footer', 'email', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="text"
                    value={draftData.footer?.phone || ''}
                    onChange={(e) => handleFieldChange('footer', 'phone', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-stone-200 rounded-xl"
                  />
                </div>
              </div>
            </div>
          </CMSSectionCard>
        </div>
      )}

      {/* Interactive Live Preview Modal */}
      <CMSPreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        pageId={pageId}
        draftData={draftData}
        activeLang={activeLang}
        onLangChange={setActiveLang}
      />

    </div>
  );
}
