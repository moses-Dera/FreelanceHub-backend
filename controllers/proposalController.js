import { prisma } from '../lib/prisma.js';
import sendEmail from '../utils/email.js';

// POST /jobs/:id/proposals
export const addProposal = async (req, res) => {
    try {
        const { id: jobId } = req.params;
        const { userId } = req.user;
        const { coverLetter, expectedSalary, resumeUrl, portfolioLinks, attachments } = req.body;

        // Check if job exists
        const job = await prisma.jobs.findUnique({
            where: { id: parseInt(jobId) },
            include: { client: { select: { email: true } } }
        });
        if (!job) return res.status(404).json({ error: "Job not found" });

        // Check if job is open
        if (job.status !== 'OPEN') return res.status(400).json({ error: "Job is not open" });

        // Check if already applied
        const existing = await prisma.proposals.findFirst({
            where: { jobId: parseInt(jobId), userId }
        });
        if (existing) return res.status(400).json({ error: "Already applied to this job" });

        const proposal = await prisma.proposals.create({
            data: {
                jobId: parseInt(jobId),
                userId,
                coverLetter,
                expectedSalary: expectedSalary ? parseInt(expectedSalary) : undefined,
                resumeUrl,
                portfolioLinks,
                attachments,
                status: 'PENDING'
            }
        });

        // Notify Client
        await prisma.notifications.create({
            data: {
                userId: job.clientId,
                type: 'PROPOSAL_RECEIVED',
                payload: {
                    jobId: job.id,
                    jobTitle: job.title,
                    proposalId: proposal.id,
                    freelancerId: userId
                }
            }
        });

        // Send Email to Client
        if (job.client && job.client.email) {
            await sendEmail({
                to: job.client.email,
                subject: `New Proposal for ${job.title}`,
                text: `You have received a new proposal for your job "${job.title}". Log in to view details.`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #2563eb;">New Proposal Received!</h2>
                        <p>Hi,</p>
                        <p>You have received a new proposal for your job "<strong>${job.title}</strong>".</p>
                        <p>Log in to your dashboard to review the proposal and candidate details.</p>
                        <br>
                        <a href="${process.env.frontend_url || 'http://localhost:3000'}/dashboard/client/jobs/${jobId}/proposals" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Proposal</a>
                    </div>
                `
            });
        }

        res.status(201).json(proposal);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to submit proposal" });
    }
};

// GET /jobs/:id/proposals (CLIENT ONLY)
export const getJobProposals = async (req, res) => {
    try {
        const { id: jobId } = req.params;
        const { userId } = req.user;

        const job = await prisma.jobs.findUnique({ where: { id: parseInt(jobId) } });
        if (!job) return res.status(404).json({ error: "Job not found" });

        // Security check: Only job owner can view all proposals
        // ADMIN can also view
        if (job.clientId !== userId && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: "Not authorized" });
        }

        const proposals = await prisma.proposals.findMany({
            where: { jobId: parseInt(jobId) },
            include: {
                user: {
                    select: { id: true, firstName: true, lastName: true, email: true, rating: true }
                }
            }
        });

        res.json(proposals);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch proposals" });
    }
};

// GET /proposals/me (FREELANCER)
export const getMyProposals = async (req, res) => {
    try {
        const { userId } = req.user;

        const proposals = await prisma.proposals.findMany({
            where: { userId },
            include: {
                job: {
                    select: { id: true, title: true, status: true, budgetMin: true, budgetMax: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(proposals);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch your proposals" });
    }
};

// GET /proposals (CLIENT - All proposals across their jobs)
export const getAllClientProposals = async (req, res) => {
    try {
        const { userId } = req.user;

        // Find all jobs owned by this client
        const proposals = await prisma.proposals.findMany({
            where: {
                job: {
                    clientId: userId
                }
            },
            include: {
                job: {
                    select: { id: true, title: true }
                },
                user: {
                    select: { id: true, firstName: true, lastName: true, email: true, rating: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(proposals);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch proposals" });
    }
};

// GET /proposals/:id
export const getProposal = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.user;

        const proposal = await prisma.proposals.findUnique({
            where: { id },
            include: {
                job: { include: { client: { select: { id: true, firstName: true } } } },
                user: { select: { id: true, firstName: true, lastName: true } }
            }
        });

        if (!proposal) return res.status(404).json({ error: "Proposal not found" });

        // Access control: Owner of proposal OR Owner of Job OR Admin
        if (proposal.userId !== userId && proposal.job.clientId !== userId && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: "Not authorized" });
        }

        res.json(proposal);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch proposal" });
    }
};