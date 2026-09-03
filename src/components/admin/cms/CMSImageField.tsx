import { FafeImage } from '../../../components/ui/FafeImage';
import { useState } from 'react';
import { Image as ImageIcon, FolderOpen, Link as LinkIcon, Trash2 } from 'lucide-react';
import { Button } from '../../ui/Button';
import { CMSMediaModal } from './CMSMediaModal';

interface CMSImageFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  helperText?: string;
  aspectRatio?: 'landscape' | 'portrait' | 'square';
}

export function CMSImageField({
  label,
  value,
  onChange,
  helperText,
  aspectRatio = 'landscape'
}: CMSImageFieldProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editUrlMode, setEditUrlMode] = useState(false);

  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'portrait': return 'aspect-[3/4] w-32';
      case 'square': return 'aspect-square w-28';
      default: return 'aspect-video w-48';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
          {label}
        </label>
        {helperText && (
          <span className="text-[11px] text-stone-400">{helperText}</span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-start gap-4 p-3 bg-stone-50 rounded-xl border border-stone-200">
        
        {/* Preview Thumbnail */}
        <div className={`relative rounded-lg overflow-hidden bg-stone-200 border border-stone-300 shrink-0 ${getAspectClass()}`}>
          {value ? (
            <FafeImage 
              src={value} 
              alt={label} 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Image+invalide';
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 p-2 text-center">
              <ImageIcon className="w-6 h-6 mb-1" />
              <span className="text-[10px]">Aucune image</span>
            </div>
          )}
        </div>

        {/* Controls & URL */}
        <div className="flex-1 min-w-0 space-y-3 w-full">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => setModalOpen(true)}
              className="bg-[#E67E22] hover:bg-[#c96a1a] text-white text-xs h-8"
            >
              <FolderOpen className="w-3.5 h-3.5 mr-1.5" />
              Choisir dans la Médiathèque
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditUrlMode(!editUrlMode)}
              className="text-stone-600 border-stone-300 text-xs h-8"
            >
              <LinkIcon className="w-3.5 h-3.5 mr-1.5" />
              {editUrlMode ? 'Masquer le lien' : 'Modifier le lien direct'}
            </Button>

            {value && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onChange('')}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-stone-300 text-xs h-8"
                title="Supprimer l'image"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>

          {editUrlMode && (
            <div className="animate-in fade-in duration-150">
              <input
                type="url"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#E67E22]"
              />
            </div>
          )}

          {value && !editUrlMode && (
            <p className="text-[11px] text-stone-400 font-mono truncate max-w-sm">
              {value}
            </p>
          )}
        </div>
      </div>

      <CMSMediaModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={(url) => onChange(url)}
        currentUrl={value}
      />
    </div>
  );
}
