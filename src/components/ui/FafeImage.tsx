import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';

interface FafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackType?: 'person' | 'project' | 'article' | 'logo' | 'general';
}

export function FafeImage({ src, alt, className, fallbackType = 'general', ...props }: FafeImageProps) {
  const [error, setError] = useState(false);

  // If no source is provided at all, immediately show fallback
  if (!src || error) {
    return (
      <div className={`flex flex-col items-center justify-center bg-stone-100 text-stone-400 ${className}`} {...(props as any)}>
        <ImageOff className="w-8 h-8 opacity-50 mb-2" />
        <span className="text-xs font-medium uppercase tracking-wider opacity-60">
          {fallbackType === 'person' ? 'Profil non disponible' : 
           fallbackType === 'article' ? 'Image non disponible' : 
           fallbackType === 'project' ? 'Projet non disponible' : 'Média non disponible'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || "Image FAFE"}
      className={className}
      onError={() => setError(true)}
      {...props}
    />
  );
}
