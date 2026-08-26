const fs = require('fs');
let content = fs.readFileSync('src/components/layout/ScrollToTop.tsx', 'utf8');

content = content.replace(
  /window\.scrollTo\(0, 0\);/g,
  `window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });`
);

fs.writeFileSync('src/components/layout/ScrollToTop.tsx', content);
