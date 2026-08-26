const fs = require('fs');

// App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf8');
appContent = appContent.replace(/<Route path="\/actions"/g, '<Route path="/nos-actions"');
// Add wildcards for sub-routes if needed, but not strictly necessary unless we make them.
appContent = appContent.replace(/<Route path="\/nos-actions" element=\{<Actions \/>\} \/>/, '<Route path="/nos-actions" element={<Actions />} />\n          <Route path="/nos-actions/:slug" element={<Actions />} />'); // we can just render the same Actions page for now, or Placeholder
fs.writeFileSync('src/App.tsx', appContent);

// Navbar.tsx
let navContent = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');
navContent = navContent.replace(/path: '\/actions'/g, "path: '/nos-actions'");
fs.writeFileSync('src/components/layout/Navbar.tsx', navContent);

// ActionsMock.ts or wherever we put links:
let mockContent = fs.readFileSync('src/lib/actionsMock.ts', 'utf8');
mockContent = mockContent.replace(/\/nos-actions/g, '/nos-actions'); // it was already /nos-actions in my mock!
fs.writeFileSync('src/lib/actionsMock.ts', mockContent);

// Actions.tsx
let actionsContent = fs.readFileSync('src/pages/public/Actions.tsx', 'utf8');
// It already uses /nos-actions/${category.slug}
fs.writeFileSync('src/pages/public/Actions.tsx', actionsContent);

