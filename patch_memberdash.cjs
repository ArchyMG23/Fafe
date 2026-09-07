const fs = require('fs');
let code = fs.readFileSync('src/pages/dashboard/MemberDashboard.tsx', 'utf8');
code = code.replace("navigate('/connexion');", "navigate('/hub/connexion');");
fs.writeFileSync('src/pages/dashboard/MemberDashboard.tsx', code);
