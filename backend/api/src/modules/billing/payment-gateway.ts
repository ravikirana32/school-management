export type CheckoutRequest = {
  attemptId: string;
  organizationId: string;
  amount: string;
  currency: string;
  invoiceId?: string;
  idempotencyKey: string;
  returnUrl: string;
};
export type CheckoutResult = {
  provider: string;
  providerReference: string;
  checkoutUrl: string | null;
  status: "CREATED" | "REQUIRES_ACTION";
};

/**
 * Provider adapter boundary. Implementations must create checkout sessions
 * server-side, validate callback/webhook signatures using raw request bytes,
 * and never accept card/bank credentials into this application.
 */
export interface PaymentGateway {
  readonly provider: string;
  createCheckout(request: CheckoutRequest): Promise<CheckoutResult>;
  verifyWebhook(rawBody: Buffer, signature: string): boolean;
}
