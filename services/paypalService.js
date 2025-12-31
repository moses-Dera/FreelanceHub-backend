import paypal from '@paypal/checkout-server-sdk';

const environment = process.env.NODE_ENV === 'production' 
  ? new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
  : new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);

const client = new paypal.core.PayPalHttpClient(environment);

export const paypalService = {
  // Create payment order
  async createOrder(amount, currency = 'USD') {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: currency,
          value: amount.toString()
        }
      }]
    });

    const response = await client.execute(request);
    return response.result;
  },

  // Capture payment
  async captureOrder(orderId) {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});
    
    const response = await client.execute(request);
    return response.result;
  },

  // Create payout
  async createPayout(amount, email) {
    const request = new paypal.payouts.PayoutsPostRequest();
    request.requestBody({
      sender_batch_header: {
        sender_batch_id: `batch_${Date.now()}`,
        email_subject: "You have a payout!",
        email_message: "You have received a payout from FreelanceHub!"
      },
      items: [{
        recipient_type: "EMAIL",
        amount: {
          value: amount.toString(),
          currency: "USD"
        },
        receiver: email,
        note: "Freelance payment",
        sender_item_id: `item_${Date.now()}`
      }]
    });

    const response = await client.execute(request);
    return response.result;
  }
};