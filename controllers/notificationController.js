import { prisma } from '../lib/prisma.js';

const getNotifications = async (req, res) => {
    try {
        const { userId } = req.user;
        const notifications = await prisma.notifications.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.user;

        await prisma.notifications.updateMany({
            where: {
                id: parseInt(id),
                userId // Ensure ownership
            },
            data: { read: true }
        });

        res.status(200).json({ message: "Notification marked as read" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const markAllAsRead = async (req, res) => {
    try {
        const { userId } = req.user;

        await prisma.notifications.updateMany({
            where: { userId, read: false },
            data: { read: true }
        });

        res.status(200).json({ message: "All notifications marked as read" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export {
    getNotifications,
    markAsRead,
    markAllAsRead
};
