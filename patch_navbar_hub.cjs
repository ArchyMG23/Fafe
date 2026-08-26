const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');
content = content.replace(/to="\/hub"/g, 'to="/hub/dashboard"');
fs.writeFileSync('src/components/layout/Navbar.tsx', content);
