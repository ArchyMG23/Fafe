const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Imports
content = content.replace(
  `import { CertificateVerification } from './pages/public/events/CertificateVerification';`,
  `import { CertificateVerification } from './pages/public/events/CertificateVerification';\nimport { ProjectsList } from './pages/public/Projects';\nimport { ProjectDetail } from './pages/public/ProjectDetail';`
);

// Routes
content = content.replace(
  `<Route path="/projets-sociaux" element={<Placeholder title="Projets Sociaux" />} />`,
  `<Route path="/projets-sociaux" element={<ProjectsList />} />\n          <Route path="/projets-sociaux/:slug" element={<ProjectDetail />} />`
);

fs.writeFileSync('src/App.tsx', content);
