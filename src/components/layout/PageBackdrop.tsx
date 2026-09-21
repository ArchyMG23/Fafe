import React from 'react';

export type BackdropTone = 'home' | 'about' | 'news' | 'shop' | 'give' | 'none';

interface PageBackdropProps {
  tone?: BackdropTone;
}

interface ToneConfig {
  baseGradient: string;
  halo1Bg: string;
  halo2Bg?: string;
  patternSvg: string;
  patternOpacity: number;
}

const TONE_CONFIGS: Record<Exclude<BackdropTone, 'none'>, ToneConfig> = {
  // home : vert #00843D + or #D4AF37 + un peu de rouge #C8102E, motif à 5 %
  home: {
    baseGradient: 'bg-gradient-to-b from-[#FAF9F6] via-[#F4F6F2] to-[#EBF3ED]',
    halo1Bg:
      'radial-gradient(circle at center, rgba(0, 132, 61, 0.12) 0%, rgba(0, 132, 61, 0.04) 45%, transparent 70%)',
    halo2Bg:
      'radial-gradient(circle at center, rgba(212, 175, 55, 0.11) 0%, rgba(200, 16, 46, 0.04) 45%, transparent 70%)',
    patternSvg: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Cpolygon points='32,4 60,32 32,60 4,32' fill='none' stroke='%2300843D' stroke-width='1.2'/%3E%3Cpolygon points='32,16 48,32 32,48 16,32' fill='none' stroke='%23D4AF37' stroke-width='1'/%3E%3Cpolygon points='32,24 40,32 32,40 24,32' fill='%23C8102E' fill-opacity='0.5'/%3E%3C/svg%3E`,
    patternOpacity: 0.05,
  },

  // about : or et beige chaud, motif losanges à 6 %
  about: {
    baseGradient: 'bg-gradient-to-b from-[#FAF8F5] via-[#F7F3EC] to-[#F3EEE3]',
    halo1Bg:
      'radial-gradient(circle at center, rgba(212, 175, 55, 0.14) 0%, rgba(212, 175, 55, 0.04) 45%, transparent 70%)',
    halo2Bg:
      'radial-gradient(circle at center, rgba(198, 146, 20, 0.10) 0%, rgba(212, 175, 55, 0.03) 45%, transparent 70%)',
    patternSvg: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'%3E%3Cpolygon points='28,4 52,28 28,52 4,28' fill='none' stroke='%23D4AF37' stroke-width='1.3'/%3E%3Cpolygon points='28,14 42,28 28,42 14,28' fill='none' stroke='%23063F3A' stroke-width='0.9'/%3E%3Cpolygon points='28,22 34,28 28,34 22,28' fill='%23D4AF37' fill-opacity='0.4'/%3E%3C/svg%3E`,
    patternOpacity: 0.06,
  },

  // news : vert menthe, motif en ondes à 4 %
  news: {
    baseGradient: 'bg-gradient-to-b from-[#F7FAF8] via-[#F0F6F2] to-[#E9F3ED]',
    halo1Bg:
      'radial-gradient(circle at center, rgba(5, 150, 105, 0.12) 0%, rgba(16, 185, 129, 0.03) 45%, transparent 70%)',
    halo2Bg:
      'radial-gradient(circle at center, rgba(16, 185, 129, 0.10) 0%, transparent 65%)',
    patternSvg: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='32' viewBox='0 0 64 32'%3E%3Cpath d='M0,16 L16,0 L32,16 L48,0 L64,16 L48,32 L32,16 L16,32 Z' fill='none' stroke='%23059669' stroke-width='1.1'/%3E%3Ccircle cx='32' cy='16' r='2' fill='%23059669' fill-opacity='0.5'/%3E%3C/svg%3E`,
    patternOpacity: 0.04,
  },

  // shop : crème presque neutre, un seul halo très faible, motif à 2 %
  shop: {
    baseGradient: 'bg-gradient-to-b from-[#FAFAF8] via-[#F7F7F4] to-[#F5F5F0]',
    halo1Bg:
      'radial-gradient(circle at center, rgba(212, 175, 55, 0.06) 0%, transparent 65%)',
    halo2Bg: undefined,
    patternSvg: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 36 36'%3E%3Cpolygon points='18,4 32,18 18,32 4,18' fill='none' stroke='%23B8A88E' stroke-width='0.8'/%3E%3C/svg%3E`,
    patternOpacity: 0.02,
  },

  // give : rouge tendre et or, motif à 4 %
  give: {
    baseGradient: 'bg-gradient-to-b from-[#FDF8F8] via-[#FAF1F2] to-[#F7EBEB]',
    halo1Bg:
      'radial-gradient(circle at center, rgba(200, 16, 46, 0.08) 0%, rgba(200, 16, 46, 0.02) 45%, transparent 70%)',
    halo2Bg:
      'radial-gradient(circle at center, rgba(212, 175, 55, 0.09) 0%, transparent 65%)',
    patternSvg: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='52' height='52' viewBox='0 0 52 52'%3E%3Cpolygon points='26,4 48,26 26,48 4,26' fill='none' stroke='%23C8102E' stroke-width='1.1'/%3E%3Cpolygon points='26,14 38,26 26,38 14,26' fill='none' stroke='%23D4AF37' stroke-width='0.9'/%3E%3Ccircle cx='26' cy='26' r='2.5' fill='%23D4AF37'/%3E%3C/svg%3E`,
    patternOpacity: 0.04,
  },
};

export function PageBackdrop({ tone = 'none' }: PageBackdropProps) {
  if (!tone || tone === 'none') {
    return null;
  }

  const config = TONE_CONFIGS[tone];
  if (!config) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -10,
        pointerEvents: 'none',
        contain: 'paint',
      }}
      className={`w-full h-full select-none overflow-hidden ${config.baseGradient}`}
    >
      {/* Halo 1: Top-Left drifting halo (single on mobile, animated on md+) */}
      <div
        className="absolute -top-[12%] -left-[6%] w-[60vw] h-[60vw] max-w-[820px] max-h-[820px] rounded-full animate-backdrop-halo-1 pointer-events-none select-none"
        style={{ background: config.halo1Bg }}
      />

      {/* Halo 2: Bottom-Right drifting halo (hidden on mobile < md, only shown on md+) */}
      {config.halo2Bg && (
        <div
          className="absolute -bottom-[12%] -right-[6%] w-[55vw] h-[55vw] max-w-[760px] max-h-[760px] rounded-full animate-backdrop-halo-2 pointer-events-none select-none hidden md:block"
          style={{ background: config.halo2Bg }}
        />
      )}

      {/* African Geometric Pattern in SVG data-URI, masked with radial gradient */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none select-none"
        style={{
          backgroundImage: `url("${config.patternSvg}")`,
          backgroundRepeat: 'repeat',
          opacity: config.patternOpacity,
          maskImage:
            'radial-gradient(ellipse 80% 80% at 50% 50%, black 25%, transparent 85%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 80% at 50% 50%, black 25%, transparent 85%)',
        }}
      />
    </div>
  );
}
