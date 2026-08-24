const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const target1 = `  useEffect(() => {
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
  }, []);`;

const replacement1 = `  useEffect(() => {
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
  }, []);`;

const target2 = `  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 30000);
    return () => clearInterval(interval);
  }, [slides.length, isPaused]);`;

const replacement2 = `  useEffect(() => {
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
  }, [currentIndex, slides]);`;

content = content.replace(target1, replacement1);
content = content.replace(target2, replacement2);
content = content.replace(/to="\/projets"/g, 'to="/projets-sociaux"');

// Fix alt text in Hero image if it's empty
content = content.replace(/alt=""/g, 'alt={tl(slide.title) || "Entrepreneure FAFE"}');
content = content.replace(/alt={""}/g, 'alt={tl(slide.title) || "Entrepreneure FAFE"}');

fs.writeFileSync('src/pages/Home.tsx', content);
