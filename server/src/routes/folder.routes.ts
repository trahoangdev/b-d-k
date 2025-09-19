import { Router } from 'express';
import { FolderController } from '../controllers/folder.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { z } from 'zod';

const router = Router();

// Apply auth middleware to all routes
router.use(authenticateToken);

// Validation schemas
const createFolderSchema = z.object({
  name: z.string().min(1, 'Folder name is required').max(100, 'Folder name too long'),
  description: z.string().optional(),
  parentId: z.string().optional(),
});

const updateFolderSchema = z.object({
  name: z.string().min(1, 'Folder name is required').max(100, 'Folder name too long').optional(),
  description: z.string().optional(),
});

const folderIdSchema = z.object({
  id: z.string().min(1, 'Folder ID is required'),
});

// Routes
router.get('/', FolderController.getFolders);
router.post('/', validate(createFolderSchema), FolderController.createFolder);
router.get('/:id', validate(folderIdSchema), FolderController.getFolder);
router.put('/:id', validate(updateFolderSchema), FolderController.updateFolder);
router.delete('/:id', validate(folderIdSchema), FolderController.deleteFolder);

export default router;
