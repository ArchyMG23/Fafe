const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/AdminDashboard.tsx', 'utf8');

// Add imports
const imports = `import { AdminAdhesions } from './AdminAdhesions';
import { AdminVisualCMS } from './cms/AdminVisualCMS';`;
content = content.replace("import { AdminContentDashboard } from './content/AdminContentDashboard';", `${imports}\nimport { AdminContentDashboard } from './content/AdminContentDashboard';`);

// Add routes
const routes = `<Route path="/adhesions" element={<AdminAdhesions />} />
            <Route path="/cms-visuel" element={<AdminVisualCMS />} />`;
content = content.replace('<Route path="/projets" element={<AdminProjects />} />', `<Route path="/projets" element={<AdminProjects />} />\n            ${routes}`);

// Add menu items
const menuReplacement = `{ path: "/admin/adhesions", icon: <ShieldAlert className="w-4 h-4 mr-3" />, label: "Adhésions FAFE" },`;
content = content.replace('{ path: "/admin/dons", icon: <Heart className="w-4 h-4 mr-3" />, label: "Dons" },', `{ path: "/admin/dons", icon: <Heart className="w-4 h-4 mr-3" />, label: "Dons" },\n        ${menuReplacement}`);

const cmsReplacement = `{ path: "/admin/cms-visuel", icon: <LayoutDashboard className="w-4 h-4 mr-3" />, label: "Éditeur Visuel (CMS)" },`;
content = content.replace('{ path: "/admin/contenus", icon: <FileText className="w-4 h-4 mr-3" />, label: "Contenus (CMS)" },', `{ path: "/admin/contenus", icon: <FileText className="w-4 h-4 mr-3" />, label: "Contenus (CMS)" },\n        ${cmsReplacement}`);

fs.writeFileSync('src/pages/admin/AdminDashboard.tsx', content);
