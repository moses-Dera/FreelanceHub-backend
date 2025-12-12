import express from 'express'

import {
    addProposal,
    getJobProposals,
    getProposal
} from '../controllers/proposalController.js'

import authorize from '../middlewares/authorize.js';
const router = express.Router();

// routes/proposalRoutes.js
router.post('/jobs/:id/proposals', addProposal);
router.get('/jobs/:id/proposals', getJobProposals);  
router.get('/proposals/:id', getProposal);

export default router;