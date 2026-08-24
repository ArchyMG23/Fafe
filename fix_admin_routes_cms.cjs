const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/admin/AdminDashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add new imports
const newImports = `
import { AdminContentDashboard } from './cms/AdminContentDashboard';
import { AdminArticles } from './cms/AdminArticles';
import { AdminArticleEditor } from './cms/AdminArticleEditor';
import { AdminCategories } from './cms/AdminCategories';
import { AdminComments } from './cms/AdminComments';
import { AdminMedia } from './cms/AdminMedia';
`;

content = content.replace(
  "import { AdminAudit } from './AdminAudit';",
  newImports + "\nimport { AdminAudit } from './AdminAudit';"
);

// Update nav groups
const oldContenusLink = '{ path: "/admin/contenus", icon: <FileText className="w-4 h-4 mr-3" />, label: "Contenus" },';
const newContenusLink = '{ path: "/admin/contenus", icon: <FileText className="w-4 h-4 mr-3" />, label: "Contenus (CMS)" },';
content = content.replace(oldContenusLink, newContenusLink);

// We should also add comments to the nav
const newCommentsLink = '{ path: "/admin/commentaires", icon: <MessageSquare className="w-4 h-4 mr-3" />, label: "Commentaires" },';
content = content.replace(
  '{ path: "#", icon: <MessageSquare className="w-4 h-4 mr-3" />, label: "Messagerie", disabled: true },',
  newCommentsLink
);

// Add routes
const oldContenusRoute = '<Route path="/contenus" element={<div className="p-8 text-center text-stone-500">Gestion des contenus en construction</div>} />';
const newRoutes = `
            <Route path="/contenus" element={<AdminContentDashboard />} />
            <Route path="/contenus/articles" element={<AdminArticles />} />
            <Route path="/contenus/articles/nouveau" element={<AdminArticleEditor />} />
            <Route path="/contenus/articles/:id" element={<AdminArticleEditor />} />
            <Route path="/contenus/categories" element={<AdminCategories />} />
            <Route path="/contenus/medias" element={<AdminMedia />} />
            <Route path="/commentaires" element={<AdminComments />} />
`;
content = content.replace(oldContenusRoute, newRoutes);

fs.writeFileSync(filePath, content);
console.log("Admin routes updated with CMS");
