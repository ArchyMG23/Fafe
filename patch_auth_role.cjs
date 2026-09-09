const fs = require('fs');
const file = 'src/store/auth.ts';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `            const profileData = docSnap.data() as UserProfile;
                        
            useAuthStore.getState().setProfile(profileData);`;

const replacement = `            const profileData = docSnap.data() as UserProfile;
            
            // Auto-promote yombivictor@gmail.com to SUPER_ADMIN if they aren't already.
            if (user.email === 'yombivictor@gmail.com' && profileData.role !== 'SUPER_ADMIN') {
              try {
                await updateDoc(docRef, { role: 'SUPER_ADMIN' });
                // We don't return here, we let it continue, but we update our local memory
                // so the UI updates instantly without waiting for the next snapshot.
                profileData.role = 'SUPER_ADMIN';
              } catch (err) {
                console.error('Failed to promote to SUPER_ADMIN:', err);
              }
            }
                        
            useAuthStore.getState().setProfile(profileData);`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replacement);
    fs.writeFileSync(file, content);
    console.log("Patched auth.ts successfully");
} else {
    console.log("Target string not found in auth.ts");
}
