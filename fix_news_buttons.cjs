const fs = require('fs');

let file = 'src/pages/public/NewsAndEvents.tsx';
if (fs.existsSync(file)) {
  let code = fs.readFileSync(file, 'utf8');
  
  // Fix the filter buttons
  code = code.replace(/bg-\[#C8102E\] text-\[#6B3E1E\]/g, 'bg-[#C8102E] text-white');
  
  // Fix the green badge text
  code = code.replace(/bg-\[#00843D\] text-\[#6B3E1E\]/g, 'bg-[#00843D] text-white');

  fs.writeFileSync(file, code);
}
