const fs = require('fs');

let file = 'src/pages/public/PublicEntrepreneurs.tsx';
if (fs.existsSync(file)) {
  let code = fs.readFileSync(file, 'utf8');
  
  // Fix the dark-mode cards in the stats section
  code = code.replace(/border-white\/10 rounded-2xl bg-white\/5/g, 'border-stone-200 rounded-2xl bg-white shadow-sm');
  
  fs.writeFileSync(file, code);
}
