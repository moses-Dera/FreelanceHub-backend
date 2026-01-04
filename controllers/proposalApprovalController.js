import { prisma } from '../lib/prisma.js';
import sendEmail from '../utils/email.js';

// PUT /proposals/:id/approve (CLIENT ONLY)
export const approveProposal = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.user;

        // Find the proposal with job details and freelancer details
        const proposal = await prisma.proposals.findUnique({
            where: { id },
            include: {
                job: true,
                user: { select: { email: true, firstName: true } }
            }
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

        // Notify Freelancer
        await prisma.notifications.create({
            data: {
                userId: proposal.userId, // Freelancer
                type: 'CONTRACT_CREATED',
                payload: {
                    jobId: proposal.jobId,
                    contractId: contract.id,
                    clientName: `${req.user.firstName} ${req.user.lastName}`
                }
            }
        });

        // Send Email to Freelancer
        if (proposal.user && proposal.user.email) {
            await sendEmail({
                to: proposal.user.email,
                subject: `Proposal Accepted: ${proposal.job.title}`,
                text: `Congratulations! Your proposal for "${proposal.job.title}" has been accepted. Log in to start working.`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #16a34a;">Proposal Accepted!</h2>
                        <p>Hi ${proposal.user.firstName},</p>
                        <p>Congratulations! Your proposal for "<strong>${proposal.job.title}</strong>" has been accepted.</p>
                        <p>A new contract has been created. Log in to your dashboard to view the details.</p>
                        <br>
                        <a href="${process.env.frontend_url || 'http://localhost:3000'}/dashboard/freelancer/contracts" style="background-color: #16a34a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Contract</a>
                    </div>
                `
            });
        }

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
