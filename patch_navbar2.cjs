const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');

// Fix Desktop Navigation
code = code.replace(
  '<nav className="hidden lg:flex items-center justify-center flex-1 gap-8 xl:gap-14 h-full mx-8 xl:mx-20">',
  '<nav className="hidden lg:flex items-center justify-center flex-1 gap-4 lg:gap-5 xl:gap-8 h-full mx-4 xl:mx-8 overflow-hidden">'
);

// Fix Actions container
code = code.replace(
  '<div className="hidden lg:flex items-center gap-2 xl:gap-3 shrink-0 border-l border-stone-200 pl-6 xl:pl-8 ml-auto">',
  '<div className="hidden lg:flex items-center gap-2 lg:gap-3 shrink-0 border-l border-stone-200 pl-4 xl:pl-6 ml-auto">'
);

fs.writeFileSync('src/components/layout/Navbar.tsx', code);
