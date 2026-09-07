const fs = require('fs');
let file = 'src/pages/Home.tsx';
if (fs.existsSync(file)) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/border border-white\/20 bg-white\/10 text-xs/g, 'border border-stone-200 bg-white text-stone-700 shadow-sm text-xs');
  fs.writeFileSync(file, code);
}
