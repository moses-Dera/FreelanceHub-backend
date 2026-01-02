import express from 'express';
import {
    addJob,
    getSingleJob,
    getJobs,
    updateJob,
    deleteJob
} from '../controllers/jobController.js'
import authorize from '../middlewares/authorize.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Job attributes and management
 */

/**
 * @swagger
 * /jobs/add:
 *   post:
 *     summary: Post a new job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - budgetMin
 *               - budgetMax
 *               - deadline
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               budgetMin:
 *                 type: string
 *               budgetMax:
 *                 type: string
 *               deadline:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Job added successfully
 *       403:
 *         description: Not authorized
 */

/**
 * @swagger
 * /jobs:
 *   get:
 *     summary: Get all jobs
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title or description
 *     responses:
 *       200:
 *         description: List of jobs
 */


router.post('/', authorize(['ADMIN', 'CLIENT']), addJob);
router.get('/:id', getSingleJob);
router.get('/', authorize(), getJobs);
router.put('/:id', authorize(['ADMIN', 'CLIENT']), updateJob);
router.delete('/:id', authorize(['ADMIN', 'CLIENT']), deleteJob);

export default router;