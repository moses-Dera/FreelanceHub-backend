import express from 'express';
import { 
    registerUser,
    loginUser,
    logoutUser,
    refreshToken,
    deleteUser
} from '../controllers/userController.js';
import authorize from '../middlewares/authorize.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/refresh-token', refreshToken);
router.post('/delete/:id', authorize(['ADMIN']),  deleteUser);

export default router;
