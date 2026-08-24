const fs = require('fs');
const path = require('path');

let mockDataPath = path.join(__dirname, 'src/lib/mockData.ts');
let content = fs.readFileSync(mockDataPath, 'utf8');

// Revert lines 46 and 59 back to "ACTIVE" for projects
content = content.replace(/status: "APPROVED",(\s+)donationEnabled:/g, 'status: "ACTIVE",$1donationEnabled:');

// Add verificationStatus: "VERIFIED" right after status: "APPROVED"
content = content.replace(/status: "APPROVED",\n/g, 'status: "APPROVED",\n    verificationStatus: "VERIFIED",\n');

fs.writeFileSync(mockDataPath, content);
console.log("Fixes applied");
