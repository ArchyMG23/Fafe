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
    
    // In Home.tsx, let's make the continental presence section Beige
    if (file.includes('Home.tsx')) {
      code = code.replace(
        /<section className="py-12 md:py-20 bg-\[#00843D\] text-white relative overflow-hidden">/g,
        '<section className="py-12 md:py-20 bg-[#FAF9F6] text-[#6B3E1E] relative overflow-hidden">'
      );
      // It had text-white, let's fix its children
      // The subtitle was text-[#D4AF37], that can stay or be text-[#00843D]
      code = code.replace(/text-\[#D4AF37\] uppercase mb-2 block/g, 'text-[#00843D] uppercase mb-2 block');
      // Fix badge borders inside this section that might be white: `border-white/20` -> `border-[#6B3E1E]/20`
      code = code.replace(/border-white\/20 text-white/g, 'border-[#00843D]/20 text-[#00843D]');
    }

    if (file.includes('Actions.tsx')) {
      code = code.replace(
        /<section className="merged-section py-20 bg-\[#00843D\] text-white relative overflow-hidden">/g,
        '<section className="merged-section py-20 bg-[#FAF9F6] text-[#6B3E1E] border-y border-stone-100 relative overflow-hidden">'
      );
      code = code.replace(
        /<section className="merged-section py-24 bg-\[#00843D\] relative overflow-hidden">/g,
        '<section className="merged-section py-24 bg-[#00843D] text-white relative overflow-hidden">' // Let's keep one Green section
      );
    }

    if (file.includes('NewsAndEvents.tsx')) {
      code = code.replace(
        /<section className="relative pt-16 pb-14 md:pt-24 md:pb-20 overflow-hidden bg-\[#00843D\]">/g,
        '<section className="relative pt-16 pb-14 md:pt-24 md:pb-20 overflow-hidden bg-white border-b border-stone-100">'
      );
      // The text was likely white inside, need to be careful. The hero of NewsAndEvents
      // If we make it white, we need to ensure text is dark. Let's just make it a light green bg-[#00843D]/5 or beige.
    }

    if (file.includes('PublicEntrepreneurs.tsx')) {
      code = code.replace(
        /<section className="py-24 bg-\[#00843D\] text-white text-center">/g,
        '<section className="py-24 bg-[#FAF9F6] text-[#6B3E1E] text-center border-t border-stone-100">'
      );
    }
    
    if (file.includes('Join.tsx')) {
      code = code.replace(
        /<section className="bg-\[#00843D\] text-white pt-32 pb-20 relative overflow-hidden">/g,
        '<section className="bg-[#FAF9F6] text-[#6B3E1E] pt-32 pb-20 relative overflow-hidden">'
      );
    }

    fs.writeFileSync(file, code);
  }
});
