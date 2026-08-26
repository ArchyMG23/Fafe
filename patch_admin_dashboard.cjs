const fs = require('fs');

let content = fs.readFileSync('src/pages/admin/AdminDashboard.tsx', 'utf8');

content = content.replace("navigate('/connexion');", "navigate('/hub/connexion');");
content = content.replace("navigate('/espace-membre');", "navigate('/hub/dashboard');");

fs.writeFileSync('src/pages/admin/AdminDashboard.tsx', content);
