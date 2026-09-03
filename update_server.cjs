const fs = require('fs');
let serverTs = fs.readFileSync('server.ts', 'utf8');

const paymentEndpoint = `
  // Flutterwave Payment Endpoint
  app.post("/api/payments/flutterwave", async (req, res) => {
    try {
      const { amount, currency, email, tx_ref, name, redirect_url } = req.body;
      
      const response = await fetch('https://api.flutterwave.com/v3/payments', {
        method: 'POST',
        headers: {
          'Authorization': \`Bearer \${process.env.FLUTTERWAVE_SECRET_KEY}\`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tx_ref,
          amount,
          currency,
          redirect_url,
          customer: {
            email,
            name
          },
          customizations: {
            title: 'Paiement FAFE',
            description: 'Règlement en ligne FAFE'
          }
        })
      });

      const data = await response.json();
      if (data.status === 'success') {
        res.json({ link: data.data.link });
      } else {
        res.status(400).json({ error: data.message });
      }
    } catch (error) {
      console.error('Flutterwave payment error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
`;

if (!serverTs.includes('/api/payments/flutterwave')) {
  serverTs = serverTs.replace('// Vite middleware', paymentEndpoint + '\n  // Vite middleware');
  fs.writeFileSync('server.ts', serverTs);
}
