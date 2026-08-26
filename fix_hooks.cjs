const fs = require('fs');
let content = fs.readFileSync('src/pages/public/About.tsx', 'utf8');

const regex = /  if \(loading\) \{\n    return \(\n      <div className="min-h-screen flex items-center justify-center bg-\[#FAF9F6\]">\n        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-\[#E67E22\]"><\/div>\n      <\/div>\n    \);\n  \}\n\n  const \{ pcaHero, presentation, historique, vision, mission, valeurs, gouvernance, bureauExecutif, equipe, partenaires, rapports \} = cmsData;\n\n      \n  useEffect\(\(\) => \{\n    if \(!loading && hash\) \{\n      setTimeout\(\(\) => \{\n        const element = document\.querySelector\(hash\);\n        if \(element\) \{\n          element\.scrollIntoView\(\{ behavior: 'smooth' \}\);\n        \}\n      \}, 100\);\n    \} else if \(!loading && !hash\) \{\n      window\.scrollTo\(0, 0\);\n    \}\n  \}, \[loading, hash\]\);/g;

const replacement = `  useEffect(() => {
    if (!loading && hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else if (!loading && !hash) {
      window.scrollTo(0, 0);
    }
  }, [loading, hash]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E67E22]"></div>
      </div>
    );
  }

  const { pcaHero, presentation, historique, vision, mission, valeurs, gouvernance, bureauExecutif, equipe, partenaires, rapports } = cmsData;`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/pages/public/About.tsx', content);
  console.log('Fixed hooks in About.tsx');
} else {
  console.log('Regex did not match.');
}

