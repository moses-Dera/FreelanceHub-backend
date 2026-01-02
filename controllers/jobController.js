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
        const jobId = parseInt(req.params.id);
        const { userId } = req.user || {};

        if (isNaN(jobId)) {
            return res.status(400).json({
                error: "Invalid job ID. ID must be a number.",
                receivedId: req.params.id
            });
        }

        const job = await prisma.jobs.findUnique({
            where: { id: jobId },
            include: {
                client: {
                    select: { id: true, firstName: true, lastName: true, email: true }
                },
                _count: {
                    select: { proposal: true }
                }
            }
        });

        if (!job) {
            return res.status(404).json({ error: "Job not found" });
        }

        res.status(200).json(job);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getJobs = async (req, res) => {
    try {
        const { search, filter, tab } = req.query; // Added tab
        const { userId, role } = req.user || {};

        let where = {};
        let orderBy = { createdAt: 'desc' }; // Default

        // If user is a CLIENT, only show their own jobs
        if (role === 'CLIENT' && userId) {
            where.clientId = userId;
        }

        // Search Logic
        if (search) {
            const query = search;
            const searchConditions = {
                OR: [
                    { title: { contains: query, mode: "insensitive" } },
                    { description: { contains: query, mode: "insensitive" } },
                    { category: { contains: query, mode: "insensitive" } },
                    { skills: { hasSome: [query] } } // Exact match for skill tags roughly
                ],
            };
            where = { ...where, ...searchConditions };
        }

        // Tab Filtering Logic
        if (tab === 'Saved Jobs' && userId) {
            where.savedBy = {
                some: { userId: userId }
            };
        } else if (tab === 'Best Match' && userId) {
            // "Best Match" logic:
            // Ideally, match user skills with job skills.
            // For now, let's keep it simple: no filter (shows all), but if we had user skills we could filter.
            // A true "Best Match" sort is harder to do in DB without full text search engine.
            // We'll mimic it by fetching user skills and filtering/sorting locally or partially here.

            // Fetch User Skills first
            const user = await prisma.users.findUnique({ where: { id: userId }, select: { skills: true } });
            if (user && user.skills.length > 0) {
                where.skills = { hasSome: user.skills };
            }
        }

        // Handle filter query param (e.g. from generic filter button)
        if (filter) {
            // Example generic filter logic if needed
        }


        const jobs = await prisma.jobs.findMany({
            where,
            include: {
                _count: {
                    select: { proposal: true }
                }
            },
            orderBy: orderBy
        });

        res.status(200).json(jobs);

    } catch (error) {
        console.error("Error fetching jobs:", error);
        res.status(500).json({ error: error.message });
    }
};

const updateJob = async (req, res) => {
    try {
        const jobId = parseInt(req.params.id);

        if (isNaN(jobId)) {
            return res.status(400).json({
                error: "Invalid job ID. ID must be a number.",
                receivedId: req.params.id
            });
        }

        const { title, description, category, skills, budgetMin, budgetMax, deadline, status } = req.body;
        const job = await prisma.jobs.update({
            where: {
                id: jobId
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
        const jobId = parseInt(req.params.id);

        if (isNaN(jobId)) {
            return res.status(400).json({
                error: "Invalid job ID. ID must be a number.",
                receivedId: req.params.id
            });
        }

        await prisma.jobs.delete({
            where: { id: jobId }
        });
        res.status(200).json({ message: "Job deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const toggleSavedJob = async (req, res) => {
    try {
        const jobId = parseInt(req.params.id);
        const { userId } = req.user;

        if (isNaN(jobId)) {
            return res.status(400).json({ error: "Invalid job ID" });
        }

        // Check if already saved
        const existingSave = await prisma.savedJobs.findUnique({
            where: {
                userId_jobId: {
                    userId,
                    jobId
                }
            }
        });

        if (existingSave) {
            // Unsave
            await prisma.savedJobs.delete({
                where: {
                    userId_jobId: {
                        userId,
                        jobId
                    }
                }
            });
            return res.json({ message: "Job removed from saved", isSaved: false });
        } else {
            // Save
            await prisma.savedJobs.create({
                data: {
                    userId,
                    jobId
                }
            });
            return res.json({ message: "Job saved", isSaved: true });
        }

    } catch (error) {
        console.error("Error toggling saved job:", error);
        res.status(500).json({ error: error.message });
    }
};

export {
    addJob,
    getSingleJob,
    getJobs,
    updateJob,
    deleteJob,
    toggleSavedJob
};