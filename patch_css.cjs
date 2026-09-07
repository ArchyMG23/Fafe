const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

code = code.replace('--color-fafe-brown: #6B3E1E;', '--color-fafe-brown: #6B3E1E;\n  --color-fafe-deep-green: #063F3A;');
code = code.replace(/color: var\(--color-fafe-brown\);/g, 'color: var(--color-fafe-deep-green);');

fs.writeFileSync('src/index.css', code);
