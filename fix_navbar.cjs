const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');

// The header class currently uses standard sticky with white background.
// We want it to be `fixed w-full z-50` and float gracefully.
// Original: 
// className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-stone-100' : 'bg-white border-b border-stone-100/70'}`}

code = code.replace(
  /className=\{`sticky top-0 z-50 w-full transition-all duration-300 \$\{[\s\S]*?\}`\}/,
  `className={\`fixed top-0 z-50 w-full transition-all duration-500 \${isScrolled ? 'bg-[#063F3A]/85 backdrop-blur-md shadow-md border-b border-white/10 py-1' : 'bg-transparent py-3'}\`}`
);

// Switch logo to light mode ALWAYS if we are using transparent / deep green bg?
// Actually if it's transparent, it's over the hero (which is an image). The hero text is light. So logo should be light.
// If scrolled, the background is deep green (#063F3A). So logo should be light!
code = code.replace(/<FafeLogo size="sm" showSubtitle=\{false\}/g, '<FafeLogo variant="light" size="sm" showSubtitle={false}');
code = code.replace(/<FafeLogo size=\{isScrolled \? 'sm' : 'md'\}/g, '<FafeLogo variant="light" size={isScrolled ? "sm" : "md"}');

// Link colors in desktop nav need to be white instead of #063F3A
// original: isActive(...) ? 'text-[#063F3A]' : 'text-stone-600 hover:text-[#063F3A]'
code = code.replace(/isActive\((.*?)\) \? 'text-\[#063F3A\]' : 'text-stone-600 hover:text-\[#063F3A\]'/g, 'isActive($1) ? "text-white" : "text-white/70 hover:text-white"');

// We also need to fix the arrow icons and other dark elements
// Search icon button: 
// <Search className="w-5 h-5 text-stone-500 hover:text-[#063F3A] transition-colors" />
code = code.replace(/text-stone-500 hover:text-\[#063F3A\]/g, 'text-white/80 hover:text-white');
// Same for the mobile icons (ShoppingCart, Menu)
code = code.replace(/text-\[#063F3A\] hover:text-\[#00843D\]/g, 'text-white hover:text-[#FCD116]');
code = code.replace(/text-\[#063F3A\]/g, 'text-white');

fs.writeFileSync('src/components/layout/Navbar.tsx', code);
