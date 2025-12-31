import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

// POST /payments/fund-wallet
const fundWallet = async (req, res) => {
    try {
        const { userId } = req.user;
        const { amount, gatewayRf } = req.body;

        // Create payment record
        const payment = await prisma.payments.create({
            data: {
                contractId: null, // Wallet funding doesn't need contract
                userId,
                amount: parseInt(amount),
                type: "DEPOSIT",
                status: "COMPLETED",
                gatewayRf
            }
        });

        // Update user wallet balance
        await prisma.users.update({
            where: { id: userId },
            data: {
                walletBalance: {
                    increment: parseInt(amount)
                }
            }
        });

        res.status(201).json({
            message: "Wallet funded successfully",
            payment,
            newBalance: await getUserBalance(userId)
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST /payments/withdraw
const withdrawFunds = async (req, res) => {
    try {
        const { userId } = req.user;
        const { amount, gatewayRf } = req.body;

        // Check user balance
        const user = await prisma.users.findUnique({
            where: { id: userId }
        });

        if (!user || user.walletBalance < parseInt(amount)) {
            return res.status(400).json({ error: "Insufficient balance" });
        }

        // Create withdrawal record
        const payment = await prisma.payments.create({
            data: {
                contractId: null,
                userId,
                amount: parseInt(amount),
                type: "WITHDRAWAL",
                status: "PENDING",
                gatewayRf
            }
        });

        // Update user wallet balance
        await prisma.users.update({
            where: { id: userId },
            data: {
                walletBalance: {
                    decrement: parseInt(amount)
                }
            }
        });

        res.status(201).json({
            message: "Withdrawal initiated successfully",
            payment,
            newBalance: await getUserBalance(userId)
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST /payments/webhook
const paymentWebhook = async (req, res) => {
    try {
        const { gatewayRf, status, amount, userId } = req.body;

        // Find payment by gateway reference
        const payment = await prisma.payments.findFirst({
            where: { gatewayRf }
        });

        if (!payment) {
            return res.status(404).json({ error: "Payment not found" });
        }

        // Update payment status
        await prisma.payments.update({
            where: { id: payment.id },
            data: { status: status.toUpperCase() }
        });

        // If payment failed, refund wallet for withdrawals
        if (status === "FAILED" && payment.type === "WITHDRAWAL") {
            await prisma.users.update({
                where: { id: payment.userId },
                data: {
                    walletBalance: {
                        increment: payment.amount
                    }
                }
            });
        }

        res.status(200).json({ message: "Webhook processed successfully" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /payments/history
const getPaymentHistory = async (req, res) => {
    try {
        const { userId } = req.user;

        const payments = await prisma.payments.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50 // Limit to last 50 transactions
        });

        res.status(200).json(payments);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Helper function
const getUserBalance = async (userId) => {
    const user = await prisma.users.findUnique({
        where: { id: userId },
        select: { walletBalance: true }
    });
    return user?.walletBalance || 0;
};

export {
    fundWallet,
    withdrawFunds,
    paymentWebhook,
    getPaymentHistory
};