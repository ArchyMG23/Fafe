import { Donation } from '../../types';
import { PaymentProvider, PaymentInitResult } from './PaymentProvider';

// This is a stub provider until real credentials are provided
class DummyProvider implements PaymentProvider {
  async initializePayment(donation: Donation): Promise<PaymentInitResult> {
    // In a real implementation, this would make an API call to the provider
    // and return the provider's transaction reference and redirect URL.
    return {
      success: true,
      transactionReference: `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      // providerRedirectUrl: 'https://...',
    };
  }
}

export class PaymentService {
  private static providers: Record<string, PaymentProvider> = {
    'DUMMY': new DummyProvider(),
    // Future adapters:
    // 'STRIPE': new StripeProvider(),
    // 'MTN': new MtnMobileMoneyProvider(),
  };

  /**
   * Initializes a payment flow.
   * This runs on the client to get the checkout URL or reference.
   */
  static async processDonation(donation: Donation, providerName: string = 'DUMMY'): Promise<PaymentInitResult> {
    const provider = this.providers[providerName];
    if (!provider) {
      throw new Error(`Payment provider ${providerName} not configured.`);
    }

    return provider.initializePayment(donation);
  }
}
