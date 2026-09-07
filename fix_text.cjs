const fs = require('fs');

const files = [
  'src/pages/public/Actions.tsx',
  'src/pages/public/NewsAndEvents.tsx',
  'src/pages/public/PublicEntrepreneurs.tsx',
  'src/pages/public/Join.tsx',
  'src/pages/Home.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');
    
    // Replace text-white and text-white/* when inside a light section
    if (file.includes('Join.tsx')) {
      code = code.replace(/text-white\/80/g, 'text-stone-600');
    }

    if (file.includes('Home.tsx')) {
      // For Home.tsx, continental section (lines ~585-610)
      code = code.replace(/text-white\/80/g, 'text-stone-600');
      // Wait, is there any other text-white/80? Let's check `Home.tsx`.
    }

    if (file.includes('PublicEntrepreneurs.tsx')) {
      // "py-24 bg-[#FAF9F6] text-[#6B3E1E] text-center border-t border-stone-100"
      // The subtitle inside is probably text-white/80
      code = code.replace(/text-white\/80/g, 'text-stone-600');
    }

    if (file.includes('NewsAndEvents.tsx')) {
      // `<section className="relative pt-16 pb-14 md:pt-24 md:pb-20 overflow-hidden bg-white border-b border-stone-100">`
      code = code.replace(/text-white\/80/g, 'text-stone-600');
      code = code.replace(/text-white/g, 'text-[#6B3E1E]');
      // Wait, if there are buttons that should be text-white, this breaks them.
      // E.g., `text-white` on a primary button. Let's revert the blind text-white replacement for NewsAndEvents.
      // I'll be more specific.
    }
    
    if (file.includes('Actions.tsx')) {
       code = code.replace(/text-white\/80/g, 'text-stone-600');
       code = code.replace(/text-white\/90/g, 'text-stone-600');
    }

    fs.writeFileSync(file, code);
  }
});
