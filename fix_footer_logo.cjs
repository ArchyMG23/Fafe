const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Footer.tsx', 'utf8');

code = code.replace(/<FafeLogo size="md" showSubtitle=\{false\}/g, '<FafeLogo variant="light" size="md" showSubtitle={false}');

fs.writeFileSync('src/components/layout/Footer.tsx', code);
