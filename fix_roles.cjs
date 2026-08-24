const fs = require('fs');
const path = require('path');

const typesPath = path.join(__dirname, 'src/types/index.ts');
let content = fs.readFileSync(typesPath, 'utf8');

content = content.replace(
  "export type Role = 'MEMBER' | 'ENTREPRENEUR' | 'ADMIN' | 'TRAINER' | 'MODERATOR';",
  "export type Role = 'MEMBER' | 'ENTREPRENEUR' | 'ADMIN' | 'TRAINER' | 'MODERATOR' | 'SUPER_ADMIN' | 'CONTENT_MANAGER' | 'FINANCE_MANAGER';"
);

fs.writeFileSync(typesPath, content);
