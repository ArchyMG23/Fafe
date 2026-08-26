const fs = require('fs');

let content = fs.readFileSync('src/pages/dashboard/MemberDashboard.tsx', 'utf8');

// I will remove the <div className="lg:col-span-1">...</div> and change lg:col-span-3 to just be full width.
// Actually, it's easier to use a regex or string replacement.
const sidebarStart = '<div className="lg:col-span-1">';
const sidebarEnd = '</div>\n\n          {/* Main Content Area */}';
const startIndex = content.indexOf(sidebarStart);
const endIndex = content.indexOf(sidebarEnd) + sidebarEnd.length;

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + content.substring(endIndex);
  content = content.replace('<div className="lg:col-span-3">', '<div>');
  fs.writeFileSync('src/pages/dashboard/MemberDashboard.tsx', content);
  console.log('Sidebar removed');
}

// Also wait, MemberDashboard had a header:
// <div className="flex flex-col md:flex-row justify-between ...">
//   <div className="flex items-center gap-4">
// ...
// We can leave the header, it's a nice local header!
