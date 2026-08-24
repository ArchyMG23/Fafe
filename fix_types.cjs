const fs = require('fs');
const path = require('path');

const typesPath = path.join(__dirname, 'src/types/index.ts');
let content = fs.readFileSync(typesPath, 'utf8');

content = content.replace(
  "export type Role = 'MEMBER' | 'ADMIN' | 'ENTREPRENEUR' | 'MODERATOR' | 'TRAINER' | 'SUPER_ADMIN';",
  "export type Role = 'MEMBER' | 'ADMIN' | 'ENTREPRENEUR' | 'MODERATOR' | 'TRAINER' | 'SUPER_ADMIN' | 'CONTENT_MANAGER' | 'FINANCE_MANAGER';"
);

fs.writeFileSync(typesPath, content);
console.log("Types fixed");

const adminOverviewPath = path.join(__dirname, 'src/pages/admin/AdminOverview.tsx');
let overviewContent = fs.readFileSync(adminOverviewPath, 'utf8');
overviewContent = overviewContent.replace(
  "Users, Briefcase, MapPin, Heart, FolderOpen,",
  "Users, Briefcase, MapPin, Heart, FolderOpen, FileText,"
);
fs.writeFileSync(adminOverviewPath, overviewContent);
