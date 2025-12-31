import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeService = {
  // Create payment intent for wallet funding
  async createPaymentIntent(amount, currency = 'usd') {
    return await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });
  },

  // Create payout for withdrawals
  async createPayout(amount, destination) {
    return await stripe.transfers.create({
      amount: amount * 100,
      currency: 'usd',
      destination, // Connected account ID
    });
  },

  // Verify webhook signature
  verifyWebhook(payload, signature) {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  }
};