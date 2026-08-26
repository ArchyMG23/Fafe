const fs = require('fs');

let content = fs.readFileSync('src/pages/public/Join.tsx', 'utf8');

content = content.replace(/to="\/dashboard\/adhesion"/g, 'to="/hub/inscription"');
content = content.replace(/to="\/inscription"/g, 'to="/hub/inscription"');
content = content.replace(/to="\/connexion"/g, 'to="/hub/connexion"');

fs.writeFileSync('src/pages/public/Join.tsx', content);
