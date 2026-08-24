const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');

// Ensure /a-propos doesn't trigger active state on other paths
const activeFunc = `  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };`;

const newActiveFunc = `  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    if (path === '/a-propos') return location.pathname === '/a-propos' || location.pathname.startsWith('/a-propos/');
    if (path === '/actions') return location.pathname === '/actions' || location.pathname.startsWith('/actions/');
    return location.pathname.startsWith(path);
  };`;

content = content.replace(activeFunc, newActiveFunc);
fs.writeFileSync('src/components/layout/Navbar.tsx', content);
