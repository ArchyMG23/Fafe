const fs = require('fs');

const files = [
  'src/pages/Home.tsx',
  'src/pages/public/About.tsx',
  'src/pages/Directory.tsx',
  'src/pages/public/Projects.tsx',
  'src/pages/public/ProjectDetail.tsx',
  'src/pages/public/News.tsx',
  'src/pages/public/ArticleDetail.tsx',
  'src/pages/public/events/EventList.tsx',
  'src/pages/public/events/EventDetail.tsx'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/pt-32 pb-20 lg:pt-40 lg:pb-32/g, 'pt-16 pb-20 lg:pt-24 lg:pb-32');
    content = content.replace(/pt-32 pb-24 lg:pt-40 lg:pb-32/g, 'pt-16 pb-24 lg:pt-24 lg:pb-32');
    content = content.replace(/pt-24 pb-16/g, 'pt-12 pb-16'); 
    content = content.replace(/pt-32/g, 'pt-16'); // catch all
    content = content.replace(/lg:pt-40/g, 'lg:pt-24');
    fs.writeFileSync(file, content);
  }
}
