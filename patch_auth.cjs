const fs = require('fs');
let code = fs.readFileSync('src/store/auth.ts', 'utf8');
const oldCode = `            // Auto-upgrade founder account to SUPER_ADMIN
            if (user.email === 'yombivictor@gmail.com' && profileData.role !== 'SUPER_ADMIN') {
              try {
                await updateDoc(docRef, { role: 'SUPER_ADMIN' });
                profileData.role = 'SUPER_ADMIN';
                console.log('Founder account automatically upgraded to SUPER_ADMIN');
              } catch (e) {
                console.error(e);
              }
            }`;
code = code.replace(oldCode, '');
code = code.replace("const isSuperAdmin = user.email === 'yombivictor@gmail.com';", "const isSuperAdmin = false;");
fs.writeFileSync('src/store/auth.ts', code);
