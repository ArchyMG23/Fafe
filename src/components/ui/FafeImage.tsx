import React, { useState, useEffect } from 'react';

const DEFAULT_PERSON_FALLBACK = 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=800';

interface FafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackType?: 'person' | 'project' | 'article' | 'logo' | 'general';
  fallbackSrc?: string;
  aspectRatio?: string;
  priority?: boolean;
  imageClassName?: string;
  objectPosition?: string;
}

export function FafeImage({
  src,
  alt = 'Image FAFE',
  className = '',
  imageClassName = '',
  fallbackType = 'general',
  fallbackSrc,
  aspectRatio,
  priority = false,
  objectPosition,
  style,
  ...props
}: FafeImageProps) {
  const effectiveFallback = fallbackSrc || (fallbackType === 'person' ? DEFAULT_PERSON_FALLBACK : undefined);
  const initialSrc = src?.trim() || effectiveFallback || '';

  const [currentSrc, setCurrentSrc] = useState<string>(initialSrc);
  const [triedFallback, setTriedFallback] = useState(false);
  const [error, setError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  // Check if image is already cached or loaded in DOM
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [currentSrc]);

  // Only reset states if the URL actually changes
  useEffect(() => {
    const newSrc = src?.trim() || effectiveFallback || '';
    if (newSrc !== currentSrc) {
      setCurrentSrc(newSrc);
      setTriedFallback(false);
      setError(false);
      setIsLoaded(false);
    }
  }, [src, effectiveFallback, currentSrc]);

  const handleImgError = () => {
    if (effectiveFallback && currentSrc !== effectiveFallback && !triedFallback) {
      setTriedFallback(true);
      setCurrentSrc(effectiveFallback);
      setIsLoaded(false);
    } else {
      setError(true);
    }
  };

  // If no source is provided at all, or failed to load
  if (!currentSrc || error) {
    const fallbackLabels: Record<string, string> = {
      person: 'Entrepreneure FAFE',
      article: 'Actualité FAFE',
      project: 'Projet Panafricain',
      logo: 'FAFE',
      general: 'FAFE Panafricaine',
    };

    return (
      <div
        className={`relative flex flex-col items-center justify-center bg-gradient-to-br from-[#FAF9F6] to-stone-200/80 text-[#063F3A] overflow-hidden select-none ${className}`}
        style={aspectRatio ? { aspectRatio } : undefined}
      >
        {/* Subtle patterned background */}
        <div className="absolute inset-0 bg-[#C8102E]/5 mix-blend-multiply" />
        
        {/* Subtle FAFE Monogram */}
        <div className="relative z-10 w-12 h-12 rounded-full bg-[#C8102E]/15 text-[#00843D] flex items-center justify-center font-bold text-xl ring-1 ring-[#D4AF37]/30 mb-1.5 shadow-sm">
          <span>F</span>
        </div>
        <span className="relative z-10 text-[10px] uppercase font-bold tracking-wider text-[#063F3A]/60 text-center px-2">
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
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoaded(true)}
        onError={handleImgError}
        style={{
          objectPosition: objectPosition || (fallbackType === 'person' ? '50% 10%' : undefined),
          ...style,
        }}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${imageClassName}`}
        {...props}
      />
    </div>
  );
}
