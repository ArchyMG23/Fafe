const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');

// Replace navLinks definition
content = content.replace(
  /const navLinks = \[\s+.*?\];/s,
  `const navLinks = [
    { name: 'Accueil', path: '/' },
    { name: 'À propos', path: '/a-propos' },
    { name: 'Nos actions', path: '/actions' },
    { name: 'Entrepreneures', path: '/entrepreneures' },
    { name: 'Actualités', path: '/actualites' },
    { name: 'Événements', path: '/evenements' },
  ];`
);

// Remove activeDropdown and handlers
content = content.replace(/const \[activeDropdown, setActiveDropdown\] = useState<string \| null>\(null\);\s*/, '');
content = content.replace(/setActiveDropdown\(null\);\s*/g, '');
content = content.replace(/const handleDropdownEnter.*?};\s*/s, '');
content = content.replace(/const handleDropdownLeave.*?};\s*/s, '');

// Clean up desktop nav map
content = content.replace(
  /\{navLinks\.map\(\(link\) => \(\s*<div\s*key=\{link\.path\}\s*className="relative h-full flex items-center".*?<\/div>\s*\)\)\}/s,
  `{navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={\`flex items-center gap-1 text-sm font-semibold transition-all hover:text-[#E67E22] \${
                isActive(link.path) ? 'text-[#E67E22] relative after:absolute after:-bottom-2 after:left-0 after:w-full after:h-0.5 after:bg-[#E67E22] after:rounded-full' : 'text-[#6B3E1E]'
              }\`}
            >
              {link.name}
            </Link>
          ))}`
);

// Clean up mobile nav map
content = content.replace(
  /\{navLinks\.map\(\(link\) => \(\s*<div key=\{link\.path\} className="flex flex-col">.*?<\/div>\s*\)\)\}/s,
  `{navLinks.map((link) => (
                <Link 
                  key={link.path}
                  to={link.path} 
                  className={\`flex items-center justify-between p-3 rounded-lg text-lg font-medium transition-colors \${
                    isActive(link.path) ? 'bg-orange-50 text-[#E67E22]' : 'text-[#6B3E1E] hover:bg-stone-50'
                  }\`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}`
);

// Update header class to make it slightly smaller on scroll
content = content.replace(
  /className=\{"fixed w-full z-50 transition-all duration-300 \$\{[\s\S]*?\}"\}/,
  `className={\`fixed w-full z-50 transition-all duration-300 \${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-2' : 'bg-white py-4'}\`}`
);

// We need to handle the case where it might be wrapped in standard quotes or template literals.
// Let's just do a manual string replace for the header if regex is tricky.

fs.writeFileSync('src/components/layout/Navbar.tsx', content);
