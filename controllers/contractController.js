import { prisma } from "../lib/prisma.js";

// POST /contracts - Create contract from accepted proposal
const addContract = async (req, res) => {
    try {
        const { userId } = req.user; // Client ID from auth
        const {
            proposalId,
            jobId,
            freelancerId,
            startDate,
            endDate
        } = req.body;

        // Verify the proposal exists and belongs to this job
        const proposal = await prisma.proposals.findUnique({
            where: { id: proposalId },
            include: { job: true }
        });

        if (!proposal) {
            return res.status(404).json({ error: "Proposal not found" });
        }

        // Verify user is the job owner (client)
        if (proposal.job.clientId !== userId) {
            return res.status(403).json({ error: "Not authorized to create contract for this job" });
        }

        // Create the contract
        const contract = await prisma.contracts.create({
            data: {
                jobId: parseInt(jobId),
                clientId: userId,
                freelancerId,
                amount: proposal.expectedSalary || 0,
                deadline: proposal.job.deadline,
                startDate: new Date(startDate),
                endDate: new Date(endDate)
            },
            include: {
                job: { select: { title: true } },
                client: { select: { firstName: true, lastName: true } },
                freelancer: { select: { firstName: true, lastName: true } }
            }
        });

        // Update proposal status to ACCEPTED
        await prisma.proposals.update({
            where: { id: proposalId },
            data: { status: "ACCEPTED" }
        });

        // Update job status to ASSIGNED
        await prisma.jobs.update({
            where: { id: parseInt(jobId) },
            data: { status: "ASSIGNED" }
        });

        res.status(201).json({
            message: "Contract created successfully",
            contract
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getContracts = async (req, res) => {
    try {
        const { userId, role } = req.user; // Extracted from auth

        let whereClause = {};

        if (role === 'CLIENT') {
            whereClause.clientId = userId;
        } else if (role === 'FREELANCER') {
            whereClause.freelancerId = userId;
        }

        const contracts = await prisma.contracts.findMany({
            where: whereClause,
            include: {
                job: { select: { title: true } },
                client: { select: { firstName: true, lastName: true } },
                freelancer: { select: { firstName: true, lastName: true } }
            }
        });

        res.status(200).json(contracts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getContractById = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, role } = req.user;

        const contract = await prisma.contracts.findUnique({
            where: { id: parseInt(id) },
            include: {
                job: true,
                client: { select: { id: true, firstName: true, lastName: true, email: true } },
                freelancer: { select: { id: true, firstName: true, lastName: true, email: true } },
                milestones: true,
                payments: true
            }
        });

        if (!contract) {
            return res.status(404).json({ error: "Contract not found" });
        }

        // Access control
        if (role === 'CLIENT' && contract.clientId !== userId) {
            return res.status(403).json({ error: "Not authorized" });
        }
        if (role === 'FREELANCER' && contract.freelancerId !== userId) {
            return res.status(403).json({ error: "Not authorized" });
        }

        res.json(contract);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export {
    addContract,
    getContracts,
    getContractById
};