const fs = require('fs');

let content = fs.readFileSync('src/pages/dashboard/MemberDashboard.tsx', 'utf8');

// I will insert a useEffect to upgrade to SUPER_ADMIN if email matches.
if (!content.includes('yombivictor@gmail.com')) {
  const insertIndex = content.indexOf('useEffect(() => {');
  const adminHook = `
  useEffect(() => {
    const checkAdmin = async () => {
      if (user && user.email === 'yombivictor@gmail.com' && userProfile?.role !== 'SUPER_ADMIN') {
        try {
          const { doc, updateDoc } = await import('firebase/firestore');
          const { db } = await import('../../lib/firebase');
          await updateDoc(doc(db, 'users', user.uid), { role: 'SUPER_ADMIN' });
          console.log("Upgraded to SUPER_ADMIN successfully");
          // Force reload to get updated token/profile if needed, but local state might not update immediately without a fetch.
          window.location.reload();
        } catch (e) {
          console.error("Failed to upgrade admin", e);
        }
      }
    };
    if (userProfile) checkAdmin();
  }, [user, userProfile]);
  `;
  content = content.substring(0, insertIndex) + adminHook + content.substring(insertIndex);
  fs.writeFileSync('src/pages/dashboard/MemberDashboard.tsx', content);
}
