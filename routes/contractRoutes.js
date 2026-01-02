import express from 'express';
import { addContract, getContracts, getContractById } from '../controllers/contractController.js';
import authorize from '../middlewares/authorize.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Contracts
 *   description: Contract management
 */

/**
 * @swagger
 * /contracts:
 *   post:
 *     summary: Create a new contract
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - proposalId
 *               - jobId
 *               - freelancerId
 *               - startDate
 *               - endDate
 *             properties:
 *               proposalId:
 *                 type: string
 *               jobId:
 *                 type: integer
 *               freelancerId:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Contract created successfully
 *   get:
 *     summary: Get user's contracts
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of contracts
 */


// POST /api/contracts - Create a new contract (Authenticated)
router.post('/', authorize(), addContract);

// GET /api/contracts - Get contracts for user (Authenticated)
router.get('/', authorize(), getContracts);

// GET /api/contracts/:id - Get contract details
router.get('/:id', authorize(), getContractById);

export default router;
