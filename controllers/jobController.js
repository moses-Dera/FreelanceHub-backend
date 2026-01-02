import { prisma } from '../lib/prisma.js';

const addJob = async (req, res) => {
    try {
        const {title, description, clientId, budgetMin, budgetMax,deadline, status} = req.body
        const job = await prisma.jobs.create({
            data:{
                title,
                clientId,
                description,
                budgetMin,
                budgetMax,
                deadline,
                status
            }
        })
        res.status(201).json({message: "Job added successfully", jobId: job.id})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

const getSingleJob = async (req, res) => {
    try {
        const job = await prisma.jobs.findUnique({
            where:{
                id: parseInt(req.params.id)
            }
        })
        res.status(200).json(job)
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

const getJobs = async (req, res) => {
    try {
        const { search, filter } = req.query;

        let where = {};

        // If search or filter is provided
        if (search || filter) {
            const query = search || filter; // use whichever is provided

            where = {
                OR: [
                    { title: { contains: query, mode: "insensitive" } },
                    { description: { contains: query, mode: "insensitive" } },
                ],
            };
        }

        const jobs = await prisma.jobs.findMany({ where });
        res.status(200).json(jobs);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateJob = async (req, res) => {
    try {
        const { title, description, budgetMin, budgetMax, deadline } = req.body;
        const job = await prisma.jobs.update({
            where: {
                id: parseInt(req.params.id)
            },
            data: {
                title,
                description,
                budgetMin,
                budgetMax,
                deadline
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