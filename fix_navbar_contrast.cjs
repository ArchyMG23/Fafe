const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');

// Fix Desktop Links: text-stone-600 -> text-white/80
code = code.replace(/text-stone-600 hover:text-white/g, 'text-white/80 hover:text-white');

// Fix Active Desktop Links: text-[#00843D] -> text-white font-extrabold
code = code.replace(/isActive\([^)]+\) \? 'text-\[#00843D\]' : 'text-white\/80 hover:text-white'/g, match => {
  return match.replace("'text-[#00843D]'", "'text-white font-bold drop-shadow-sm'");
});

// Also fix isActive for submenus where we might have the same
code = code.replace(/isActive\([^)]+\) && !isActive\([^)]+\) \? 'text-\[#00843D\]' : 'text-white\/80 hover:text-white'/g, match => {
  return match.replace("'text-[#00843D]'", "'text-white font-bold drop-shadow-sm'");
});

// Fix Connexion Button
code = code.replace(/border-stone-200 text-stone-700 hover:bg-stone-50 py-1\.5 px-4/g, 'border-white/40 text-white hover:bg-white/10 py-1.5 px-4 backdrop-blur-sm');

// Fix Header Icons (Marketplace, Search, Lang) text and hover backgrounds
code = code.replace(/text-stone-500 hover:text-\[#00843D\]/g, 'text-white/80 hover:text-white');
code = code.replace(/hover:bg-stone-50/g, 'hover:bg-white/10'); // for the icons

// Fix Separator
code = code.replace(/border-l border-stone-200/g, 'border-l border-white/20');

// Mobile drawer might use hover:bg-stone-50 which we just replaced with hover:bg-white/10
// We need to revert mobile drawer back since it has a white background (bg-white/98)
// Let's manually replace hover:bg-white/10 back to hover:bg-stone-50 ONLY in mobile section.
// A better way is to do it cleanly. Let's rewrite the script to target specific sections or use precise regex.

fs.writeFileSync('src/components/layout/Navbar.tsx', code);
