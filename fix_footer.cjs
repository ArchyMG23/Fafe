const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Footer.tsx', 'utf8');

code = code.replace(/bg-\[#00843D\]/g, 'bg-[#063F3A]');

fs.writeFileSync('src/components/layout/Footer.tsx', code);
