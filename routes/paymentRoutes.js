import express from 'express';
import {
    fundWallet,
    withdrawFunds,
    paymentWebhook,
    getPaymentHistory
} from '../controllers/paymentController.js';
import authorize from '../middlewares/authorize.js';

const router = express.Router();

// POST /payments/fund-wallet - Add funds to wallet
router.post('/fund-wallet', authorize(['CLIENT', 'FREELANCER']), fundWallet);

// POST /payments/withdraw - Withdraw funds from wallet
router.post('/withdraw', authorize(['FREELANCER']), withdrawFunds);

// POST /payments/webhook - Payment gateway webhook (no auth needed)
router.post('/webhook', paymentWebhook);

// GET /payments/history - Get payment history
router.get('/history', authorize(['CLIENT', 'FREELANCER']), getPaymentHistory);

export default router;