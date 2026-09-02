import React, { useState, useEffect } from 'react';

interface FafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackType?: 'person' | 'project' | 'article' | 'logo' | 'general';
  aspectRatio?: string;
  priority?: boolean;
}

export function FafeImage({
  src,
  alt = 'Image FAFE',
  className = '',
  fallbackType = 'general',
  aspectRatio,
  priority = false,
  ...props
}: FafeImageProps) {
  const [error, setError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Reset states if src changes
  useEffect(() => {
    setError(false);
    setIsLoaded(false);
  }, [src]);

  // If no source is provided at all, or failed to load
  if (!src || error) {
    const fallbackLabels: Record<string, string> = {
      person: 'Entrepreneure FAFE',
      article: 'Actualité FAFE',
      project: 'Projet Panafricain',
      logo: 'FAFE',
      general: 'FAFE Panafricaine',
    };

    return (
      <div
        className={`relative flex flex-col items-center justify-center bg-gradient-to-br from-[#FAF9F6] to-stone-200/80 text-[#6B3E1E] overflow-hidden select-none ${className}`}
        style={aspectRatio ? { aspectRatio } : undefined}
      >
        {/* Subtle patterned background */}
        <div className="absolute inset-0 bg-[#E67E22]/5 mix-blend-multiply" />
        
        {/* Subtle FAFE Monogram */}
        <div className="relative z-10 w-12 h-12 rounded-full bg-[#E67E22]/15 text-[#E67E22] flex items-center justify-center font-bold text-xl ring-1 ring-[#D4AF37]/30 mb-1.5 shadow-sm">
          <span>F</span>
        </div>
        <span className="relative z-10 text-[10px] uppercase font-bold tracking-wider text-[#6B3E1E]/60 text-center px-2">
          {fallbackLabels[fallbackType] || 'FAFE'}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden bg-stone-100 ${className}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {/* Skeleton Shimmer while loading */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-stone-100 via-stone-200 to-stone-100 animate-pulse" />
      )}

      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        {...props}
      />
    </div>
  );
}
