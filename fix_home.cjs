const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// Imports
content = content.replace(
  `import { getCMSGlobal, defaultHeroSlides } from "../lib/cms";`,
  `import { getCMSGlobal, defaultHeroSlides } from "../lib/cms";\nimport { fetchEntrepreneurs, fetchProjects, fetchArticles, fetchEvents } from "../lib/dataFetching";`
);

// DynamicNews
content = content.replace(
  /const fetchArticles = async \(\) => \{[\s\S]*?fetchArticles\(\);\n  \}, \[\]\);/m,
  `const fetchArticlesFn = async () => {\n      setLoading(true);\n      const data = await fetchArticles(3);\n      setArticles(data);\n      setLoading(false);\n    };\n    fetchArticlesFn();\n  }, []);`
);

// DynamicEvents
content = content.replace(
  /const fetchEvents = async \(\) => \{[\s\S]*?fetchEvents\(\);\n  \}, \[\]\);/m,
  `const fetchEventsFn = async () => {\n      setLoading(true);\n      const data = await fetchEvents(3);\n      setEvents(data);\n      setLoading(false);\n    };\n    fetchEventsFn();\n  }, []);`
);

// Home fetchHomeData
content = content.replace(
  /const fetchHomeData = async \(\) => \{[\s\S]*?fetchHomeData\(\);\n  \}, \[\]\);/m,
  `const fetchHomeData = async () => {\n      const ent = await fetchEntrepreneurs(4, true);\n      setEntrepreneurs(ent);\n      const proj = await fetchProjects(2);\n      setProjects(proj);\n    };\n    fetchHomeData();\n  }, []);`
);

fs.writeFileSync('src/pages/Home.tsx', content);
