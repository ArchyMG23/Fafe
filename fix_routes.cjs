const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/admin/AdminDashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace("import { AdminProjects } from './AdminProjects';", 
  "import { AdminProjects } from './AdminProjects';\nimport { AdminAudit } from './AdminAudit';\nimport { AdminProfile } from './AdminProfile';");

content = content.replace(
  '<Route path="/audit" element={<div className="p-8 text-center text-stone-500">Journal d\'audit en construction</div>} />',
  '<Route path="/audit" element={<AdminAudit />} />'
);

content = content.replace(
  '<Route path="/profil" element={<div className="p-8 text-center text-stone-500">Profil administrateur en construction</div>} />',
  '<Route path="/profil" element={<AdminProfile />} />'
);

fs.writeFileSync(filePath, content);
console.log("Routes updated");
