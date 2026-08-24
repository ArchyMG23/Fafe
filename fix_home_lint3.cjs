const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

content = content.replace("MapPin,, Play } from \"lucide-react\";", "MapPin, Play } from \"lucide-react\";");

fs.writeFileSync('src/pages/Home.tsx', content);
