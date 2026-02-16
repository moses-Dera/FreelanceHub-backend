import express from 'express';
import { register, login, logout, getProfile, updateProfile, forgotPassword, resetPassword, getAllUsers, deleteUser } from '../controllers/userController.js';
import authorize from '../middlewares/authorize.js';

const router = express.Router();

// Auth routes (no authorization required)
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Profile routes (authorization required)
router.get('/profile', authorize(), getProfile);
router.put('/profile', authorize(), updateProfile);

// Admin routes
router.get('/', authorize(['ADMIN']), getAllUsers);
router.delete('/:id', authorize(['ADMIN']), deleteUser);

export default router;
