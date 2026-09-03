const fs = require('fs');
let code = fs.readFileSync('src/pages/Donation.tsx', 'utf8');

code = code.replace(
  /const paymentInit = await PaymentService\.processPayment\([\s\S]*?\);[\s\S]*?if \(paymentInit\.paymentStatus === 'SUCCESS'\) {[\s\S]*?navigate\('\/dons\/succes', \{/m,
  `const paymentInit = await PaymentService.processPayment(
        finalAmt,
        currency,
        'FLUTTERWAVE',
        frequency,
        { name: \`\${firstName} \${lastName}\`, email, phone },
        docRef.id
      );
      
      if (paymentInit.providerRedirectUrl) {
        window.location.href = paymentInit.providerRedirectUrl;
        return;
      }
      
      if (paymentInit.paymentStatus === 'SUCCESS' || paymentInit.paymentStatus === 'PENDING') {
        navigate('/dons/succes', {`
);

fs.writeFileSync('src/pages/Donation.tsx', code);
