import React from 'react';

interface FafeLogoProps {
  variant?: 'light' | 'dark' | 'symbol-only';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showSubtitle?: boolean;
  chapter?: string;
}

export function FafeOfficialEmblem({ 
  className = 'w-10 h-10',
  isLight = false 
}: { 
  className?: string; 
  isLight?: boolean;
}) {
  return (
    <svg 
      viewBox="0 0 500 500" 
      className={`${className} select-none drop-shadow-xs shrink-0`}
      aria-hidden="true"
    >
      {/* Outer Circular Border */}
      <circle 
        cx="250" 
        cy="250" 
        r="242" 
        fill={isLight ? '#FFFFFF' : '#FFFFFF'} 
        stroke={isLight ? '#D4AF37' : '#6B3E1E'} 
        strokeWidth="4"
      />

      {/* Top Pan-African / Cameroon Swirls / Crown Ribbons */}
      {/* 1. Green dynamic swirl (North-West) */}
      <path 
        d="M 158 78 C 122 96, 92 135, 96 178 C 98 198, 108 215, 122 228 C 114 210, 108 185, 114 158 C 122 120, 148 95, 185 82 Z" 
        fill="#00843D" 
      />
      
      {/* 2. Red dynamic wave (North) */}
      <path 
        d="M 185 78 C 210 70, 240 68, 275 88 C 290 96, 305 88, 320 80 C 295 98, 268 98, 245 88 C 218 78, 198 82, 175 88 Z" 
        fill="#D8232A" 
      />
      
      {/* 3. Yellow/Gold energetic sweep (North-East / Horn) */}
      <path 
        d="M 324 88 C 330 115, 335 140, 350 162 C 368 188, 395 202, 402 200 C 378 195, 355 178, 342 152 C 332 132, 330 110, 324 88 Z" 
        fill="#FCD116" 
      />

      {/* African Continent Outline */}
      <path 
        d="M 350 162 
           C 370 175, 410 205, 395 240 
           C 380 270, 345 295, 360 330 
           C 370 350, 405 365, 406 372 
           C 385 382, 338 410, 326 440 
           C 300 470, 245 490, 235 488 
           C 220 485, 208 450, 212 410 
           C 215 375, 195 340, 192 322 
           C 188 300, 215 300, 250 290
           C 290 280, 310 250, 310 215" 
        fill="none" 
        stroke="#6B3E1E" 
        strokeWidth="4.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />

      {/* African Woman Silhouette Profile with Headdress / Turban in Rich Warm Brown */}
      <g fill="#6B3E1E">
        {/* Turban headdress */}
        <path 
          d="M 136 142 
             C 155 110, 200 95, 225 125 
             C 248 152, 230 185, 222 205 
             C 215 220, 208 238, 206 255 
             C 188 235, 175 225, 162 205 
             C 152 188, 142 165, 136 142 Z" 
        />
        <path d="M 160 148 C 185 130, 215 135, 235 155 C 220 165, 190 160, 160 148 Z" fill="#522E14" opacity="0.35" />
        <path d="M 148 180 C 172 165, 200 170, 218 188 C 200 195, 175 192, 148 180 Z" fill="#522E14" opacity="0.35" />

        {/* Woman Profile (Forehead, Nose, Lips, Chin, Neck & Collarbone) */}
        <path 
          d="M 162 205 
             C 142 208, 132 215, 130 224 
             C 128 227, 126 230, 122 232
             C 125 235, 126 238, 123 243 
             C 124 247, 128 249, 125 254 
             C 127 257, 132 260, 135 264 
             C 140 270, 155 285, 160 300 
             C 165 315, 155 335, 145 352 
             C 165 348, 185 330, 195 305 
             C 205 280, 206 255, 206 255 
             C 190 235, 175 225, 162 205 Z" 
        />
      </g>

      {/* Typography: FAFE and Forum Africain des Femmes Entrepreneures */}
      <g fill="#6B3E1E">
        <text 
          x="225" 
          y="275" 
          fontSize="76" 
          fontWeight="900" 
          letterSpacing="4" 
          fontFamily="'Playfair Display', Georgia, serif"
        >
          FAFE
        </text>
        <text x="225" y="306" fontSize="21" fontWeight="800" letterSpacing="0.5" fontFamily="'Plus Jakarta Sans', Arial, sans-serif">Forum Africain</text>
        <text x="225" y="332" fontSize="21" fontWeight="800" letterSpacing="0.5" fontFamily="'Plus Jakarta Sans', Arial, sans-serif">des Femmes</text>
        <text x="225" y="358" fontSize="21" fontWeight="800" letterSpacing="0.5" fontFamily="'Plus Jakarta Sans', Arial, sans-serif">Entrepreneures</text>
      </g>

      {/* Bottom Chapter signature: CAMEROON (with Golden Star) */}
      <g fontFamily="'Plus Jakarta Sans', Arial, sans-serif" fontWeight="900" fontSize="48" letterSpacing="6">
        <text x="100" y="445" fill="#00843D">CA</text>
        <text x="222" y="445" fill="#D8232A">M</text>
        <polygon points="239,425 242,433 250,433 244,438 246,446 239,441 232,446 234,438 228,433 236,433" fill="#FCD116" />
        <text x="272" y="445" fill="#D8232A">E</text>
        <text x="312" y="445" fill="#FCD116">ROON</text>
      </g>
    </svg>
  );
}

export function FafeLogo({
  variant = 'dark',
  size = 'md',
  className = '',
  showSubtitle = true,
  chapter,
}: FafeLogoProps) {
  // Dimensions for emblem and text pairing
  const sizeDimensions = {
    sm: { symbol: 'w-9 h-9', text: 'text-lg', sub: 'text-[8px]', gap: 'gap-2.5' },
    md: { symbol: 'w-11 h-11', text: 'text-xl', sub: 'text-[9.5px]', gap: 'gap-3' },
    lg: { symbol: 'w-14 h-14', text: 'text-2xl', sub: 'text-[11px]', gap: 'gap-3.5' },
    xl: { symbol: 'w-20 h-20', text: 'text-3xl', sub: 'text-xs', gap: 'gap-4' },
  };

  const dim = sizeDimensions[size];
  const isLight = variant === 'light';

  return (
    <div className={`inline-flex items-center ${dim.gap} select-none ${className}`}>
      {/* Official Emblem Symbol */}
      <FafeOfficialEmblem 
        className={`${dim.symbol} transition-transform duration-300 hover:scale-105`} 
        isLight={isLight} 
      />

      {/* Typography side */}
      {variant !== 'symbol-only' && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className={`font-heading font-extrabold tracking-tight ${
                isLight ? 'text-white' : 'text-[#6B3E1E]'
              } ${dim.text}`}
            >
              FAFE
            </span>
            {chapter && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#E67E22]/20 text-[#E67E22] uppercase tracking-wider">
                {chapter}
              </span>
            )}
          </div>
          {showSubtitle && (
            <span
              className={`uppercase font-bold tracking-widest leading-tight mt-0.5 ${
                isLight ? 'text-[#D4AF37]' : 'text-[#6B3E1E]/75'
              } ${dim.sub}`}
            >
              Forum Africain des Femmes Entrepreneures
            </span>
          )}
        </div>
      )}
    </div>
  );
}
