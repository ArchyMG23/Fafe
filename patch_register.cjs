const fs = require('fs');
let code = fs.readFileSync('src/pages/auth/Register.tsx', 'utf8');
code = code.replace("const isSuperAdmin = user.email === 'yombivictor@gmail.com';", "const isSuperAdmin = false;");
fs.writeFileSync('src/pages/auth/Register.tsx', code);
