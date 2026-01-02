import express from 'express';
import {
    addProposal,
    getJobProposals,
    getProposal,
    getMyProposals,
    getAllClientProposals
} from '../controllers/proposalController.js';
import authorize from '../middlewares/authorize.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Proposals
 *   description: Proposal management
 */

router.post('/jobs/:id/proposals', authorize(['FREELANCER']), addProposal);
router.get('/jobs/:id/proposals', authorize(['CLIENT', 'ADMIN']), getJobProposals);
router.get('/proposals/me', authorize(['FREELANCER']), getMyProposals);
router.get('/proposals', authorize(['CLIENT', 'ADMIN']), getAllClientProposals);
router.get('/proposals/:id', authorize(), getProposal);

export default router;