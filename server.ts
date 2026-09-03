import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Future backend routes for payments, etc.
  app.post("/api/payments/intent", (req, res) => {
    // Placeholder for actual payment intent creation
    res.json({ clientSecret: "mock_secret", status: "PENDING" });
  });

  
  // Flutterwave Payment Endpoint
  app.post("/api/payments/flutterwave", async (req, res) => {
    try {
      const { amount, currency, email, tx_ref, name, redirect_url } = req.body;
      
      const response = await fetch('https://api.flutterwave.com/v3/payments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
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

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // For Express 4
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
