const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const replacementHero = `function DynamicHeroSection() {
  const [heroText, setHeroText] = useState<any>(null);
  const [entrepreneurs, setEntrepreneurs] = useState<Entrepreneur[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { language, tl } = useLanguageStore();

  useEffect(() => {
    const loadData = async () => {
      // 1. Load CMS for the institutional text (left column)
      const data = await getCMSGlobal();
      if (data && data.heroSlides && data.heroSlides.length > 0) {
        setHeroText(data.heroSlides[0]); // Take the first slide text
      } else {
        setHeroText(defaultHeroSlides[0]);
      }

      // 2. Load entrepreneurs for the carousel (right column)
      let ents = await fetchEntrepreneurs(10);
      if (ents.length === 0) {
        ents = DEMO_ENTREPRENEURS.slice(0, 5);
      }
      
      // Optionally randomize the starting index to avoid same person on every refresh
      const startIndex = Math.floor(Math.random() * ents.length);
      
      setEntrepreneurs(ents);
      setCurrentIndex(startIndex);
    };
    loadData();
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
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (isPaused || entrepreneurs.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % entrepreneurs.length);
    }, 25000); // 25 seconds
    return () => clearInterval(interval);
  }, [entrepreneurs.length, isPaused]);

  // Preload next image
  useEffect(() => {
    if (entrepreneurs.length > 1) {
      const nextIndex = (currentIndex + 1) % entrepreneurs.length;
      const img = new Image();
      img.src = entrepreneurs[nextIndex].professionalPhoto;
    }
  }, [currentIndex, entrepreneurs]);

  if (entrepreneurs.length === 0 || !heroText) return null;

  const currentEnt = entrepreneurs[currentIndex];

  return (
    <section
      className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden bg-[#FAF9F6]"
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
          <div className="max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E67E22]/20 text-[#E67E22] text-sm font-bold tracking-wide uppercase mb-8 shadow-sm">
              <Globe2 className="w-4 h-4" />
              {language === "fr" ? "Réseau Panafricain" : "Pan-African Network"}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-[#6B3E1E] leading-tight mb-6 animate-fade-in-up">
              {tl(heroText.title)}
            </h1>

            <p className="text-lg md:text-xl text-stone-600 mb-10 leading-relaxed animate-fade-in-up animation-delay-100">
              {tl(heroText.shortText)}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-fade-in-up animation-delay-200">
              <Link to={heroText.link || "/rejoindre"}>
                <Button
                  size="lg"
                  className="bg-[#E67E22] hover:bg-[#c96a1a] text-white rounded-full px-8 py-6 font-bold text-lg shadow-lg shadow-[#E67E22]/20 hover:scale-105 transition-all"
                >
                  {tl(heroText.buttonText)}
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: Image with Superimposed Card */}
          <div
            className="relative mx-auto lg:mx-0 max-w-md lg:max-w-none w-full transition-opacity duration-1000"
            key={\`img-\${currentIndex}\`}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-[#E67E22] to-[#D4AF37] rounded-full blur-2xl opacity-20 animate-pulse"></div>
            
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-[4/5]">
              <img
                src={currentEnt.professionalPhoto}
                alt={\`\${currentEnt.firstName} \${currentEnt.lastName}\`}
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000"
              />

              {/* Gradient Overlay for legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

              {/* Superimposed Card directly ON the photo */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-xl transform transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-[#E67E22] animate-pulse"></div>
                  <span className="text-xs font-bold text-[#E67E22] tracking-wider uppercase">À LA UNE</span>
                </div>
                <h3 className="text-xl font-bold text-[#6B3E1E] mb-1">
                  {currentEnt.firstName} {currentEnt.lastName}
                </h3>
                <p className="text-sm font-medium text-stone-600 mb-1">
                  {currentEnt.company} • {currentEnt.sector}
                </p>
                <div className="flex items-center gap-1 text-sm text-stone-500 mb-4">
                  <MapPin className="w-4 h-4" />
                  {currentEnt.country}
                </div>
                
                <Link to={\`/entrepreneures/\${currentEnt.id}\`} className="inline-flex items-center text-sm font-bold text-[#E67E22] hover:text-[#c96a1a] transition-colors group">
                  Découvrir son profil 
                  <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Pagination Dots */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
              {entrepreneurs.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={\`w-2.5 h-2.5 rounded-full transition-all duration-300 \${
                    index === currentIndex
                      ? "bg-[#E67E22] w-8"
                      : "bg-[#6B3E1E]/20 hover:bg-[#6B3E1E]/40"
                  }\`}
                  aria-label={\`Voir entrepreneure \${index + 1}\`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}`;

content = content.replace(/function DynamicHeroSection\(\) \{[\s\S]*?function DynamicNews\(\) \{/, replacementHero + '\n\nfunction DynamicNews() {');

fs.writeFileSync('src/pages/Home.tsx', content);
