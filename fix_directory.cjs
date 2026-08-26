const fs = require('fs');
let content = fs.readFileSync('src/pages/Directory.tsx', 'utf8');

content = content.replace(
  `import { DEMO_ENTREPRENEURS } from '../lib/mockData';`,
  `import { fetchEntrepreneurs } from '../lib/dataFetching';`
);

content = content.replace(
  /const fetchEntrepreneurs = async \(\) => \{[\s\S]*?fetchEntrepreneurs\(\);\n  \}, \[\]\);/m,
  `const loadData = async () => {\n      setLoading(true);\n      const data = await fetchEntrepreneurs();\n      setEntrepreneurs(data);\n      setLoading(false);\n    };\n    loadData();\n  }, []);`
);

fs.writeFileSync('src/pages/Directory.tsx', content);
