import express from 'express';
import { getNotifications, markAsRead } from '../controllers/notificationController.js';
import authorize from '../middlewares/authorize.js';

const router = express.Router();

router.get('/', authorize(), getNotifications);
router.put('/:id/read', authorize(), markAsRead);

export default router;