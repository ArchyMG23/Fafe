const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/admin/AdminMemberDetail.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  "const handleUpdate = async () => {",
  `const handleUpdate = async () => {
    if (status !== member?.status || role !== member?.role) {
      if (!window.confirm("Êtes-vous sûr de vouloir enregistrer ces modifications de statut ou de rôle ?")) {
        return;
      }
    }`
);

fs.writeFileSync(filePath, content);
console.log("Added confirm to member detail");
