const fs = require('fs');
const path = require('path');

function replaceRegexInFile(filePath, regex, replace) {
  const fullPath = path.join(__dirname, filePath);
  if (!fs.existsSync(fullPath)) return;
  let content = fs.readFileSync(fullPath, 'utf8');
  content = content.replace(regex, replace);
  fs.writeFileSync(fullPath, content);
}

// 1. Fix user property in Navbar and Donation
replaceRegexInFile('src/components/layout/Navbar.tsx', /const \{ firebaseUser: user, /g, 'const { currentUser: user, ');
replaceRegexInFile('src/components/layout/Navbar.tsx', /const \{ user, /g, 'const { currentUser: user, ');

replaceRegexInFile('src/pages/Donation.tsx', /const \{ firebaseUser: user \}/g, 'const { currentUser: user }');
replaceRegexInFile('src/pages/Donation.tsx', /const \{ user \}/g, 'const { currentUser: user }');

// 2. Fix mockData.ts EntrepreneurStatus
replaceRegexInFile('src/lib/mockData.ts', /status: 'ACTIVE'/g, "status: 'APPROVED'");
replaceRegexInFile('src/lib/mockData.ts', /status: 'APPROVED' as any/g, "status: 'APPROVED'");

// 3. Fix payment.ts and Donation.tsx
replaceRegexInFile('src/services/payment.ts', 
  /donorName: donorData\.name,(\s+)donorEmail: donorData\.email,(\s+)phone: donorData\.phone,(\s+)status: 'SUCCESS' as DonationStatus,/, 
  "donorFirstName: donorData.name.split(' ')[0] || '',$1donorLastName: donorData.name.split(' ').slice(1).join(' ') || '',$2donorEmail: donorData.email,$3donorPhone: donorData.phone,$4paymentStatus: 'SUCCESS', donationStatus: 'SUCCESS',"
);

replaceRegexInFile('src/pages/Donation.tsx', 
  /const result = await PaymentService\.processPayment\(.*?\);/s,
  `const result = await PaymentService.processPayment(
        parseFloat(amount),
        currency,
        paymentMethod,
        frequency,
        { name: donorData.firstName + ' ' + donorData.lastName, email: donorData.email, phone: donorData.phone }
      );`
);

replaceRegexInFile('src/pages/Donation.tsx', /if \(result\.success\)/, "if (result.paymentStatus === 'SUCCESS')");
console.log("Fixes applied");
