const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir('./src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace all instances of #6B3E1E (Brown) with #063F3A (Deep Green)
    content = content.replace(/#6B3E1E/g, '#063F3A');
    content = content.replace(/#532f17/g, '#042D29'); // Hover state for brown -> darker green
    content = content.replace(/#522d14/g, '#042D29');
    content = content.replace(/#5a3318/g, '#042D29');

    // Write back if changed
    if (original !== content) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
  }
});
