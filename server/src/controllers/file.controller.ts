import { Response } from 'express';
import { prisma } from '../database/connection';
import { minioService } from '../services/minio.service';
import { AuthenticatedRequest, ApiResponse, PaginationParams } from '../types';

export class FileController {
  // Upload single file
  static async uploadFile(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<Response<ApiResponse>> {
    try {
      const userId = req.user?.id;
      const { folderId, description, tags, isPublic } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file provided',
        });
      }

      // Upload to MinIO
      const uploadResult = await minioService.uploadFile(req.file, 'uploads');

      // Save to database
      const file = await prisma.file.create({
        data: {
          name: req.file.originalname,
          originalName: req.file.originalname,
          path: uploadResult.path,
          size: uploadResult.size,
          mimeType: req.file.mimetype,
          extension: req.file.originalname.split('.').pop() || '',
          hash: uploadResult.hash,
          description,
          tags: tags || [],
          isPublic: isPublic || false,
          folderId: folderId || null,
          userId,
        },
        include: {
          folder: true,
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      // Convert BigInt to string for JSON serialization
      const serializedFile = {
        ...file,
        size: file.size.toString(),
      };

      return res.status(201).json({
        success: true,
        message: 'File uploaded successfully',
        data: { file: serializedFile },
      });
    } catch (error) {
      console.error('Upload file error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload file',
      });
    }
  }

