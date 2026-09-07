const fs = require('fs');
let code = fs.readFileSync('src/components/ui/FafeLogo.tsx', 'utf8');

// Change hardcoded colors inside FafeOfficialEmblem to respond to isLight
code = code.replace(/fill="#063F3A"/g, 'fill={isLight ? "#FFFFFF" : "#063F3A"}');
code = code.replace(/stroke="#063F3A"/g, 'stroke={isLight ? "#FFFFFF" : "#063F3A"}');

fs.writeFileSync('src/components/ui/FafeLogo.tsx', code);
