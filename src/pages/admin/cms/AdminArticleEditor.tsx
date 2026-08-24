import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuthStore } from '../../../store/auth';
import { AdminPageHeader } from '../../../components/admin/AdminPageHeader';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Loader2, ArrowLeft, Save, Eye } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Category } from '../../../types';

export function AdminArticleEditor() {
  const { id } = useParams();
  const isNew = id === 'nouveau';
  const navigate = useNavigate();
  const { userProfile } = useAuthStore();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Editor state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>('DRAFT');
  const [featuredImage, setFeaturedImage] = useState('');
  
  // SEO
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    const init = async () => {
      // Fetch categories
      const catSnap = await getDocs(collection(db, 'categories'));
      setCategories(catSnap.docs.map(d => ({ id: d.id, ...d.data() } as Category)));

      if (!isNew && id) {
        const docRef = doc(db, 'articles', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTitle(data.title || '');
          setSlug(data.slug || '');
          setExcerpt(data.excerpt || '');
          setContent(data.content || '');
          setCategoryId(data.categoryId || '');
          setTags((data.tags || []).join(', '));
          setStatus(data.status || 'DRAFT');
          setFeaturedImage(data.featuredImage || '');
          setSeoTitle(data.seoTitle || '');
          setSeoDescription(data.seoDescription || '');
        }
      }
      setLoading(false);
    };
    init();
  }, [id, isNew]);

  const generateSlug = (text: string) => {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')           
      .replace(/[^\w\-]+/g, '')       
      .replace(/\-\-+/g, '-')         
      .replace(/^-+/, '')             
      .replace(/-+$/, '');            
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (isNew) {
      setSlug(generateSlug(e.target.value));
    }
  };

  const checkSlugUniqueness = async (slugToCheck: string) => {
    const q = query(collection(db, 'articles'), where('slug', '==', slugToCheck));
    const snap = await getDocs(q);
    // If we are editing, one doc (itself) is allowed
    if (snap.size === 0) return true;
    if (!isNew && snap.docs[0].id === id) return true;
    return false;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !content || !categoryId) {
      alert("Veuillez remplir les champs obligatoires (Titre, Slug, Contenu, Catégorie).");
      return;
    }

    setSaving(true);
    
    try {
      const isUnique = await checkSlugUniqueness(slug);
      if (!isUnique) {
        alert("Ce slug existe déjà. Veuillez le modifier.");
        setSaving(false);
        return;
      }

      const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
      
      const articleData = {
        title,
        slug,
        excerpt,
        content,
        categoryId,
        tags: tagsArray,
        status,
        featuredImage,
        seoTitle: seoTitle || title,
        seoDescription: seoDescription || excerpt,
        updatedAt: Date.now(),
        // Default publishedAt if published
        ...(status === 'PUBLISHED' && { publishedAt: Date.now() })
      };

      if (isNew) {
        const newId = doc(collection(db, 'articles')).id;
        await setDoc(doc(db, 'articles', newId), {
          ...articleData,
          authorId: userProfile?.id,
          authorName: `${userProfile?.firstName} ${userProfile?.lastName}`,
          createdAt: Date.now(),
        });
        navigate(`/admin/contenus/articles`);
      } else if (id) {
        await updateDoc(doc(db, 'articles', id), articleData);
        alert("Article mis à jour avec succès.");
      }
    } catch (error) {
      console.error("Error saving article:", error);
      alert("Une erreur est survenue lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#E67E22]" /></div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <AdminPageHeader 
        title={isNew ? "Nouvel Article" : "Éditer l'Article"}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/admin/contenus/articles')} className="text-stone-600">
              <ArrowLeft className="w-4 h-4 mr-2" /> Retour
            </Button>
            <Button onClick={() => setPreviewMode(!previewMode)} variant="outline" className="text-[#6B3E1E] border-[#6B3E1E]/20">
              <Eye className="w-4 h-4 mr-2" /> {previewMode ? 'Mode Édition' : 'Aperçu'}
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[#E67E22] hover:bg-[#c96a1a] text-white">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Enregistrer
            </Button>
          </div>
        }
      />

      {previewMode ? (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-200">
          <div className="max-w-3xl mx-auto prose prose-stone prose-orange">
            {featuredImage && <img src={featuredImage} alt="Cover" className="w-full h-64 object-cover rounded-xl mb-8" />}
            <h1 className="text-4xl font-bold font-heading text-[#6B3E1E] mb-4">{title || 'Titre de l\'article'}</h1>
            <p className="text-xl text-stone-500 italic mb-8 border-l-4 border-[#E67E22] pl-4">{excerpt}</p>
            <ReactMarkdown>{content || '*Le contenu s\'affichera ici...*'}</ReactMarkdown>
          </div>
        </div>
      ) : (
        <form className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 space-y-4">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">Titre <span className="text-red-500">*</span></label>
                <Input value={title} onChange={handleTitleChange} placeholder="Titre principal" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">Résumé <span className="text-red-500">*</span></label>
                <Textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={3} placeholder="Bref résumé de l'article" required />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-bold text-stone-700">Contenu (Markdown) <span className="text-red-500">*</span></label>
                  <a href="https://www.markdownguide.org/cheat-sheet/" target="_blank" rel="noreferrer" className="text-xs text-[#E67E22] hover:underline">Aide Markdown</a>
                </div>
                <Textarea 
                  value={content} 
                  onChange={e => setContent(e.target.value)} 
                  rows={20} 
                  placeholder="Écrivez le contenu ici en utilisant le format Markdown..." 
                  required 
                  className="font-mono text-sm"
                />
              </div>
            </div>
            
            {/* SEO Settings */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 space-y-4">
              <h3 className="font-bold text-stone-900 border-b border-stone-100 pb-2">Optimisation SEO</h3>
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">Méta Titre</label>
                <Input value={seoTitle} onChange={e => setSeoTitle(e.target.value)} placeholder="Titre pour les moteurs de recherche (défaut: Titre)" />
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">Méta Description</label>
                <Textarea value={seoDescription} onChange={e => setSeoDescription(e.target.value)} rows={2} placeholder="Description pour les moteurs de recherche (défaut: Résumé)" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 space-y-4">
              <h3 className="font-bold text-stone-900 border-b border-stone-100 pb-2">Paramètres</h3>
              
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">Statut</label>
                <select 
                  className="w-full h-10 px-3 rounded-md border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E67E22]"
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                >
                  <option value="DRAFT">Brouillon</option>
                  <option value="PUBLISHED">Publié</option>
                  <option value="ARCHIVED">Archivé</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">Catégorie <span className="text-red-500">*</span></label>
                <select 
                  className="w-full h-10 px-3 rounded-md border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E67E22]"
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  required
                >
                  <option value="">Sélectionner...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">Permalien (Slug) <span className="text-red-500">*</span></label>
                <Input value={slug} onChange={e => setSlug(e.target.value)} required />
                <p className="text-xs text-stone-400 mt-1">L'URL sera: /actualites/{slug || '...'}</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">Tags</label>
                <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="entrepreneuriat, afrique, tech..." />
                <p className="text-xs text-stone-400 mt-1">Séparés par des virgules</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">Image Principale (URL)</label>
                <Input value={featuredImage} onChange={e => setFeaturedImage(e.target.value)} placeholder="https://..." />
                {featuredImage && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-stone-200 h-32 bg-stone-50">
                    <img src={featuredImage} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
