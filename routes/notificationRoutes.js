import express from 'express';
import {
    getNotifications,
    markAsRead,
    markAllAsRead
} from '../controllers/notificationController.js';
import authorize from '../middlewares/authorize.js';

const router = express.Router();

router.get('/', authorize(), getNotifications);
router.put('/:id/read', authorize(), markAsRead);
router.put('/read-all', authorize(), markAllAsRead);

export default router;
