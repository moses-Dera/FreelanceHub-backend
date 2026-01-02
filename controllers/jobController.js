import { prisma } from '../lib/prisma.js';

const addJob = async (req, res) => {
    try {
        const { title, description, category, skills, budgetMin, budgetMax, deadline, status } = req.body;
        const clientId = req.user.userId;

        const job = await prisma.jobs.create({
            data: {
                title,
                clientId,
                description,
                category,
                skills,
                budgetMin: String(budgetMin || 0),
                budgetMax: String(budgetMax || 0),
                deadline: new Date(deadline),
                status: status || 'OPEN'
            }
        });
        res.status(201).json({ message: "Job added successfully", jobId: job.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getSingleJob = async (req, res) => {
    try {
        const job = await prisma.jobs.findUnique({
            where: {
                id: parseInt(req.params.id)
            }
        })
        res.status(200).json(job)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const getJobs = async (req, res) => {
    try {
        const { search, filter } = req.query;

        let where = {};

        if (search || filter) {
            const query = search || filter;

            where = {
                OR: [
                    { title: { contains: query, mode: "insensitive" } },
                    { description: { contains: query, mode: "insensitive" } },
                ],
            };
        }

        const jobs = await prisma.jobs.findMany({
            where,
            include: {
                _count: {
                    select: { proposal: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Flatten structure for frontend convenience if needed, but returning as is is fine.
        // Prisma returns: { ...job, _count: { proposal: 5 } }

        res.status(200).json(jobs);

    } catch (error) {
        console.error("Error fetching jobs:", error);
        res.status(500).json({ error: error.message });
    }
};

const updateJob = async (req, res) => {
    try {
        const { title, description, category, skills, budgetMin, budgetMax, deadline, status } = req.body;
        const job = await prisma.jobs.update({
            where: {
                id: parseInt(req.params.id)
            },
            data: {
                title,
                description,
                category,
                skills,
                budgetMin: String(budgetMin || 0),
                budgetMax: String(budgetMax || 0),
                deadline: deadline ? new Date(deadline) : undefined,
                status // Allow status updates too (e.g. closing a job)
            }
        });
        res.status(200).json({ message: "Job updated successfully", job });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteJob = async (req, res) => {
    try {
        await prisma.jobs.delete({
            where: {
                id: parseInt(req.params.id)
            }
        });
        res.status(200).json({ message: "Job deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export {
    addJob,
    getSingleJob,
    getJobs,
    updateJob,
    deleteJob
};