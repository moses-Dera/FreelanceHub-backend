#!/bin/bash

echo "Installing Payment Gateway Dependencies..."

# Stripe
npm install stripe

# PayPal
npm install @paypal/checkout-server-sdk

# Flutterwave
npm install flutterwave-node-v3

echo "✅ Payment gateways installed successfully!"
echo ""
echo "Next steps:"
echo "1. Copy .env.example to .env"
echo "2. Add your payment gateway credentials"
echo "3. Update payment controller to use services"