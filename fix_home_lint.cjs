const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

content = content.replace("import { ArrowRight, Globe2, Briefcase, TrendingUp, Calendar, Heart, MapPin } from 'lucide-react';", "import { ArrowRight, Globe2, Briefcase, TrendingUp, Calendar, Heart, MapPin, Play } from 'lucide-react';");

fs.writeFileSync('src/pages/Home.tsx', content);
