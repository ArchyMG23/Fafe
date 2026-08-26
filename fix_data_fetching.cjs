const fs = require('fs');
let content = fs.readFileSync('src/lib/dataFetching.ts', 'utf8');

content = content.replace(
  /where\('status', '==', 'PUBLISHED'\)/,
  `where('status', '==', 'ACTIVE')`
);

fs.writeFileSync('src/lib/dataFetching.ts', content);
