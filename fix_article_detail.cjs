const fs = require('fs');
let content = fs.readFileSync('src/pages/public/ArticleDetail.tsx', 'utf8');

content = content.replace(
  `import { Article, Category } from '../../types';`,
  `import { Article, Category } from '../../types';\nimport { fetchArticles } from '../../lib/dataFetching';`
);

content = content.replace(
  /const q = query\(collection\(db, 'articles'\), where\('slug', '==', slug\), limit\(1\)\);\n        const snap = await getDocs\(q\);\n        \n        if \(snap\.empty\) \{\n          setLoading\(false\);\n          return;\n        \}\n\n        const data = snap\.docs\[0\]\.data\(\) as Article;\n        data\.id = snap\.docs\[0\]\.id;/m,
  `const allArticles = await fetchArticles();\n        const data = allArticles.find(a => a.slug === slug || a.id === slug);\n        if (!data) {\n          setLoading(false);\n          return;\n        }`
);

// We need to also fix the related articles fetch
content = content.replace(
  /const relQ = query\([\s\S]*?const relSnap = await getDocs\(relQ\);\n        setRelated\(relSnap\.docs\.map\(d => \(\{ id: d\.id, \.\.\.d\.data\(\) \} as Article\)\)\);/m,
  `const fetchedRelated = allArticles.filter(a => a.id !== data.id && a.categoryId === data.categoryId).slice(0, 3);\n        setRelated(fetchedRelated);`
);

fs.writeFileSync('src/pages/public/ArticleDetail.tsx', content);
