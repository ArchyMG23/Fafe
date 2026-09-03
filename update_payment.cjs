const fs = require('fs');

const content = `import { Donation, DonationStatus, DonationFrequency } from '../types';

export class PaymentService {
  static async processPayment(
    amount: number,
    currency: "XAF" | "EUR" | "USD" | "GBP",
    paymentMethod: string,
    frequency: DonationFrequency,
    donorData: { name: string; email: string; phone?: string },
    orderId?: string
  ): Promise<Partial<Donation> & { providerRedirectUrl?: string }> {
    try {
      const transactionRef = 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      const redirectUrl = \`\${window.location.origin}/dons/succes?ref=\${transactionRef}&donationId=\${orderId || ''}\`;

      const response = await fetch('/api/payments/flutterwave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency,
          email: donorData.email,
          name: donorData.name,
          tx_ref: transactionRef,
          redirect_url: redirectUrl
        })
      });

      if (!response.ok) {
        throw new Error('Erreur de communication avec le serveur de paiement');
      }

      const data = await response.json();
      
      return {
        amount,
        currency,
        frequency,
        paymentMethod,
        donorFirstName: donorData.name.split(' ')[0] || '',
        donorLastName: donorData.name.split(' ').slice(1).join(' ') || '',
        donorEmail: donorData.email,
        donorPhone: donorData.phone,
        paymentStatus: 'PENDING',
        donationStatus: 'PENDING',
        transactionReference: transactionRef,
        createdAt: Date.now(),
        providerRedirectUrl: data.link
      };
    } catch (error) {
      console.error('Payment initialization error:', error);
      throw error;
    }
  }
}
`;
fs.writeFileSync('src/services/payment.ts', content);
