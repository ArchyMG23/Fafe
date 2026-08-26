const fs = require('fs');
let content = fs.readFileSync('src/pages/public/Actions.tsx', 'utf8');

// The issue is I escaped backticks in create_file which wasn't necessary, or I used backslashes that were inserted.
content = content.replace(/style=\{\{ borderLeft: \\`4px solid \\\$\{category\.colorAccent \|\| '#E67E22'\}\\` \}\}/g, "style={{ borderLeft: `4px solid ${category.colorAccent || '#E67E22'}` }}");
content = content.replace(/style=\{\{ width: \\`\\\$\{Math\.min\(Math\.round\(\(project\.raisedAmount \/ project\.targetAmount\) \* 100\), 100\)\}%\\` \}\}/g, "style={{ width: `${Math.min(Math.round((project.raisedAmount / project.targetAmount) * 100), 100)}%` }}");

// Just to be safe, let's remove any stray backslashes before backticks or dollar signs in the file.
content = content.replace(/\\`/g, '`');
content = content.replace(/\\\$/g, '$');

fs.writeFileSync('src/pages/public/Actions.tsx', content);
