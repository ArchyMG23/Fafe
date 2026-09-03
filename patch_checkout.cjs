const fs = require('fs');
let code = fs.readFileSync('src/pages/public/marketplace/MarketplaceCheckout.tsx', 'utf8');

// First, add PaymentService import if not there
if (!code.includes('PaymentService')) {
  code = code.replace("import { useCartStore }", "import { PaymentService } from '../../../services/payment';\nimport { useCartStore }");
}

code = code.replace(
  /simulatePaymentAggregator\(orderRef\.id\);[\s\S]*?const simulatePaymentAggregator = \(orderId: string\) => \{[\s\S]*?\}, 2000\);\n  \};/m,
  `const paymentInit = await PaymentService.processPayment(
        total,
        'XAF',
        'FLUTTERWAVE',
        'ONETIME',
        { name: \`\${data.firstName} \${data.lastName}\`, email: data.email, phone: data.phone },
        orderRef.id
      );

      if (paymentInit.providerRedirectUrl) {
        window.location.href = paymentInit.providerRedirectUrl;
      } else {
        navigate(\`/marketplace/confirmation/\${orderRef.id}?status=success\`);
      }`
);

fs.writeFileSync('src/pages/public/marketplace/MarketplaceCheckout.tsx', code);
