import { prisma } from '../lib/prisma.js';

const getNotifications = async (req, res) => {
    try {
        const { userId } = req.user;

        const notifications = await prisma.notifications.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const markAsRead = async (req, res) => {
    try {
        const { userId } = req.user;
        const { id } = req.params;

        await prisma.notifications.update({
            where: { 
                id: parseInt(id),
                userId 
            },
            data: { read: true }
        });

        res.status(200).json({ message: "Notification marked as read" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export { getNotifications, markAsRead };