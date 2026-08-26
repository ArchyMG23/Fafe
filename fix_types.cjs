const fs = require('fs');

let typesData = fs.readFileSync('src/types/index.ts', 'utf8');
typesData = typesData.replace(
  /donationEnabled: boolean;/,
  "donationEnabled: boolean;\n  targetAmount?: number;\n  raisedAmount?: number;"
);
fs.writeFileSync('src/types/index.ts', typesData);
