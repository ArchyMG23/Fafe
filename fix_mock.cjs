const fs = require('fs');
let content = fs.readFileSync('src/lib/mockData.ts', 'utf8');

content = content.replace(
  /firstName: 'Aminata',\n    lastName: 'Diallo',/,
  "firstName: 'Aminata',\n    lastName: 'Diallo',\n    isFeatured: true,"
);
content = content.replace(
  /firstName: 'Sarah',\n    lastName: 'Kone',/,
  "firstName: 'Sarah',\n    lastName: 'Kone',\n    isFeatured: true,"
);
content = content.replace(
  /firstName: 'Fatou',\n    lastName: 'Ndiaye',/,
  "firstName: 'Fatou',\n    lastName: 'Ndiaye',\n    isFeatured: true,"
);

fs.writeFileSync('src/lib/mockData.ts', content);
