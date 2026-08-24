const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/admin/AdminEntrepreneurs.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace the return section to include filters
content = content.replace(
  'searchPlaceholder="Rechercher par nom, entreprise, pays..."',
  `searchPlaceholder="Rechercher par nom, entreprise, pays..."
        filters={
          <select 
            className="flex h-10 rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#E67E22]"
            onChange={(e) => setSearchTerm(e.target.value)}
          >
            <option value="">Tous les statuts</option>
            <option value="APPROVED">Publié</option>
            <option value="PENDING">En attente</option>
            <option value="REJECTED">Rejeté / Suspendu</option>
          </select>
        }`
);

fs.writeFileSync(filePath, content);
console.log("Added ent filters");
