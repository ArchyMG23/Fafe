const fs = require('fs');
let code = fs.readFileSync('src/pages/public/marketplace/MarketplaceCheckout.tsx', 'utf8');

code = code.replace(
  `      } else {
        navigate(\`/marketplace/confirmation/\${orderRef.id}?status=success\`);
      }
  return (`,
  `      } else {
        navigate(\`/marketplace/confirmation/\${orderRef.id}?status=success\`);
      }
    } catch (error) {
      console.error('Error processing order:', error);
      setIsProcessing(false);
      alert('Une erreur est survenue lors de la création de la commande.');
    }
  };

  return (`
);

fs.writeFileSync('src/pages/public/marketplace/MarketplaceCheckout.tsx', code);
