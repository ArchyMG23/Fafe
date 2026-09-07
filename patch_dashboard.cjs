const fs = require('fs');
let code = fs.readFileSync('src/pages/dashboard/MemberDashboard.tsx', 'utf8');
const oldEffect = `  useEffect(() => {
    const checkAdmin = async () => {
      if (currentUser && currentUser.email === 'yombivictor@gmail.com' && userProfile?.role !== 'SUPER_ADMIN') {
        try {
          const { doc, updateDoc } = await import('firebase/firestore');
          const { db } = await import('../../lib/firebase');
          await updateDoc(doc(db, 'users', currentUser.uid), { role: 'SUPER_ADMIN' });
          console.log("Upgraded to SUPER_ADMIN successfully");
          // Force reload to get updated token/profile if needed, but local state might not update immediately without a fetch.
          window.location.reload();
        } catch (e) {
          console.error("Failed to upgrade admin", e);
        }
      }
    };
    if (userProfile) checkAdmin();
  }, [currentUser, userProfile]);`;
code = code.replace(oldEffect, '');
fs.writeFileSync('src/pages/dashboard/MemberDashboard.tsx', code);
