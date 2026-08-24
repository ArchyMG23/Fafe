const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const heroRegex = /function DynamicHeroSection\(\) \{[\s\S]*?\}\n\nfunction DynamicNews/m;

const originalHero = `function DynamicHeroSection() {
  const [slides, setSlides] = useState<CMSHeroSlide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { language, tl } = useLanguageStore();

  useEffect(() => {
    const loadCMS = async () => {
      const data = await getCMSGlobal();
      if (data && data.heroSlides && data.heroSlides.length > 0) {
        const activeSlides = data.heroSlides.filter((s: any) => s.status === 'ACTIVE').sort((a: any, b: any) => a.order - b.order);
        if (activeSlides.length > 0) {
          setSlides(activeSlides);
          setCurrentIndex(Math.floor(Math.random() * activeSlides.length));
        } else {
          setSlides(defaultHeroSlides);
        }
      } else {
        setSlides(defaultHeroSlides);
      }
    };
    loadCMS();
  }, []);

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

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 25000); // 25 seconds
    return () => clearInterval(interval);
  }, [slides.length, isPaused]);

  // Preload next image
  useEffect(() => {
    if (slides.length > 1) {
      const nextIndex = (currentIndex + 1) % slides.length;
      const img = new Image();
      img.src = slides[nextIndex].image;
    }
  }, [currentIndex, slides]);

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

          {/* Right Column: Image */}
          <div className="relative mx-auto lg:mx-0 max-w-md lg:max-w-none w-full transition-opacity duration-1000" key={\`img-\${currentIndex}\`}>
            <div className="absolute inset-0 bg-gradient-to-tr from-[#E67E22] to-[#D4AF37] rounded-full blur-2xl opacity-20 animate-pulse"></div>
            <div className="relative rounded-[2rem] overflow-hidden border-8 border-white shadow-2xl aspect-[4/5] transform hover:-translate-y-2 transition-transform duration-500">
              <img 
                src={slide.image} 
                alt={tl(slide.title) || "Entrepreneure FAFE"} 
                className="w-full h-full object-cover"
              />
              
              {/* Optional Overlay Content */}
              <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-[#6B3E1E]/90 to-transparent">
                <div className="flex items-center gap-3 text-white">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <Play className="w-5 h-5 text-white ml-1" />
                  </div>
                  <div>
                    <p className="font-bold">Découvrez son histoire</p>
                    <p className="text-sm text-white/80">Regarder la vidéo</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pagination Dots */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={\`w-2.5 h-2.5 rounded-full transition-all duration-300 \${
                    index === currentIndex ? 'bg-[#E67E22] w-8' : 'bg-[#6B3E1E]/20 hover:bg-[#6B3E1E]/40'
                  }\`}
                  aria-label={\`Aller au slide \${index + 1}\`}
                />
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}

function DynamicNews`;

if (heroRegex.test(content)) {
  content = content.replace(heroRegex, originalHero);
  fs.writeFileSync('src/pages/Home.tsx', content);
  console.log("Hero Section restored and updated correctly in Home.tsx");
} else {
  console.log("Regex not matched in Home.tsx");
}
