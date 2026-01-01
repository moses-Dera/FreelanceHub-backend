import express from 'express'

import {
    addProposal,
    getJobProposals,
    getProposal
} from '../controllers/proposalController.js'

import authorize from '../middlewares/authorize.js';
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Proposals
 *   description: Proposal management
 */

/**
 * @swagger
 * /jobs/{id}/proposals:
 *   post:
 *     summary: Submit a proposal for a job
 *     tags: [Proposals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Job ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - coverLetter
 *               - expectedSalary
 *             properties:
 *               coverLetter:
 *                 type: string
 *               expectedSalary:
 *                 type: integer
 *               resumeUrl:
 *                 type: string
 *               portfolioLinks:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Proposal submitted successfully
 *       404:
 *         description: Job not found
 *   get:
 *     summary: Get all proposals for a job
 *     tags: [Proposals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Job ID
 *     responses:
 *       200:
 *         description: List of proposals
 */

/**
 * @swagger
 * /proposals/{id}:
 *   get:
 *     summary: Get proposal details
 *     tags: [Proposals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Proposal ID (UUID)
 *     responses:
 *       200:
 *         description: Proposal details
 *       404:
 *         description: Proposal not found
 */


// routes/proposalRoutes.js
router.get('/', (req, res) => {
    // Return empty list for now until controller implemented
    // Or better: redirect this logic to getJobProposals or similar if intended
    res.json([])
});
router.post('/jobs/:id/proposals', addProposal);
router.get('/jobs/:id/proposals', getJobProposals);
router.get('/proposals/:id', getProposal);

export default router;