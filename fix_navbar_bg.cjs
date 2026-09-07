const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');

// Replace the background in the fixed navbar
code = code.replace(
  /bg-\[#063F3A\]\/85 backdrop-blur-md/g,
  'bg-[#063F3A]/80 backdrop-blur-lg'
);
code = code.replace(
  /'bg-transparent py-3'/g,
  "'bg-[#063F3A]/80 backdrop-blur-lg py-2' // Always glassmorphic deep green as requested for premium feel"
);

// We need the logo to ALWAYS be light if the navbar is always deep green.
// It is already using variant="light".
fs.writeFileSync('src/components/layout/Navbar.tsx', code);
