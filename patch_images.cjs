const fs = require('fs');
const files = [
  'src/pages/Home.tsx',
  'src/pages/public/PublicEntrepreneurs.tsx',
  'src/pages/public/News.tsx',
  'src/pages/public/ArticleDetail.tsx',
  'src/pages/Directory.tsx',
  'src/pages/DirectoryProfile.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('FafeImage')) {
    content = content.replace(/import \{([^\}]+)\} from "lucide-react";|import \{([^\}]+)\} from 'lucide-react';/, (match) => {
      return match + "\nimport { FafeImage } from '../components/ui/FafeImage';";
    });
    // Replace Home.tsx relative path differently if needed
    if (file === 'src/pages/Home.tsx' || file.startsWith('src/pages/public/')) {
        content = content.replace(/import \{ FafeImage \} from '\.\.\/components\/ui\/FafeImage';/g, "import { FafeImage } from '../../components/ui/FafeImage';");
        if (file === 'src/pages/Home.tsx' || file === 'src/pages/Directory.tsx' || file === 'src/pages/DirectoryProfile.tsx') {
           content = content.replace(/import \{ FafeImage \} from '\.\.\/\.\.\/components\/ui\/FafeImage';/g, "import { FafeImage } from '../components/ui/FafeImage';");
        }
    }
    
    // Replace <img ... /> with <FafeImage ... />
    content = content.replace(/<img\s([^>]+)>/g, (match, p1) => {
      return `<FafeImage ${p1}>`;
    });
    fs.writeFileSync(file, content);
  }
});
