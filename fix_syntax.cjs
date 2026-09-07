const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');

code = code.replace(
  /'bg-\[#063F3A\]\/80 backdrop-blur-lg py-2' \/\/ Always glassmorphic deep green as requested for premium feel\}/g,
  "'bg-[#063F3A]/80 backdrop-blur-lg py-2'}"
);

fs.writeFileSync('src/components/layout/Navbar.tsx', code);
