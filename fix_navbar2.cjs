const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');

// The mobile drawer starts at:
// {/* Mobile Drawer (Polished, Fast & Thumb-friendly) */}
let parts = code.split('{/* Mobile Drawer (Polished, Fast & Thumb-friendly) */}');
if (parts.length > 1) {
    let topNav = parts[0];
    let mobileDrawer = parts[1];

    // Inside mobile drawer, revert `text-white` back to `text-[#063F3A]`
    mobileDrawer = mobileDrawer.replace(/text-white/g, 'text-[#063F3A]');
    // Also revert text-white/70 
    mobileDrawer = mobileDrawer.replace(/text-\[#063F3A\]\/70 hover:text-\[#063F3A\]/g, 'text-stone-600 hover:text-[#063F3A]');

    // Wait, the mobile button itself (Espace Membre and S'inscrire) might need white text!
    // Let's manually fix those buttons inside the mobile drawer.
    mobileDrawer = mobileDrawer.replace(/bg-\[#00843D\] hover:bg-\[#006830\] text-\[#063F3A\]/g, 'bg-[#00843D] hover:bg-[#006830] text-white');
    mobileDrawer = mobileDrawer.replace(/bg-\[#C8102E\] hover:bg-\[#A30D25\] text-\[#063F3A\]/g, 'bg-[#C8102E] hover:bg-[#A30D25] text-white');

    fs.writeFileSync('src/components/layout/Navbar.tsx', topNav + '{/* Mobile Drawer (Polished, Fast & Thumb-friendly) */}' + mobileDrawer);
}
