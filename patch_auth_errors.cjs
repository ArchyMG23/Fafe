const fs = require('fs');

// Patch Register
let reg = fs.readFileSync('src/pages/auth/Register.tsx', 'utf8');
reg = reg.replace(/const getErrorMessage = \(errorCode: string\) => \{[\s\S]*?^\s*\};/m, `const getErrorMessage = (err: any) => {
    const code = err.code || 'unknown';
    const msg = err.message || 'unknown';
    switch (code) {
      case 'auth/email-already-in-use': return 'Cette adresse e-mail est déjà utilisée.';
      case 'auth/invalid-email': return 'Adresse e-mail invalide.';
      case 'auth/weak-password': return 'Le mot de passe est trop faible.';
      case 'auth/operation-not-allowed': return "L'authentification par email n'est pas activée dans Firebase.";
      default: return \`Erreur Firebase (\${code}): \${msg}\`;
    }
  };`);
reg = reg.replace(/setError\(getErrorMessage\(err\.code \|\| err\.message\)\);/, 'setError(getErrorMessage(err));');
fs.writeFileSync('src/pages/auth/Register.tsx', reg);

// Patch Login
let login = fs.readFileSync('src/pages/auth/Login.tsx', 'utf8');
login = login.replace(/const getErrorMessage = \(errorCode: string\) => \{[\s\S]*?^\s*\};/m, `const getErrorMessage = (err: any) => {
    const code = err.code || 'unknown';
    const msg = err.message || 'unknown';
    switch (code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Email ou mot de passe incorrect.';
      case 'auth/user-disabled':
        return 'Ce compte a été désactivé.';
      default:
        return \`Erreur (\${code}): \${msg}\`;
    }
  };`);
login = login.replace(/setError\(getErrorMessage\(err\.code\)\);/, 'setError(getErrorMessage(err));');
fs.writeFileSync('src/pages/auth/Login.tsx', login);

