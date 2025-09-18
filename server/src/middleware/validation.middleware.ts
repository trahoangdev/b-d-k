import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ApiResponse } from '../types';

// Validation schemas
export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const createFolderSchema = z.object({
  name: z.string().min(1, 'Folder name is required'),
  parentId: z.string().optional(),
  description: z.string().optional(),
});

export const updateFolderSchema = z.object({
  name: z.string().min(1, 'Folder name is required').optional(),
  description: z.string().optional(),
});

export const updateFileSchema = z.object({
  name: z.string().min(1, 'File name is required').optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
});

export const createShareSchema = z.object({
  fileId: z.string().min(1, 'File ID is required'),
  expiresAt: z.string().datetime().optional(),
  password: z.string().optional(),
  maxDownloads: z.number().int().positive().optional(),
});

export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  type: z.enum(['file', 'folder', 'all']).optional(),
  folderId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  mimeType: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

export const paginationSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Validation middleware factory
export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response<ApiResponse>, next: NextFunction): void => {
    try {
      const validatedData = schema.parse({
        ...req.body,
        ...req.query,
        ...req.params,
      });

      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          success: false,
          message: 'Validation failed',
          data: errorMessages,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };
};

// File validation middleware
export const validateFile = (req: Request, res: Response<ApiResponse>, next: NextFunction): void => {
  if (!req.file) {
    res.status(400).json({
      success: false,
      message: 'No file provided',
    });
  }

  const maxSize = parseInt(process.env.MAX_FILE_SIZE || '2147483648'); // 2GB
  const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [];

  // Check file size
  if (req.file && req.file.size > maxSize) {
    res.status(400).json({
      success: false,
      message: `File size exceeds maximum limit of ${maxSize / (1024 * 1024 * 1024)}GB`,
    });
  }

  // Check file type
  const fileExtension = req.file?.originalname.split('.').pop()?.toLowerCase();
  if (fileExtension && !allowedTypes.includes(fileExtension)) {
    res.status(400).json({
      success: false,
      message: `File type .${fileExtension} is not allowed`,
    });
  }

  next();
};

// Multiple files validation middleware
export const validateFiles = (req: Request, res: Response<ApiResponse>, next: NextFunction): void => {
  if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
    res.status(400).json({
      success: false,
      message: 'No files provided',
    });
  }

  const files = Array.isArray(req.files) ? req.files : Object.values(req.files || {}).flat();
  const maxSize = parseInt(process.env.MAX_FILE_SIZE || '2147483648');
  const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [];
  const maxFiles = parseInt(process.env.MAX_FILES_PER_UPLOAD || '10');

  // Check number of files
  if (files.length > maxFiles) {
    res.status(400).json({
      success: false,
      message: `Maximum ${maxFiles} files allowed per upload`,
    });
  }

  // Validate each file
  for (const file of files) {
    // Check file size
    if (file.size > maxSize) {
      res.status(400).json({
        success: false,
        message: `File ${file.originalname} exceeds maximum size limit`,
      });
    }

    // Check file type
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
    if (fileExtension && !allowedTypes.includes(fileExtension)) {
      res.status(400).json({
        success: false,
        message: `File type .${fileExtension} is not allowed for ${file.originalname}`,
      });
    }
  }

  next();
};
