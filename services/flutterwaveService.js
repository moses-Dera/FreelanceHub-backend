import Flutterwave from 'flutterwave-node-v3';

const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);

export const flutterwaveService = {
  // Create payment link
  async createPayment(amount, email, name, currency = 'USD') {
    const payload = {
      tx_ref: `tx_${Date.now()}`,
      amount,
      currency,
      redirect_url: `${process.env.FRONTEND_URL}/payment/callback`,
      customer: {
        email,
        name
      },
      customizations: {
        title: "FreelanceHub Wallet Funding",
        description: "Add funds to your wallet"
      }
    };

    return await flw.Charge.card(payload);
  },

  // Verify payment
  async verifyPayment(transactionId) {
    return await flw.Transaction.verify({ id: transactionId });
  },

  // Create transfer (payout)
  async createTransfer(amount, email, name, currency = 'USD') {
    const payload = {
      account_bank: "044", // Access Bank
      account_number: "0690000040",
      amount,
      narration: "FreelanceHub Payout",
      currency,
      reference: `ref_${Date.now()}`,
      callback_url: `${process.env.API_URL}/api/payments/webhook/flutterwave`,
      debit_currency: currency
    };

    return await flw.Transfer.initiate(payload);
  },

  // Verify webhook
  verifyWebhook(signature, payload) {
    const hash = require('crypto')
      .createHmac('sha256', process.env.FLW_SECRET_HASH)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return hash === signature;
  }
};