  // Upload multiple files
  static async uploadFiles(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<Response<ApiResponse>> {
    try {
      const userId = req.user?.id;
      const { folderId, description, tags, isPublic } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
        return res.status(400).json({
          success: false,
          message: 'No files provided',
        });
      }

      const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
      const uploadedFiles = [];

      for (const file of files) {
        try {
          // Upload to MinIO
          const uploadResult = await minioService.uploadFile(file, 'uploads');

          // Save to database
          const dbFile = await prisma.file.create({
            data: {
              name: file.originalname,
              originalName: file.originalname,
              path: uploadResult.path,
              size: uploadResult.size,
              mimeType: file.mimetype,
              extension: file.originalname.split('.').pop() || '',
              hash: uploadResult.hash,
              description,
              tags: tags || [],
              isPublic: isPublic || false,
              folderId: folderId || null,
              userId,
            },
            include: {
              folder: true,
            },
          });

          uploadedFiles.push(dbFile);
        } catch (error) {
          console.error(`Error uploading file ${file.originalname}:`, error);
        }
      }

      // Convert BigInt to string for JSON serialization
      const serializedFiles = uploadedFiles.map(file => ({
        ...file,
        size: file.size.toString(),
      }));

      return res.status(201).json({
        success: true,
        message: `${uploadedFiles.length} files uploaded successfully`,
        data: { files: serializedFiles },
      });
    } catch (error) {
      console.error('Upload files error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload files',
      });
    }
  }

  // Get user files
  static async getFiles(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<Response<ApiResponse>> {
    try {
      console.log('🔍 getFiles called with userId:', req.user?.id);
      const userId = req.user?.id;
      const { page = 1, limit = 20, folderId, search, sortBy = 'uploadedAt', sortOrder = 'desc' } = req.query;

      if (!userId) {
        console.log('❌ No userId found');
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      const skip = (Number(page) - 1) * Number(limit);
      const where: Record<string, unknown> = { userId };

      if (folderId) {
        where.folderId = folderId;
      }

      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { originalName: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      console.log('🔍 Querying files with where clause:', where);
      
      // Fix orderBy - use proper field name and type
      const orderByField = sortBy === 'uploadedAt' ? 'uploadedAt' : 'uploadedAt';
      const orderByClause = { [orderByField]: sortOrder as 'asc' | 'desc' };
      
      console.log('🔍 Order by clause:', orderByClause);
      
      const [files, total] = await Promise.all([
        prisma.file.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: orderByClause,
          include: {
            folder: true,
          },
        }),
        prisma.file.count({ where }),
      ]);
      console.log('📁 Found files:', files.length, 'total:', total);

      // Convert BigInt to string for JSON serialization
      const serializedFiles = files.map(file => ({
        ...file,
        size: file.size.toString(),
      }));

      return res.json({
        success: true,
        message: 'Files retrieved successfully',
        data: { files: serializedFiles },
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      console.error('Get files error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve files',
      });
    }
  }

  // Get file by ID
  static async getFile(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<Response<ApiResponse>> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      const file = await prisma.file.findFirst({
        where: {
          id,
          OR: [
            { userId },
            { isPublic: true },
          ],
        },
        include: {
          folder: true,
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'File not found',
        });
      }

      // Convert BigInt to string for JSON serialization
      const serializedFile = {
        ...file,
        size: file.size.toString(),
      };

      return res.json({
        success: true,
        message: 'File retrieved successfully',
        data: { file: serializedFile },
      });
    } catch (error) {
      console.error('Get file error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve file',
      });
    }
  }

  // Download file
  static async downloadFile(req: AuthenticatedRequest, res: Response): Promise<Response | void> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      const file = await prisma.file.findFirst({
        where: {
          id,
          OR: [
            { userId },
            { isPublic: true },
          ],
        },
      });

      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'File not found',
        });
      }

      // Get file stream from MinIO
      const fileStream = await minioService.downloadFile(file.path);

      // Set response headers
      res.setHeader('Content-Type', file.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
      res.setHeader('Content-Length', file.size.toString());

      // Pipe file stream to response
      fileStream.pipe(res);

      // Log download analytics
      await prisma.analytics.create({
        data: {
          type: 'FILE_DOWNLOAD',
          action: 'download',
          userId,
          fileId: file.id,
          details: {
            fileName: file.name,
            fileSize: file.size.toString(),
          },
        },
      });
    } catch (error) {
      console.error('Download file error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to download file',
      });
    }
  }

  // Update file
  static async updateFile(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<Response<ApiResponse>> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      const { name, description, tags, isPublic } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      const file = await prisma.file.findFirst({
        where: { id, userId },
      });

      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'File not found',
        });
      }

      const updatedFile = await prisma.file.update({
        where: { id },
        data: {
          name: name || file.name,
          description,
          tags: tags || file.tags,
          isPublic: isPublic !== undefined ? isPublic : file.isPublic,
        },
        include: {
          folder: true,
        },
      });

      // Convert BigInt to string for JSON serialization
      const serializedFile = {
        ...updatedFile,
        size: updatedFile.size.toString(),
      };

      return res.json({
        success: true,
        message: 'File updated successfully',
        data: { file: serializedFile },
      });
    } catch (error) {
      console.error('Update file error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update file',
      });
    }
  }

  // Move file to folder
  static async moveFile(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<Response<ApiResponse>> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      const { folderId } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      const file = await prisma.file.findFirst({
        where: { id, userId },
      });

      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'File not found',
        });
      }

      // Check if target folder exists and belongs to user
      if (folderId) {
        const folder = await prisma.folder.findFirst({
          where: { id: folderId, userId },
        });

        if (!folder) {
          return res.status(400).json({
            success: false,
            message: 'Target folder not found',
          });
        }
      }

      // Update file folder
      const updatedFile = await prisma.file.update({
        where: { id },
        data: {
          folderId: folderId || null,
        },
        include: {
          folder: true,
        },
      });

      // Convert BigInt to string for JSON serialization
      const serializedFile = {
        ...updatedFile,
        size: updatedFile.size.toString(),
      };

      return res.json({
        success: true,
        message: 'File moved successfully',
        data: { file: serializedFile },
      });
    } catch (error) {
      console.error('Move file error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to move file',
      });
    }
  }

  // Delete file
  static async deleteFile(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<Response<ApiResponse>> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      const file = await prisma.file.findFirst({
        where: { id, userId },
      });

      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'File not found',
        });
      }

      // Delete from MinIO
      await minioService.deleteFile(file.path);

      // Delete from database
      await prisma.file.delete({
        where: { id },
      });

      return res.json({
        success: true,
        message: 'File deleted successfully',
      });
    } catch (error) {
      console.error('Delete file error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete file',
      });
    }
  }
}
