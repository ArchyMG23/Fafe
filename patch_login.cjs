const fs = require('fs');
let code = fs.readFileSync('src/pages/auth/Login.tsx', 'utf8');
code = code.replace("await signInWithEmailAndPassword(auth, email, password);\n      navigate('/hub/dashboard');", "await signInWithEmailAndPassword(auth, email, password);\n      // Let useEffect handle redirect based on role");
fs.writeFileSync('src/pages/auth/Login.tsx', code);
