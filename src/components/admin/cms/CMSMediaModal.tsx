import React, { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, Search, Check, Trash2, Plus, Loader2 } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Media } from '../../../types';
import { fetchCMSMedia, addCMSMedia, deleteCMSMedia } from '../../../lib/cms';
import { useAuthStore } from '../../../store/auth';

interface CMSMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, mediaTitle?: string) => void;
  currentUrl?: string;
}

export function CMSMediaModal({ isOpen, onClose, onSelect, currentUrl }: CMSMediaModalProps) {
  const { userProfile } = useAuthStore();
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'gallery' | 'upload' | 'url'>('gallery');
  const [selectedUrl, setSelectedUrl] = useState(currentUrl || '');
  
  // Direct URL state
  const [customUrl, setCustomUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  
  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadMedia();
      setSelectedUrl(currentUrl || '');
    }
  }, [isOpen, currentUrl]);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Le fichier est trop volumineux (maximum 5 Mo).");
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
        title: uploadTitle || uploadFile?.name || 'Image téléversée',
        type: 'IMAGE',
        createdAt: Date.now(),
        authorId: userProfile?.id || 'admin'
      });
      setMediaList(prev => [newMedia, ...prev]);
      onSelect(newMedia.url, newMedia.title);
      onClose();
    } catch (err) {
      console.error("Failed to upload media:", err);
      alert("Erreur lors de l'enregistrement de l'image.");
    } finally {
      setUploading(false);
    }
  };

  const handleCustomUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl) return;
    try {
      const newMedia = await addCMSMedia({
        url: customUrl,
        title: customTitle || 'Image externe',
        type: 'IMAGE',
        createdAt: Date.now(),
        authorId: userProfile?.id || 'admin'
      });
      setMediaList(prev => [newMedia, ...prev]);
      onSelect(customUrl, customTitle);
      onClose();
    } catch {
      onSelect(customUrl, customTitle);
      onClose();
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Voulez-vous supprimer cette ressource de la médiathèque ?")) return;
    try {
      await deleteCMSMedia(id);
      setMediaList(prev => prev.filter(m => m.id !== id));
      if (selectedUrl === mediaList.find(m => m.id === id)?.url) {
        setSelectedUrl('');
      }
    } catch (err) {
      console.error("Failed to delete media:", err);
    }
  };

  if (!isOpen) return null;

  const filteredMedia = mediaList.filter(m => 
    m.title.toLowerCase().includes(search.toLowerCase()) || 
    (m.description && m.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-stone-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E67E22]/10 flex items-center justify-center text-[#E67E22]">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#6B3E1E]">Médiathèque FAFE</h2>
              <p className="text-xs text-stone-500">Sélectionnez ou téléversez une image pour votre contenu</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-[#6B3E1E] rounded-lg hover:bg-stone-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Nav Tabs */}
        <div className="flex items-center justify-between px-6 pt-3 border-b border-stone-200 bg-white">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'gallery'
                  ? 'border-[#E67E22] text-[#E67E22]'
                  : 'border-transparent text-stone-500 hover:text-stone-700'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              Galerie ({mediaList.length})
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'upload'
                  ? 'border-[#E67E22] text-[#E67E22]'
                  : 'border-transparent text-stone-500 hover:text-stone-700'
              }`}
            >
              <Upload className="w-4 h-4" />
              Téléverser un fichier
            </button>
            <button
              onClick={() => setActiveTab('url')}
              className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'url'
                  ? 'border-[#E67E22] text-[#E67E22]'
                  : 'border-transparent text-stone-500 hover:text-stone-700'
              }`}
            >
              <Plus className="w-4 h-4" />
              Lien direct (URL)
            </button>
          </div>

          {activeTab === 'gallery' && (
            <div className="relative w-64 pb-2">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Rechercher une image..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#E67E22]"
              />
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-6 overflow-y-auto min-h-[380px]">
          {activeTab === 'gallery' && (
            loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-stone-400">
                <Loader2 className="w-8 h-8 animate-spin text-[#E67E22] mb-2" />
                <p className="text-sm">Chargement des médias...</p>
              </div>
            ) : filteredMedia.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <ImageIcon className="w-12 h-12 text-stone-300 mb-3" />
                <p className="font-bold text-stone-600">Aucune image trouvée</p>
                <p className="text-xs text-stone-400 mt-1">Téléversez votre première image ou ajustez vos critères de recherche.</p>
                <Button 
                  onClick={() => setActiveTab('upload')}
                  className="mt-4 bg-[#E67E22] hover:bg-[#c96a1a] text-white text-xs"
                >
                  Téléverser une image
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredMedia.map((item) => {
                  const isSelected = selectedUrl === item.url;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedUrl(item.url)}
                      className={`group relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-[#E67E22] ring-2 ring-[#E67E22]/30 shadow-md scale-[1.02]' 
                          : 'border-stone-200 hover:border-stone-400 bg-stone-50'
                      }`}
                    >
                      <div className="aspect-video relative overflow-hidden bg-stone-100">
                        <img 
                          src={item.url} 
                          alt={item.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-[#E67E22] text-white rounded-full flex items-center justify-center shadow-lg">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {!item.id.startsWith('stock-') && (
                          <button
                            onClick={(e) => handleDelete(item.id, e)}
                            className="absolute bottom-2 right-2 p-1.5 bg-red-600/90 hover:bg-red-700 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="p-2.5 bg-white">
                        <p className="text-xs font-bold text-stone-700 truncate" title={item.title}>
                          {item.title}
                        </p>
                        <p className="text-[10px] text-stone-400 truncate">
                          {item.id.startsWith('stock-') ? 'Image par défaut FAFE' : new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {activeTab === 'upload' && (
            <form onSubmit={handleUploadSubmit} className="max-w-lg mx-auto py-4 space-y-5">
              <div className="border-2 border-dashed border-stone-300 hover:border-[#E67E22] rounded-2xl p-8 text-center bg-stone-50/50 hover:bg-orange-50/20 transition-colors">
                {uploadPreview ? (
                  <div className="space-y-4">
                    <img 
                      src={uploadPreview} 
                      alt="Aperçu" 
                      className="max-h-48 mx-auto rounded-xl object-contain shadow-sm border border-stone-200" 
                    />
                    <button
                      type="button"
                      onClick={() => { setUploadFile(null); setUploadPreview(null); }}
                      className="text-xs text-red-600 hover:underline font-bold"
                    >
                      Changer d'image
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-[#E67E22]/10 flex items-center justify-center text-[#E67E22] mb-3">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-stone-700">Cliquez ou glissez une image ici</p>
                    <p className="text-xs text-stone-400 mt-1">PNG, JPG, WebP ou GIF (max. 5 Mo)</p>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange}
                      className="hidden" 
                    />
                  </label>
                )}
              </div>

              {uploadPreview && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-600 mb-1">Titre de l'image</label>
                    <input
                      type="text"
                      value={uploadTitle}
                      onChange={e => setUploadTitle(e.target.value)}
                      placeholder="Ex: Conférence FAFE Abidjan 2025"
                      className="w-full px-3 py-2 text-sm bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67E22]"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={uploading}
                    className="w-full bg-[#E67E22] hover:bg-[#c96a1a] text-white"
                  >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                    Enregistrer et insérer cette image
                  </Button>
                </div>
              )}
            </form>
          )}

          {activeTab === 'url' && (
            <form onSubmit={handleCustomUrlSubmit} className="max-w-lg mx-auto py-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">URL directe de l'image</label>
                <input
                  type="url"
                  value={customUrl}
                  onChange={e => setCustomUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 text-sm bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67E22]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">Titre / Description courte</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={e => setCustomTitle(e.target.value)}
                  placeholder="Ex: Image d'en-tête"
                  className="w-full px-3 py-2 text-sm bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E67E22]"
                />
              </div>
              {customUrl && (
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <p className="text-xs font-bold text-stone-500 mb-2">Aperçu immédiat :</p>
                  <img 
                    src={customUrl} 
                    alt="Aperçu" 
                    className="max-h-40 mx-auto rounded-lg object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-[#E67E22] hover:bg-[#c96a1a] text-white"
              >
                Valider et utiliser cette URL
              </Button>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-stone-200 bg-stone-50">
          <div className="text-xs text-stone-500 truncate max-w-md">
            {selectedUrl ? (
              <span className="flex items-center gap-1.5 text-[#E67E22] font-semibold">
                <Check className="w-3.5 h-3.5 shrink-0" />
                Image prête à être insérée
              </span>
            ) : (
              'Sélectionnez une image pour l\'insérer dans votre champ.'
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="text-stone-600 border-stone-300"
            >
              Annuler
            </Button>
            <Button
              disabled={!selectedUrl}
              onClick={() => {
                onSelect(selectedUrl);
                onClose();
              }}
              className="bg-[#E67E22] hover:bg-[#c96a1a] text-white"
            >
              Insérer l'image sélectionnée
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
