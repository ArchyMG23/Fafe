const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

content = content.replace("  MapPin,\n, Play } from \"lucide-react\";", "  MapPin,\n  Play\n} from \"lucide-react\";");
content = content.replace("  MapPin,, Play } from \"lucide-react\";", "  MapPin,\n  Play\n} from \"lucide-react\";");
content = content.replace("  MapPin,\n Play } from \"lucide-react\";", "  MapPin,\n  Play\n} from \"lucide-react\";");

fs.writeFileSync('src/pages/Home.tsx', content);
