import { prisma } from "../lib/prisma.ts";

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
        const proposal = await prisma.Proposals.findUnique({
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
        const contract = await prisma.Contracts.create({
            data: {
                jobId: parseInt(jobId),
                clientId: userId,
                freelancerId,
                startDate: new Date(startDate),
                endDate: new Date(endDate)
            },
            include: {
                job: { select: { title: true } },
                client: { select: { fullName: true } },
                freelancer: { select: { fullName: true } }
            }
        });

        // Update proposal status to ACCEPTED
        await prisma.Proposals.update({
            where: { id: proposalId },
            data: { status: "ACCEPTED" }
        });

        // Update job status to ASSIGNED
        await prisma.Jobs.update({
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

        const contracts = await prisma.Contracts.findMany({
            where: whereClause,
            include: {
                job: { select: { title: true } },
                client: { select: { fullName: true } },
                freelancer: { select: { fullName: true } }
            }
        });

        res.status(200).json(contracts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export {
    addContract,
    getContracts
};