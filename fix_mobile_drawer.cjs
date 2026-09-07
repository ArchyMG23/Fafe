const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');

const parts = code.split('{/* Mobile Drawer (Polished, Fast & Thumb-friendly) */}');
if (parts.length > 1) {
    let top = parts[0];
    let bottom = parts[1];
    
    bottom = bottom.replace(/hover:bg-white\/10/g, 'hover:bg-stone-50');
    // Also, I need to make sure the "Connexion" button on mobile uses the correct styles
    // Since I changed border-stone-200 to border-white/40 globally, it might have affected mobile too if it used the same exact string, but I matched "py-1.5 px-4" which is only desktop.
    
    fs.writeFileSync('src/components/layout/Navbar.tsx', top + '{/* Mobile Drawer (Polished, Fast & Thumb-friendly) */}' + bottom);
}
