const fs = require('fs');
let content = fs.readFileSync('src/pages/public/About.tsx', 'utf8');

const hookContent = `  useEffect(() => {
    if (!loading && hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else if (!loading && !hash) {
      window.scrollTo(0, 0);
    }
  }, [loading, hash]);`;

// Remove the existing hook
content = content.replace(hookContent, '');

// Insert it before the early return
content = content.replace(
  '  if (loading) {',
  hookContent + '\n\n  if (loading) {'
);

fs.writeFileSync('src/pages/public/About.tsx', content);
console.log('Fixed hooks in About.tsx');

