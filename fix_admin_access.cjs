const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/admin/AdminDashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  "else if (userProfile.role !== 'ADMIN' && userProfile.role !== 'SUPER_ADMIN') {",
  "else if (!['ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'CONTENT_MANAGER', 'FINANCE_MANAGER'].includes(userProfile.role)) {"
);

fs.writeFileSync(filePath, content);
console.log("Admin access fixed");
