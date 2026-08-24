import { Donation, DonationStatus, DonationFrequency } from '../types';

export class PaymentService {
  /**
   * Simulate processing a payment through a provider (e.g. Stripe, Mobile Money).
   * In a real implementation, this would call a backend API that interfaces
   * with the payment provider's SDK.
   */
  static async processPayment(
    amount: number,
    currency: "XAF" | "EUR" | "USD" | "GBP",
    paymentMethod: string,
    frequency: DonationFrequency,
    donorData: { name: string; email: string; phone?: string }
  ): Promise<Partial<Donation>> {
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        const transactionRef = 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        
        resolve({
          amount,
          currency,
          frequency,
          paymentMethod,
          donorFirstName: donorData.name.split(' ')[0] || '',
          donorLastName: donorData.name.split(' ').slice(1).join(' ') || '',
          donorEmail: donorData.email,
          donorPhone: donorData.phone,paymentStatus: 'SUCCESS', donationStatus: 'SUCCESS',
          transactionReference: transactionRef,
          createdAt: Date.now()
        });
      }, 2000);
    });
  }
}
