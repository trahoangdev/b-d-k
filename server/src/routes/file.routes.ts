import { Router } from 'express';
import multer from 'multer';
import { FileController } from '../controllers/file.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateFile, validateFiles, validate } from '../middleware/validation.middleware';
import { updateFileSchema } from '../middleware/validation.middleware';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '2147483648'), // 2GB
  },
});

// All routes require authentication
router.use(authenticateToken);

// File upload routes
router.post('/upload', upload.single('file'), validateFile, FileController.uploadFile);
router.post('/upload-multiple', upload.array('files', 10), validateFiles, FileController.uploadFiles);

// File management routes
router.get('/', FileController.getFiles);
router.get('/:id', FileController.getFile);
router.put('/:id', validate(updateFileSchema), FileController.updateFile);
router.put('/:id/move', FileController.moveFile);
router.delete('/:id', FileController.deleteFile);

// File download route
router.get('/:id/download', FileController.downloadFile);

export default router;
