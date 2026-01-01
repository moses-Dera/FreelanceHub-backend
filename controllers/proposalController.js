import { prisma } from '../lib/prisma.ts';

// POST /jobs/:id/proposals
const addProposal = async (req, res) => {
    try {
        const { id: jobId } = req.params;
        const { userId } = req.user; // from auth middleware
        const {
            coverLetter,
            expectedSalary, 
            resumeUrl,
            portfolioLinks,
            attachments
        } = req.body;
        
        const proposal = await prisma.Proposals.create({
            data:{
                jobId: parseInt(jobId),
                userId,
                coverLetter,
                expectedSalary, 
                resumeUrl,
                portfolioLinks,
                attachments
            }
        });
        res.status(201).json({message: "Proposal added successfully", proposal});

    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

// GET /jobs/:id/proposals
const getJobProposals = async (req, res) => {
    try {
        const { id: jobId } = req.params;
        const proposals = await prisma.Proposals.findMany({
            where: { jobId: parseInt(jobId) },
            include: {
                user: {
                    select: { id: true, fullName: true, email: true, rating: true }
                }
            }
        });
        res.status(200).json(proposals);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

// GET /proposals/:id
const getProposal = async (req, res) => {
    try {
        const { id } = req.params;
        const proposal = await prisma.Proposals.findUnique({
            where: { id },
            include: {
                user: {
                    select: { id: true, fullName: true, email: true, rating: true }
                },
                job: {
                    select: { id: true, title: true, description: true, budgetMin: true, budgetMax: true }
                }
            }
        });
        
        if (!proposal) {
            return res.status(404).json({error: "Proposal not found"});
        }
        
        res.status(200).json(proposal);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

export {
    addProposal,
    getJobProposals,
    getProposal
}