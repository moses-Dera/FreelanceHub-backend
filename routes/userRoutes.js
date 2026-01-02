import express from 'express';
import { register, login, logout, getProfile, updateProfile } from '../controllers/userController.js';
import authorize from '../middlewares/authorize.js';

const router = express.Router();

// Auth routes (no authorization required)
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Profile routes (authorization required)
router.get('/profile', authorize(), getProfile);
router.put('/profile', authorize(), updateProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
