const fs = require('fs');
let content = fs.readFileSync('src/pages/public/Actions.tsx', 'utf8');

content = content.replace(
  /evt\.location \|\| \(evt\.isOnline \? 'En ligne' : 'TBD'\)/g,
  "evt.city ? `${evt.city}, ${evt.country}` : (evt.online ? 'En ligne' : 'TBD')"
);

fs.writeFileSync('src/pages/public/Actions.tsx', content);
