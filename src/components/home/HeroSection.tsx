import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Globe, ArrowRight } from "lucide-react";
import { Button } from "../ui/Button";
import { useLanguageStore } from "../../store/language";
import { getCMSLocalizedText } from "../../lib/cms";

interface HeroSectionProps {
  hero?: any;
  pcaHero?: {
    pcaName?: string;
    pcaTitle?: any;
    pcaPhoto?: string;
  };
}

const OFFICIAL_PCA_PHOTO = "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=800";

export function HeroSection({ hero, pcaHero }: HeroSectionProps) {
  const [heroImageError, setHeroImageError] = useState(false);
  const { language } = useLanguageStore();

  const rawPcaPhoto = pcaHero?.pcaPhoto?.trim() || "";
  const initialPhoto = rawPcaPhoto || OFFICIAL_PCA_PHOTO;
  const [activePhoto, setActivePhoto] = useState(initialPhoto);

  const pcaName = pcaHero?.pcaName?.trim() || "Présidence du Conseil d'Administration";
  const pcaTitleText = getCMSLocalizedText(
    pcaHero?.pcaTitle,
    language,
    language === "fr"
      ? "Présidente du Conseil d'Administration"
      : "President of the Board of Directors"
  );

  useEffect(() => {
    setActivePhoto(rawPcaPhoto || OFFICIAL_PCA_PHOTO);
    setHeroImageError(false);
  }, [rawPcaPhoto]);

  const handleHeroImgError = () => {
    if (activePhoto !== OFFICIAL_PCA_PHOTO) {
      setActivePhoto(OFFICIAL_PCA_PHOTO);
    } else {
      setHeroImageError(true);
    }
  };

  // CMS Content
  const badgeText = getCMSLocalizedText(
    hero?.badge,
    language,
    language === "fr" ? "Réseau Panafricain" : "Pan-African Network"
  );
  const titleText = getCMSLocalizedText(
    hero?.title,
    language,
    language === "fr"
      ? "Fédération des Associations de Femmes Entrepreneures d'Afrique"
      : "Federation of African Women Entrepreneurs Associations"
  );
  const shortText = getCMSLocalizedText(
    hero?.shortText,
    language,
    language === "fr"
      ? "Bâtir la souveraineté économique du continent en propulsant l'excellence et le leadership de la femme africaine."
      : "Building the continent's economic sovereignty by championing the excellence and leadership of African women."
  );

  const button1Text = getCMSLocalizedText(
    hero?.buttonText,
    language,
    language === "fr" ? "Rejoindre le réseau" : "Join the network"
  );
  const button1Link = hero?.buttonLink || "/rejoindre";

  const button2Text = getCMSLocalizedText(
    hero?.secondaryButtonText,
    language,
    language === "fr" ? "Découvrir le FAFE" : "Discover FAFE"
  );
  const button2Link = hero?.secondaryButtonLink || "/nous";

  const pastilleText = button2Text || (language === "fr" ? "Découvrir le FAFE" : "Discover FAFE");

  const hasPcaPhoto = Boolean(activePhoto && !heroImageError);

  return (
    <section
      id="hero-section"
      className="relative isolate overflow-x-clip w-full min-h-[calc(100dvh-88px)] md:min-h-[calc(100dvh-96px)] pt-[88px] md:pt-[96px] pb-8 lg:pb-12 flex flex-col justify-center bg-gradient-to-b from-[#FAF9F6] via-[#F4F6F2] to-[#EBF3ED]"
    >
      {/* 1. LAYERED BACKGROUND: 3 DRIFTING BLURRED BLOBS (GREEN, GOLD, RED) */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden select-none -z-20"
        aria-hidden="true"
      >
        {/* Shape 1: Deep Emerald Green (#00843D) */}
        <div className="absolute -top-[10%] -left-[5%] w-[260px] h-[260px] sm:w-[420px] sm:h-[420px] lg:w-[620px] lg:h-[620px] rounded-full bg-[#00843D] opacity-[0.07] sm:opacity-[0.09] lg:opacity-[0.11] blur-3xl animate-hero-green" />

        {/* Shape 2: African Gold (#D4AF37) */}
        <div className="absolute top-[25%] right-[-8%] w-[240px] h-[240px] sm:w-[380px] sm:h-[380px] lg:w-[560px] lg:h-[560px] rounded-full bg-[#D4AF37] opacity-[0.08] sm:opacity-[0.10] lg:opacity-[0.12] blur-3xl animate-hero-gold" />

        {/* Shape 3: Pan-African Crimson Red (#C8102E) */}
        <div className="absolute -bottom-[12%] left-[30%] w-[220px] h-[220px] sm:w-[360px] sm:h-[360px] lg:w-[500px] lg:h-[500px] rounded-full bg-[#C8102E] opacity-[0.05] sm:opacity-[0.07] lg:opacity-[0.08] blur-3xl animate-hero-red" />
      </div>

      {/* 2. LAYERED BACKGROUND: GEOMETRIC AFRICAN TEXTILE PATTERN IN SVG */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none -z-10 opacity-[0.06] sm:opacity-[0.07] lg:opacity-[0.08]"
        aria-hidden="true"
        style={{
          maskImage:
            "radial-gradient(ellipse 70% 70% at 30% 50%, transparent 20%, black 85%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 70% at 30% 50%, transparent 20%, black 85%)",
        }}
      >
        <defs>
          <pattern
            id="african-geo-textile"
            width="72"
            height="72"
            patternUnits="userSpaceOnUse"
          >
            {/* Outer Diamond */}
            <polygon
              points="36,4 68,36 36,68 4,36"
              fill="none"
              stroke="#063F3A"
              strokeWidth="1.4"
            />
            {/* Inner Diamond */}
            <polygon
              points="36,14 58,36 36,58 14,36"
              fill="none"
              stroke="#D4AF37"
              strokeWidth="1.1"
            />
            {/* Center Core Diamond with Gold Accent */}
            <polygon
              points="36,25 47,36 36,47 25,36"
              fill="#00843D"
              fillOpacity="0.28"
              stroke="#00843D"
              strokeWidth="0.8"
            />
            {/* Triangular Chevron Corner Accents */}
            <polygon points="0,0 18,0 0,18" fill="#063F3A" fillOpacity="0.3" />
            <polygon points="72,0 54,0 72,18" fill="#063F3A" fillOpacity="0.3" />
            <polygon points="0,72 18,72 0,54" fill="#063F3A" fillOpacity="0.3" />
            <polygon points="72,72 54,72 72,54" fill="#063F3A" fillOpacity="0.3" />
            {/* Grid Interlocking Diamonds */}
            <polygon points="36,0 39,3 36,6 33,3" fill="#C8102E" fillOpacity="0.45" />
            <polygon points="0,36 3,39 6,36 3,33" fill="#C8102E" fillOpacity="0.45" />
            <polygon points="72,36 69,39 66,36 69,33" fill="#C8102E" fillOpacity="0.45" />
            <polygon points="36,72 39,69 36,66 33,69" fill="#C8102E" fillOpacity="0.45" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#african-geo-textile)" />
      </svg>

      {/* 3. MAIN HERO CONTENT */}
      <div className="w-full max-w-[1600px] mx-auto px-[clamp(1rem,4vw,4rem)] my-auto relative z-10">
        <div
          className={`grid ${
            hasPcaPhoto
              ? "grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-8 sm:gap-10 lg:gap-12 xl:gap-16 items-center"
              : "grid-cols-1 max-w-4xl mx-auto text-center items-center"
          }`}
        >
          {/* Left Column: Institutional Pitch & Action */}
          <div
            className={`w-full flex flex-col ${
              hasPcaPhoto ? "items-start text-left" : "items-center text-center"
            } space-y-4 sm:space-y-5 lg:space-y-6`}
          >
            {/* Pan-African Network Badge */}
            <div
              id="hero-badge"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-[#00843D]/25 text-[#00843D] text-xs sm:text-sm font-bold tracking-wide uppercase shadow-sm"
            >
              <Globe className="w-4 h-4 text-[#00843D] shrink-0" aria-hidden="true" />
              <span>{badgeText}</span>
            </div>

            {/* Main Headline */}
            <h1
              id="hero-title"
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] xl:text-[3.75rem] font-bold font-heading text-[#063F3A] leading-[1.14] tracking-tight"
            >
              {titleText}
            </h1>

            {/* Sub-text / Institutional Description */}
            <p
              id="hero-short-text"
              className={`text-base sm:text-lg md:text-xl text-[#063F3A]/80 leading-relaxed font-normal ${
                hasPcaPhoto ? "max-w-2xl" : "max-w-3xl"
              }`}
            >
              {shortText}
            </p>

            {/* CTA Buttons */}
            <div
              id="hero-cta-buttons"
              className={`pt-2 flex flex-col sm:flex-row items-stretch sm:items-center ${
                hasPcaPhoto ? "justify-start" : "justify-center"
              } gap-3.5 w-full sm:w-auto`}
            >
              <Link to={button1Link} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-[#00843D] hover:bg-[#007033] text-white font-bold shadow-lg shadow-[#00843D]/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 rounded-xl h-12 sm:h-13 px-6 sm:px-8 text-sm sm:text-base group"
                >
                  <span>{button1Text}</span>
                  <ArrowRight
                    className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Button>
              </Link>
              <Link to={button2Link} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-[#063F3A]/20 hover:border-[#00843D] text-[#063F3A] hover:text-[#00843D] font-bold bg-white/80 backdrop-blur-sm rounded-xl h-12 sm:h-13 px-6 sm:px-8 text-sm sm:text-base transition-all duration-300"
                >
                  {button2Text}
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: PCA Photo Card (Only if pcaPhoto is provided) */}
          {hasPcaPhoto && (
            <div className="w-full flex justify-center lg:justify-end">
              <Link
                to="/nous"
                id="hero-pca-card"
                aria-label={`${pcaName ? pcaName + " — " : ""}${
                  pcaTitleText ? pcaTitleText + " — " : ""
                }${pastilleText}`}
                className="group relative block w-full max-w-md lg:max-w-none aspect-[4/5] h-auto max-h-[60dvh] lg:h-[min(72dvh,760px)] lg:max-h-none rounded-3xl md:rounded-[2rem] overflow-hidden shadow-2xl shadow-[#063F3A]/20 border border-white/50 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#00843D] focus-visible:ring-offset-2 transition-all duration-300"
              >
                {/* PCA Photo */}
                <img
                  src={activePhoto}
                  alt={pcaName || "Présidente du Conseil d'Administration FAFE"}
                  className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                  onError={handleHeroImgError}
                  loading="eager"
                  referrerPolicy="no-referrer"
                />

                {/* Gradient sombre: de transparent vers noir à 70 % */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent pointer-events-none"
                  aria-hidden="true"
                />

                {/* Overlaid PCA Content */}
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 md:p-8 flex flex-col items-start gap-1.5 sm:gap-2 z-10">
                  {pcaName && (
                    <h3 className="text-white font-bold font-heading text-xl sm:text-2xl lg:text-3xl leading-tight drop-shadow-md">
                      {pcaName}
                    </h3>
                  )}
                  {pcaTitleText && (
                    <p className="text-white/85 text-xs sm:text-sm md:text-base font-medium leading-snug drop-shadow-sm">
                      {pcaTitleText}
                    </p>
                  )}
                  <div className="mt-2 inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs sm:text-sm font-semibold border border-white/30 shadow-md transition-colors duration-300">
                    <span>{pastilleText}</span>
                    <ArrowRight
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white transition-transform duration-300 group-hover:translate-x-1.5"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
