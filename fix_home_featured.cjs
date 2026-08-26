const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

content = content.replace(
  /let ents = await fetchEntrepreneurs\(10\);/,
  `let ents = await fetchEntrepreneurs(10, true);
      if (ents.length === 0) {
        ents = await fetchEntrepreneurs(10); // fallback if no featured
      }`
);

fs.writeFileSync('src/pages/Home.tsx', content);
