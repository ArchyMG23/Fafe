const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, search, replace) {
  const fullPath = path.join(__dirname, filePath);
  if (!fs.existsSync(fullPath)) return;
  let content = fs.readFileSync(fullPath, 'utf8');
  content = content.replace(search, replace);
  fs.writeFileSync(fullPath, content);
}

function replaceRegexInFile(filePath, regex, replace) {
  const fullPath = path.join(__dirname, filePath);
  if (!fs.existsSync(fullPath)) return;
  let content = fs.readFileSync(fullPath, 'utf8');
  content = content.replace(regex, replace);
  fs.writeFileSync(fullPath, content);
}

// 1. Fix React namespace by adding import React from 'react' if not present
const filesWithReact = [
  'src/components/layout/Footer.tsx',
  'src/pages/Donation.tsx',
  'src/pages/admin/AdminProjects.tsx',
  'src/pages/auth/ForgotPassword.tsx',
  'src/pages/auth/Login.tsx',
  'src/pages/auth/Register.tsx',
  'src/pages/dashboard/MemberEntrepreneurProfile.tsx',
  'src/pages/dashboard/MemberProfile.tsx'
];

for (const file of filesWithReact) {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    if (!content.includes("import React") && !content.includes("import * as React")) {
        content = "import React from 'react';\n" + content;
        fs.writeFileSync(fullPath, content);
    }
  }
}

// 2. Fix 'user' vs 'firebaseUser' in Navbar and Donation
replaceRegexInFile('src/components/layout/Navbar.tsx', /const \{ user, /g, 'const { firebaseUser: user, ');
replaceRegexInFile('src/pages/Donation.tsx', /const \{ user \}/g, 'const { firebaseUser: user }');

// 3. Fix mockData.ts
let mockDataPath = 'src/lib/mockData.ts';
if (fs.existsSync(mockDataPath)) {
  let content = fs.readFileSync(mockDataPath, 'utf8');
  content = content.replace(/status: 'ACTIVE'/g, "status: 'APPROVED' as any"); // For EntrepreneurStatus
  content = content.replace(/objectives:/g, "donationEnabled: true,\n    updatedAt: Date.now(),\n    objectives:");
  fs.writeFileSync(mockDataPath, content);
}

// 4. Fix payment.ts and src/types/index.ts
let typesPath = 'src/types/index.ts';
if (fs.existsSync(typesPath)) {
  let content = fs.readFileSync(typesPath, 'utf8');
  content = content.replace(/frequency: 'ONE_TIME' \| 'MONTHLY' \| 'QUARTERLY' \| 'ANNUAL';/, 
    "frequency: DonationFrequency;\n");
  content = content.replace(/export interface Donation \{/, 
    "export type DonationFrequency = 'ONE_TIME' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';\n\nexport interface Donation {");
  fs.writeFileSync(typesPath, content);
}

replaceRegexInFile('src/services/payment.ts', /currency: string/, 'currency: "XAF" | "EUR" | "USD" | "GBP"');
replaceRegexInFile('src/services/payment.ts', /frequency: string/, 'frequency: "ONE_TIME" | "MONTHLY" | "QUARTERLY" | "ANNUAL"');
replaceRegexInFile('src/pages/Donation.tsx', /PaymentService\.processDonation/g, 'PaymentService.processPayment');

console.log("Fixes applied");
