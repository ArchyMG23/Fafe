const fs = require('fs');

let content = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');

content = content.replace(/to="\/dashboard"/g, 'to="/hub"');
content = content.replace(/>\s*Mon Espace\s*<\/Button>/g, '>Mon Espace FAFE</Button>');
content = content.replace(/to="\/connexion"/g, 'to="/hub/connexion"');
// We leave /inscription as /rejoindre, wait, in Navbar it's currently to="/inscription"
content = content.replace(/to="\/inscription"/g, 'to="/rejoindre"');

fs.writeFileSync('src/components/layout/Navbar.tsx', content);
