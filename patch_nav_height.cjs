const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');

content = content.replace(/'h-16' : 'h-24'/g, "'h-16' : 'h-20'");
content = content.replace(/'w-14 h-14 text-2xl'/g, "'w-12 h-12 text-xl'");
content = content.replace(/'text-2xl'/g, "'text-xl'");
content = content.replace(/'text-\[11px\]'/g, "'text-[10px]'");

fs.writeFileSync('src/components/layout/Navbar.tsx', content);
