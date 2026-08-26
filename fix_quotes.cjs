const fs = require('fs');
let content = fs.readFileSync('src/pages/public/PublicEntrepreneurs.tsx', 'utf8');
content = content.replace(/\\'/g, "'");
fs.writeFileSync('src/pages/public/PublicEntrepreneurs.tsx', content);
