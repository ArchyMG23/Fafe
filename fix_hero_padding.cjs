const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// Increase padding to account for fixed navbar
code = code.replace(
  /className="relative pt-8 pb-12 md:pt-14 md:pb-20 lg:pt-16 lg:pb-24 overflow-hidden bg-\[#FAF9F6\]"/,
  'className="relative pt-24 pb-12 md:pt-32 md:pb-20 lg:pt-36 lg:pb-24 overflow-hidden bg-[#FAF9F6]"'
);

fs.writeFileSync('src/pages/Home.tsx', code);
