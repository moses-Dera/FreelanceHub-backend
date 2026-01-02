import { prisma } from '../lib/prisma.js';

// PUT /proposals/:id/approve (CLIENT ONLY)
export const approveProposal = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.user;

        // Find the proposal with job details
        const proposal = await prisma.proposals.findUnique({
            where: { id },
            include: { job: true }
        });

        if (!proposal) return res.status(404).json({ error: "Proposal not found" });

        // Security: Only job owner can approve
        if (proposal.job.clientId !== userId && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: "Not authorized" });
        }

        // Check if already approved/rejected
        if (proposal.status === 'ACCEPTED') {
            return res.status(400).json({ error: "Proposal already accepted" });
        }
        if (proposal.status === 'REJECTED') {
            return res.status(400).json({ error: "Proposal already rejected" });
        }

        // Update proposal status
        const updatedProposal = await prisma.proposals.update({
            where: { id },
            data: { status: 'ACCEPTED' }
        });

        // Create contract
        const contract = await prisma.contracts.create({
            data: {
                jobId: proposal.jobId,
                clientId: proposal.job.clientId,
                freelancerId: proposal.userId,
                amount: proposal.expectedSalary || parseInt(proposal.job.budgetMax),
                status: 'ACTIVE',
                deadline: proposal.job.deadline,
                startDate: new Date(),
                endDate: proposal.job.deadline
            }
        });

        // Update job status to ASSIGNED
        await prisma.jobs.update({
            where: { id: proposal.jobId },
            data: { status: 'ASSIGNED' }
        });

        res.json({
            message: "Proposal approved and contract created",
            proposal: updatedProposal,
            contract
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to approve proposal" });
    }
};

// PUT /proposals/:id/reject (CLIENT ONLY)
export const rejectProposal = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.user;
        const { reviewNotes } = req.body;

        const proposal = await prisma.proposals.findUnique({
            where: { id },
            include: { job: true }
        });

        if (!proposal) return res.status(404).json({ error: "Proposal not found" });

        // Security: Only job owner can reject
        if (proposal.job.clientId !== userId && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: "Not authorized" });
        }

        if (proposal.status === 'ACCEPTED') {
            return res.status(400).json({ error: "Cannot reject an accepted proposal" });
        }

        const updatedProposal = await prisma.proposals.update({
            where: { id },
            data: {
                status: 'REJECTED',
                reviewNotes
            }
        });

        res.json(updatedProposal);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to reject proposal" });
    }
};
