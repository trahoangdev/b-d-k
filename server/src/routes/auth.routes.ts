import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createUserSchema, loginSchema } from '../middleware/validation.middleware';

const router = Router();

// Public routes
router.post('/register', validate(createUserSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);

// Protected routes
router.get('/profile', authenticateToken, AuthController.getProfile);
router.put('/profile', authenticateToken, AuthController.updateProfile);
router.post('/logout', authenticateToken, AuthController.logout);

export default router;
