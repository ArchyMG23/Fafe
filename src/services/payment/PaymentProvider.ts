import { Donation } from '../../types';

export interface PaymentInitResult {
  success: boolean;
  transactionReference: string;
  providerRedirectUrl?: string;
  error?: string;
}

export interface PaymentProvider {
  /**
   * Initializes a payment with the provider.
   * Returns a transaction reference and optionally a URL to redirect the user to.
   */
  initializePayment(donation: Donation): Promise<PaymentInitResult>;
  
  /**
   * Handles the callback from the payment provider (typically implemented server-side).
   */
  handleCallback?(payload: any): Promise<{ success: boolean; donationId: string; status: string }>;
}
