const fs = require('fs');

let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// We need to fetch CMS data inside Home component
const importToInject = `import { useLanguageStore } from '../store/language';
import { getCMSGlobal, defaultHeroSlides } from '../lib/cms';
import { CMSHeroSlide } from '../types';`;

content = content.replace("import { ArrowRight", `${importToInject}\nimport { ArrowRight`);

// Replace HeroSpotlight with CMSHeroSpotlight and Hero Content
// Actually, let's inject a new component `CMSHero` above `Home` and replace the Hero section.
// No, let's just make Home fetch it.

const cmsHeroCode = `
function DynamicHeroSection() {
  const [slides, setSlides] = useState<CMSHeroSlide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { language, tl } = useLanguageStore();

  useEffect(() => {
    const loadCMS = async () => {
      const data = await getCMSGlobal();
      if (data && data.heroSlides && data.heroSlides.length > 0) {
        const activeSlides = data.heroSlides.filter((s: any) => s.status === 'ACTIVE').sort((a: any, b: any) => a.order - b.order);
        setSlides(activeSlides.length > 0 ? activeSlides : defaultHeroSlides);
      } else {
        setSlides(defaultHeroSlides);
      }
    };
    loadCMS();
  }, []);

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 30000);
    return () => clearInterval(interval);
  }, [slides.length, isPaused]);

  // Handle visibility pause
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPaused(true);
      } else {
        setIsPaused(false);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  if (slides.length === 0) return null;

  const slide = slides[currentIndex];

  return (
    <section 
      className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden bg-[#FAF9F6]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[60%] rounded-full bg-[#E67E22] opacity-5 blur-[100px] transition-all duration-1000"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[50%] rounded-full bg-[#D4AF37] opacity-10 blur-[80px] transition-all duration-1000"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Text content */}
          <div className="max-w-xl mx-auto lg:mx-0 text-center lg:text-left transition-opacity duration-1000" key={\`text-\${currentIndex}\`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E67E22]/20 text-[#E67E22] text-sm font-bold tracking-wide uppercase mb-8 shadow-sm">
              <Globe2 className="w-4 h-4" />
              {language === 'fr' ? 'Réseau Panafricain' : 'Pan-African Network'}
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-[#6B3E1E] leading-tight mb-6 animate-fade-in-up">
              {tl(slide.title)}
            </h1>
            
            <p className="text-lg md:text-xl text-stone-600 mb-10 leading-relaxed animate-fade-in-up animation-delay-100">
              {tl(slide.shortText)}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-fade-in-up animation-delay-200">
              <Link to={slide.link || "/rejoindre"}>
                <Button size="lg" className="bg-[#E67E22] hover:bg-[#c96a1a] text-white rounded-full px-8 py-6 font-bold text-lg shadow-lg shadow-[#E67E22]/20 hover:scale-105 transition-all">
                  {tl(slide.buttonText)}
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: Spotlight Image */}
          <div className="w-full max-w-sm mx-auto lg:ml-auto transition-opacity duration-1000" key={\`img-\${currentIndex}\`}>
            <div className="relative w-full">
              {/* Plaque 1 : Photo en arrière-plan */}
              <div className="absolute top-0 right-0 w-full h-[320px] rounded-3xl overflow-hidden shadow-lg animate-fade-in">
                <img 
                  src={slide.image} 
                  alt={tl(slide.title)} 
                  className="w-full h-full object-cover transition-transform duration-[30s] hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#6B3E1E]/80 via-transparent to-transparent"></div>
              </div>
              
              {/* Plaque 2 : Encart superposé (Décalé) */}
              <div className="relative z-10 pt-[240px] pr-[10%] pl-[-10%] animate-fade-in-up">
                <div className="bg-white p-6 rounded-2xl shadow-xl border border-stone-100 transform -translate-x-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-2 h-2 rounded-full bg-[#E67E22] animate-pulse"></span>
                    <span className="text-xs font-bold text-[#E67E22] uppercase tracking-wider">À la une</span>
                  </div>
                  <h3 className="font-bold font-heading text-[#6B3E1E] text-xl mb-1 line-clamp-2">
                    {tl(slide.title)}
                  </h3>
                  <div className="mt-4 flex items-center justify-between">
                    <Link to={slide.link || "/rejoindre"} className="text-sm font-bold text-[#D4AF37] hover:text-[#6B3E1E] transition-colors flex items-center gap-1 group">
                      {language === 'fr' ? 'Découvrir' : 'Discover'} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Slider Controls (Dots) */}
              {slides.length > 1 && (
                <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-2">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIndex(i)}
                      className={\`w-2 h-2 rounded-full transition-all \${i === currentIndex ? 'bg-[#E67E22] w-6' : 'bg-stone-300'}\`}
                      aria-label={\`Slide \${i + 1}\`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
`;

content = content.replace("function HeroSpotlight() {", cmsHeroCode + "\n\nfunction HeroSpotlight() {");

// Replace the Hero section in Home component
const heroRegex = /\{\/\* 1\. HERO SECTION \*\/\}.*?\{\/\* 2\. STATISTICS SECTION \*\/\}/s;
content = content.replace(heroRegex, "{/* 1. HERO SECTION */}\n      <DynamicHeroSection />\n\n      {/* 2. STATISTICS SECTION */}");

fs.writeFileSync('src/pages/Home.tsx', content);
