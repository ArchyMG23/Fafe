const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const scrollImport = `import { ScrollToTop } from './components/layout/ScrollToTop';\n`;
if (!content.includes('ScrollToTop')) {
  content = content.replace("import { useEffect } from 'react';", `import { useEffect } from 'react';\n${scrollImport}`);
  content = content.replace('<BrowserRouter>', '<BrowserRouter>\n      <ScrollToTop />');
  content = content.replace('<Route path="/projets" element={<Placeholder title="Projets" />} />', '<Route path="/projets-sociaux" element={<Placeholder title="Projets Sociaux" />} />');
  fs.writeFileSync('src/App.tsx', content);
}
