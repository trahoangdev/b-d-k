import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { z } from 'zod';

const router = Router();

// Apply auth middleware to all routes
router.use(authenticateToken);

// Validation schemas
const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username too long'),
  firstName: z.string().min(1, 'First name is required').max(100, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(100, 'Last name too long'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['USER', 'EDITOR', 'ADMIN']).optional(),
});

const updateUserSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username too long').optional(),
  firstName: z.string().min(1, 'First name is required').max(100, 'First name too long').optional(),
  lastName: z.string().min(1, 'Last name is required').max(100, 'Last name too long').optional(),
  role: z.enum(['USER', 'EDITOR', 'ADMIN']).optional(),
  isActive: z.boolean().optional(),
});

const userIdSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
});

// Routes
router.get('/', UserController.getUsers);
router.post('/', validate(createUserSchema), UserController.createUser);
router.put('/:id', validate(updateUserSchema), UserController.updateUser);
router.delete('/:id', validate(userIdSchema), UserController.deleteUser);
router.patch('/:id/toggle-status', validate(userIdSchema), UserController.toggleUserStatus);

export default router;
