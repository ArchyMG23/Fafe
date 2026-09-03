const fs = require('fs');
let code = fs.readFileSync('src/services/payment.ts', 'utf8');

code = code.replace(
  "orderId?: string\n  ): Promise<Partial<Donation> & { providerRedirectUrl?: string }> {",
  "orderId?: string,\n    customRedirectUrl?: string\n  ): Promise<Partial<Donation> & { providerRedirectUrl?: string }> {"
);

code = code.replace(
  "const redirectUrl = \`\${window.location.origin}/dons/succes?ref=\${transactionRef}&donationId=\${orderId || ''}\`;",
  "const redirectUrl = customRedirectUrl || \`\${window.location.origin}/dons/succes?ref=\${transactionRef}&donationId=\${orderId || ''}\`;"
);

fs.writeFileSync('src/services/payment.ts', code);
