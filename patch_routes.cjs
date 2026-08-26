const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add import
if (!content.includes("import { Actions } from './pages/public/Actions';")) {
  content = content.replace(
    "import { About } from './pages/public/About';",
    "import { About } from './pages/public/About';\nimport { Actions } from './pages/public/Actions';"
  );
}

// Replace route
content = content.replace(
  /<Route path="\/actions" element=\{<Placeholder title="Nos actions" \/>\} \/>/,
  '<Route path="/actions" element={<Actions />} />'
);

fs.writeFileSync('src/App.tsx', content);
