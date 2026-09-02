import { useState, useEffect } from 'react';
import { Image as ImageIcon, Upload, Search, Trash2, Copy, Check, Filter, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Media } from '../../../types';
import { fetchCMSMedia, addCMSMedia, deleteCMSMedia } from '../../../lib/cms';
import { useAuthStore } from '../../../store/auth';

export function AdminCMSMedia() {
  const { userProfile } = useAuthStore();
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'IMAGE' | 'DOCUMENT'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const items = await fetchCMSMedia();
      setMediaList(items);
    } catch (err) {
      console.error("Error loading media:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("Fichier trop volumineux (max 10 Mo).");
        return;
      }
      setUploadFile(file);
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
      const reader = new FileReader();
      reader.onload = () => {
        setUploadPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadPreview) return;
    setUploading(true);
    try {
      const newMedia = await addCMSMedia({
        url: uploadPreview,
        title: uploadTitle || uploadFile?.name || 'Média sans titre',
        description: uploadDesc,
        type: 'IMAGE',
        createdAt: Date.now(),
        authorId: userProfile?.id || 'admin'
      });
      setMediaList(prev => [newMedia, ...prev]);
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadPreview(null);
      setUploadTitle('');
      setUploadDesc('');
    } catch (err) {
      console.error("Upload error:", err);
      alert("Erreur lors de l'enregistrement du média.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous supprimer définitivement ce média ?")) return;
    try {
      await deleteCMSMedia(id);
      setMediaList(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = mediaList.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(search.toLowerCase()));
    const matchesType = filterType === 'ALL' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <h1 className="text-xl md:text-2xl font-bold font-heading text-[#6B3E1E]">
            Médiathèque Centrale FAFE
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Gérez l'ensemble des images, logos, visuels et documents utilisés par le CMS.
          </p>
        </div>

        <Button
          onClick={() => setShowUploadModal(true)}
          className="bg-[#E67E22] hover:bg-[#c96a1a] text-white text-xs font-bold"
        >
          <Upload className="w-4 h-4 mr-2" />
          Téléverser un média
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-stone-200">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Rechercher par titre ou description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#E67E22]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-stone-400 font-medium">Type :</span>
          <div className="flex bg-stone-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1 rounded-md font-bold transition-colors ${
                filterType === 'ALL' ? 'bg-white text-[#E67E22] shadow-xs' : 'text-stone-500'
              }`}
            >
              Tous ({mediaList.length})
            </button>
            <button
              onClick={() => setFilterType('IMAGE')}
              className={`px-3 py-1 rounded-md font-bold transition-colors ${
                filterType === 'IMAGE' ? 'bg-white text-[#E67E22] shadow-xs' : 'text-stone-500'
              }`}
            >
              Images
            </button>
          </div>
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-stone-400">
          <Loader2 className="w-8 h-8 animate-spin text-[#E67E22] mb-2" />
          <p className="text-sm">Chargement des médias...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <ImageIcon className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <p className="font-bold text-stone-700">Aucun média trouvé</p>
          <p className="text-xs text-stone-400 mt-1">Ajoutez votre premier visuel en cliquant sur Téléverser.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((item) => (
            <div 
              key={item.id}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all group"
            >
              <div className="aspect-video relative overflow-hidden bg-stone-100">
                <img 
                  src={item.url} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                  <button
                    onClick={() => handleCopyUrl(item.url, item.id)}
                    className="p-2 bg-white/90 hover:bg-white text-stone-800 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm"
                    title="Copier l'URL"
                  >
                    {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-white/90 hover:bg-white text-stone-800 rounded-lg text-xs font-bold"
                    title="Ouvrir dans un nouvel onglet"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  {!item.id.startsWith('stock-') && (
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 bg-red-600/90 hover:bg-red-700 text-white rounded-lg text-xs font-bold"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4 space-y-1">
                <p className="text-xs font-bold text-stone-800 truncate" title={item.title}>
                  {item.title}
                </p>
                {item.description && (
                  <p className="text-[11px] text-stone-500 line-clamp-1">{item.description}</p>
                )}
                <div className="pt-2 flex items-center justify-between text-[10px] text-stone-400">
                  <span>{item.id.startsWith('stock-') ? 'Stock FAFE' : 'Téléversé'}</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-stone-200">
            <div className="px-6 py-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
              <h2 className="text-base font-bold text-[#6B3E1E]">Téléverser un nouveau média</h2>
              <button onClick={() => setShowUploadModal(false)} className="text-stone-400 hover:text-stone-700">✕</button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
              <div className="border-2 border-dashed border-stone-300 rounded-2xl p-6 text-center bg-stone-50 hover:bg-orange-50/20 transition-colors">
                {uploadPreview ? (
                  <div className="space-y-2">
                    <img src={uploadPreview} alt="Aperçu" className="max-h-40 mx-auto rounded-xl object-contain shadow-xs" />
                    <button
                      type="button"
                      onClick={() => { setUploadFile(null); setUploadPreview(null); }}
                      className="text-xs text-red-600 font-bold hover:underline"
                    >
                      Changer de fichier
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <Upload className="w-8 h-8 text-[#E67E22] mx-auto mb-2" />
                    <p className="text-xs font-bold text-stone-700">Cliquez pour sélectionner une image</p>
                    <p className="text-[10px] text-stone-400 mt-1">PNG, JPG, WebP jusqu'à 10 Mo</p>
                    <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                  </label>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">Titre du média</label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={e => setUploadTitle(e.target.value)}
                  placeholder="Ex: Assemblée Générale 2025"
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#E67E22]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">Description (optionnelle)</label>
                <input
                  type="text"
                  value={uploadDesc}
                  onChange={e => setUploadDesc(e.target.value)}
                  placeholder="Contexte, crédit photo ou lieu..."
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#E67E22]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowUploadModal(false)}
                  className="text-xs"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={uploading || !uploadPreview}
                  className="bg-[#E67E22] hover:bg-[#c96a1a] text-white text-xs font-bold"
                >
                  {uploading ? 'Enregistrement...' : 'Enregistrer dans la médiathèque'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
