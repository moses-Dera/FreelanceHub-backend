
import express from 'express';
import { getDashboardStats, getRecentActivity } from '../controllers/adminController.js';
import authorize from '../middlewares/authorize.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin dashboard and management
 */

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
router.get('/stats', authorize(['ADMIN']), getDashboardStats);

/**
 * @swagger
 * /admin/activity:
 *   get:
 *     summary: Get recent platform activity
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent activity list
 */
router.get('/activity', authorize(['ADMIN']), getRecentActivity);

export default router;
