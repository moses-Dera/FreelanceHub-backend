import express from 'express';
import { addProposal, getJobProposals, getProposal } from '../controllers/proposalController.js';

const router = express.Router();

// POST /jobs/:id/proposals - Submit proposal for a job
router.post('/jobs/:id/proposals', addProposal);

// GET /jobs/:id/proposals - Get all proposals for a job
router.get('/jobs/:id/proposals', getJobProposals);

// GET /proposals/:id - Get specific proposal details
router.get('/proposals/:id', getProposal);

export default router;