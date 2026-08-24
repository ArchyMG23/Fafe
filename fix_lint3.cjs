const fs = require('fs');
const path = require('path');

function replaceRegexInFile(filePath, regex, replace) {
  const fullPath = path.join(__dirname, filePath);
  if (!fs.existsSync(fullPath)) return;
  let content = fs.readFileSync(fullPath, 'utf8');
  content = content.replace(regex, replace);
  fs.writeFileSync(fullPath, content);
}

replaceRegexInFile('src/lib/mockData.ts', /status: 'ACTIVE'/g, "status: 'APPROVED'");
replaceRegexInFile('src/services/payment.ts', /\$4paymentStatus/, "paymentStatus");

console.log("Fixes applied");
