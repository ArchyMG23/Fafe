const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');

// 1. Change max-width from max-w-7xl to max-w-[1400px] or w-full px-6 md:px-12
// And increase margins/padding
code = code.replace(
  "className={`w-full mx-auto flex items-center justify-between transition-all duration-300 px-4 md:px-8 max-w-7xl ${",
  "className={`w-full mx-auto flex items-center justify-between transition-all duration-300 px-4 md:px-8 lg:px-12 max-w-[1600px] ${"
);
// In case max-w-7xl was used differently:
code = code.replace(
  "max-w-7xl ${",
  "max-w-[1600px] ${"
);

// 2. Adjust Desktop Navigation gaps and margins
code = code.replace(
  '<nav className="hidden lg:flex items-center justify-center flex-1 gap-6 xl:gap-8 h-full mx-4">',
  '<nav className="hidden lg:flex items-center justify-center flex-1 gap-8 xl:gap-14 h-full mx-8 xl:mx-20">'
);

// 3. Adjust right actions padding
code = code.replace(
  '<div className="hidden lg:flex items-center gap-1.5 shrink-0 border-l border-stone-200 pl-4">',
  '<div className="hidden lg:flex items-center gap-2 xl:gap-3 shrink-0 border-l border-stone-200 pl-6 xl:pl-8 ml-auto">'
);

fs.writeFileSync('src/components/layout/Navbar.tsx', code);
