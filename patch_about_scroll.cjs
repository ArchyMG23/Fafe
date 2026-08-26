const fs = require('fs');
let content = fs.readFileSync('src/pages/public/About.tsx', 'utf8');

const scrollLogic = `
  useEffect(() => {
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
  }, [loading, hash]);
`;

content = content.replace(
  /const fadeInUp = \{/,
  `${scrollLogic}\n  const fadeInUp = {`
);

fs.writeFileSync('src/pages/public/About.tsx', content);
