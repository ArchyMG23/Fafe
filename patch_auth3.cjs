const fs = require('fs');
let code = fs.readFileSync('src/store/auth.ts', 'utf8');
code = code.replace(/\s*\/\/\s*Auto-upgrade founder account to SUPER_ADMIN[\s\S]*?console\.error\(e\);\s*\}\s*\}/, '');
fs.writeFileSync('src/store/auth.ts', code);
