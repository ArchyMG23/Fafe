const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

code = code.replace(/shadow-\[#E67E22\]\/25/g, 'shadow-[#C8102E]/25');
code = code.replace(/bg-\[#042D29\]/g, 'bg-[#063F3A]');

fs.writeFileSync('src/pages/Home.tsx', code);
