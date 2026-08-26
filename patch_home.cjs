const fs = require('fs');

let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// 1. Fix hero link to profile
content = content.replace(
  /to=\{\`\/entrepreneures\/\$\{currentEnt\.id\}\`\}/g,
  'to={`/hub/annuaire/${currentEnt.id}`}'
);

// 2. Fix the network section grid links
content = content.replace(
  /to=\{\`\/entrepreneures\/\$\{ent\.id\}\`\}/g,
  'to={`/hub/annuaire/${ent.id}`}'
);

// 3. Fix projects link in Home.tsx
content = content.replace(
  /to=\{\`\/projets\/\$\{project\.id\}\`\}/g,
  'to={`/projets-sociaux/${project.id}`}'
);

fs.writeFileSync('src/pages/Home.tsx', content);
