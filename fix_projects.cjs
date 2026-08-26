const fs = require('fs');
let content = fs.readFileSync('src/pages/public/Actions.tsx', 'utf8');

// Replace the progression bar code and link
content = content.replace(
  /\{\/\* Progression bar for projects \*\/\}[\s\S]*?<\/div>\s*\}\)/g,
  ""
);

// We need to also fix the link. The old link was to /projets-sociaux/${project.slug}
content = content.replace(
  /<Link to=\{\`\/projets-sociaux\/\$\{project\.slug\}\`\}>/g,
  '<Link to={`/projets-sociaux/${project.id}`}>'
);

fs.writeFileSync('src/pages/public/Actions.tsx', content);
