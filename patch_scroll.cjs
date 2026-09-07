const fs = require('fs');
let code = fs.readFileSync('src/components/layout/ScrollToTop.tsx', 'utf8');
code = code.replace("window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });", "window.scrollTo(0, 0);");
fs.writeFileSync('src/components/layout/ScrollToTop.tsx', code);
