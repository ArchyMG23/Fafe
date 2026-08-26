const fs = require('fs');
const glob = require('glob');

const filesToPatch = [
  'src/pages/public/events/EventRegistration.tsx',
  'src/pages/auth/Register.tsx',
  'src/pages/auth/ForgotPassword.tsx',
  'src/components/auth/ProtectedRoute.tsx',
  'src/pages/auth/Login.tsx',
  'src/pages/public/events/EventRegistrationSuccess.tsx',
  'src/pages/dashboard/MemberDashboard.tsx'
];

for (const file of filesToPatch) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/to="\/connexion"/g, 'to="/hub/connexion"');
    content = content.replace(/to="\/inscription"/g, 'to="/hub/inscription"');
    content = content.replace(/to="\/espace-membre/g, 'to="/hub/dashboard');
    content = content.replace(/to="\/dashboard/g, 'to="/hub/dashboard');
    fs.writeFileSync(file, content);
  }
}
