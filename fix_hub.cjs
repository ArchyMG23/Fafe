const fs = require('fs');

let content = fs.readFileSync('src/components/layout/HubLayout.tsx', 'utf8');
content = content.replace(/const \{ user, profile \} = useAuthStore\(\);/, 'const { currentUser: user, userProfile: profile } = useAuthStore();');
fs.writeFileSync('src/components/layout/HubLayout.tsx', content);

let entContent = fs.readFileSync('src/pages/public/PublicEntrepreneurs.tsx', 'utf8');
entContent = entContent.replace(/ArrowRight, Star, Award, TrendingUp/g, 'ArrowRight, Star, Award, TrendingUp, Users');
fs.writeFileSync('src/pages/public/PublicEntrepreneurs.tsx', entContent);
