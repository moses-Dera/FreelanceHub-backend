import express from 'express';
import { addContract, getContracts } from '../controllers/contractController.js';
import authorize from '../middlewares/authorize.js';

const router = express.Router();

// POST /api/contracts - Create a new contract (Authenticated)
router.post('/', authorize(), addContract);

// GET /api/contracts - Get contracts for user (Authenticated)
router.get('/', authorize(), getContracts);

export default router;
