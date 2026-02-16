
import { prisma } from '../lib/prisma.js';

export const getDashboardStats = async (req, res) => {
    try {
        const [totalUsers, totalJobs, activeContracts, payments] = await Promise.all([
            prisma.users.count(),
            prisma.jobs.count(),
            prisma.contracts.count({
                where: { status: 'ACTIVE' }
            }),
            prisma.payments.aggregate({
                _sum: {
                    amount: true
                },
                where: {
                    status: 'COMPLETED'
                }
            })
        ]);

        // Assuming 10% platform fee
        const totalVolume = payments._sum.amount || 0;
        const totalRevenue = totalVolume * 0.10;

        res.json({
            totalUsers,
            totalJobs,
            activeContracts,
            totalRevenue,
            totalVolume
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
};

export const getRecentActivity = async (req, res) => {
    try {
        const [recentUsers, recentJobs] = await Promise.all([
            prisma.users.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    createdAt: true
                }
            }),
            prisma.jobs.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    client: {
                        select: {
                            firstName: true,
                            lastName: true
                        }
                    },
                    createdAt: true
                }
            })
        ]);

        // Standardize structure for frontend
        const activities = [
            ...recentUsers.map(user => ({
                id: user.id,
                type: 'USER_JOINED',
                message: `${user.firstName} ${user.lastName} joined as ${user.role}`,
                date: user.createdAt
            })),
            ...recentJobs.map(job => ({
                id: job.id,
                type: 'JOB_POSTED',
                message: `New Job: "${job.title}" posted by ${job.client.firstName} ${job.client.lastName}`,
                date: job.createdAt
            }))
        ];

        // Sort by date desc
        activities.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json(activities.slice(0, 10)); // Return top 10 combined
    } catch (error) {
        console.error('Error fetching recent activity:', error);
        res.status(500).json({ error: 'Failed to fetch recent activity' });
    }
};
