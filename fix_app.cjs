const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const routeJoin = `<Route path="/rejoindre" element={<Join />} />`;
content = content.replace('<Route path="/dons" element={<Donation />} />', `<Route path="/dons" element={<Donation />} />\n          ${routeJoin}`);

fs.writeFileSync('src/App.tsx', content);
