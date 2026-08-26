const fs = require('fs');
let mockData = fs.readFileSync('src/lib/mockData.ts', 'utf8');

mockData = mockData.replace(
  /country: "Sénégal, Mali, Burkina Faso",\n\s*status: "ACTIVE",/g,
  'country: "Sénégal, Mali, Burkina Faso",\n    status: "ACTIVE",\n    targetAmount: 150000,\n    raisedAmount: 45000,'
);

mockData = mockData.replace(
  /country: "Panafricain",\n\s*status: "ACTIVE",/g,
  'country: "Panafricain",\n    status: "ACTIVE",\n    targetAmount: 500000,\n    raisedAmount: 380000,'
);

fs.writeFileSync('src/lib/mockData.ts', mockData);
