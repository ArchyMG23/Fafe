const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/AdminDashboard.tsx', 'utf8');

const imports = `import { AdminAdhesions } from './AdminAdhesions';\nimport { AdminVisualCMS } from './cms/AdminVisualCMS';`;
content = content.replace("import { AdminContentDashboard } from './cms/AdminContentDashboard';", `${imports}\nimport { AdminContentDashboard } from './cms/AdminContentDashboard';`);

fs.writeFileSync('src/pages/admin/AdminDashboard.tsx', content);
