import { Router } from 'express';
import { login, register, getMe, resetPassword } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);

export default router;
