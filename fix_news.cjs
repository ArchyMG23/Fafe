const fs = require('fs');
let content = fs.readFileSync('src/pages/public/News.tsx', 'utf8');

content = content.replace(
  `import { Article, Category } from '../../types';`,
  `import { Article, Category } from '../../types';\nimport { fetchArticles } from '../../lib/dataFetching';`
);

content = content.replace(
  /let q = query\(collection\(db, 'articles'\), where\('status', '==', 'PUBLISHED'\), orderBy\('publishedAt', 'desc'\)\);\n        const artSnap = await getDocs\(q\);\n        let fetched = artSnap\.docs\.map\(doc => \(\{ id: doc\.id, \.\.\.doc\.data\(\) \} as Article\)\);/m,
  `let fetched = await fetchArticles();`
);

fs.writeFileSync('src/pages/public/News.tsx', content);
