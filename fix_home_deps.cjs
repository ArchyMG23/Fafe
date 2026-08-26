const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

content = content.replace(
  /}, \[entrepreneurs\.length, isPaused\]\);/,
  '}, [entrepreneurs.length, isPaused, currentIndex]);'
);

fs.writeFileSync('src/pages/Home.tsx', content);
