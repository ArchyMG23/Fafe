const fs = require('fs');

let content = fs.readFileSync('src/pages/Directory.tsx', 'utf8');
content = content.replace(/to=\{\`\/entrepreneures\/\$\{entrepreneure\.id\}\`\}/g, 'to={`/hub/annuaire/${entrepreneure.id}`}');
fs.writeFileSync('src/pages/Directory.tsx', content);

// Also need to check if DirectoryProfile has a back button!
let profileContent = fs.readFileSync('src/pages/DirectoryProfile.tsx', 'utf8');
profileContent = profileContent.replace(/to="\/entrepreneures"/g, 'to="/hub/annuaire"');
fs.writeFileSync('src/pages/DirectoryProfile.tsx', profileContent);
