const fs = require('fs');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = require('path').join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(require('path').join(dir, f));
  });
}

walkDir('./src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // --- GLOBAL REPLACEMENTS ---
    // 1. Brown Backgrounds that shouldn't be dominant
    content = content.replace(/bg-\[#6B3E1E\]/g, 'bg-[#00843D]'); // Brown to Green
    content = content.replace(/hover:bg-\[#532f17\]/g, 'hover:bg-[#006830]');
    content = content.replace(/hover:bg-\[#522d14\]/g, 'hover:bg-[#006830]');
    content = content.replace(/hover:bg-\[#5a3318\]/g, 'hover:bg-[#006830]');
    content = content.replace(/hover:bg-\[#8B5E34\]/g, 'hover:bg-[#006830]');
    
    // 2. Orange (`#E67E22`) to FAFE Yellow/Gold or Red or Green depending on context
    // We will change the generic orange to FAFE Red for main CTAs/Actions, and FAFE Yellow for highlights
    // Let's replace generic orange backgrounds with FAFE Red (#C8102E) for primary actions
    content = content.replace(/bg-\[#E67E22\]/g, 'bg-[#C8102E]'); 
    content = content.replace(/hover:bg-\[#c96a1a\]/g, 'hover:bg-[#A30D25]'); // Hover for red
    
    // 3. Orange text to FAFE Yellow/Gold or Green
    // In Navbar, we used it for active dots and highlights. Let's make text highlights Green for trust/institution, or Red for alert
    content = content.replace(/text-\[#E67E22\]/g, 'text-[#00843D]');
    
    // 4. Orange borders to Green
    content = content.replace(/border-\[#E67E22\]/g, 'border-[#00843D]');
    
    // 5. Light Orange backgrounds (often used as #E67E22/10) to Light Green
    content = content.replace(/bg-\[#E67E22\]\/10/g, 'bg-[#00843D]/10');
    content = content.replace(/bg-\[#E67E22\]\/20/g, 'bg-[#00843D]/20');

    // Write back if changed
    if (original !== content) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
  }
});
