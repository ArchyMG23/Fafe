const fs = require('fs');
let code = fs.readFileSync('src/pages/public/marketplace/MarketplaceCheckout.tsx', 'utf8');

code = code.replace(
  "orderRef.id\n      );",
  "orderRef.id,\n        \`\${window.location.origin}/marketplace/confirmation/\${orderRef.id}\`\n      );"
);

fs.writeFileSync('src/pages/public/marketplace/MarketplaceCheckout.tsx', code);
