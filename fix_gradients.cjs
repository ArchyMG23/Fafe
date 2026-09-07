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

    content = content.replace(/from-\[#6B3E1E\]\/80/g, 'from-black/80');
    content = content.replace(/from-\[#6B3E1E\]\/90/g, 'from-black/90');
    content = content.replace(/from-\[#6B3E1E\]/g, 'from-black/90');
    content = content.replace(/from-\[#E67E22\]/g, 'from-[#C8102E]');

    // Write back if changed
    if (original !== content) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
  }
});
