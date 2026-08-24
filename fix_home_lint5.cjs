const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

content = content.replace("MapPin,, Play }", "MapPin, Play }");

fs.writeFileSync('src/pages/Home.tsx', content);
