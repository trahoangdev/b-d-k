import { Response } from 'express';
import { prisma } from '../database/connection';
import { AuthenticatedRequest, ApiResponse } from '../types';

export class FolderController {
  // Get all folders for user
  static async getFolders(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<Response<ApiResponse>> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      const folders = await prisma.folder.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      return res.json({
        success: true,
        message: 'Folders retrieved successfully',
        data: { folders },
      });
    } catch (error) {
      console.error('Get folders error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve folders',
      });
    }
  }

  // Create new folder
  static async createFolder(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<Response<ApiResponse>> {
    try {
      const userId = req.user?.id;
      const { name, description, parentId } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Folder name is required',
        });
      }

      // Check if parent folder exists and belongs to user
      if (parentId) {
        const parentFolder = await prisma.folder.findFirst({
          where: { id: parentId, userId },
        });

        if (!parentFolder) {
          return res.status(400).json({
            success: false,
            message: 'Parent folder not found',
          });
        }
      }

      // Generate folder path
      const folderPath = parentId 
        ? `${parentId}/${name.trim()}`
        : `/${name.trim()}`;

      const folder = await prisma.folder.create({
        data: {
          name: name.trim(),
          path: folderPath,
          description: description || null,
          parentId: parentId || null,
          userId,
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Folder created successfully',
        data: { folder },
      });
    } catch (error) {
      console.error('Create folder error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create folder',
      });
    }
  }

  // Update folder
  static async updateFolder(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<Response<ApiResponse>> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      const { name, description } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      const folder = await prisma.folder.findFirst({
        where: { id, userId },
      });

      if (!folder) {
        return res.status(404).json({
          success: false,
          message: 'Folder not found',
        });
      }

      const updatedFolder = await prisma.folder.update({
        where: { id },
        data: {
          name: name || folder.name,
          description: description !== undefined ? description : folder.description,
        },
      });

      return res.json({
        success: true,
        message: 'Folder updated successfully',
        data: { folder: updatedFolder },
      });
    } catch (error) {
      console.error('Update folder error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update folder',
      });
    }
  }

  // Delete folder
  static async deleteFolder(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<Response<ApiResponse>> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      const folder = await prisma.folder.findFirst({
        where: { id, userId },
        include: {
          children: true,
          files: true,
        },
      });

      if (!folder) {
        return res.status(404).json({
          success: false,
          message: 'Folder not found',
        });
      }

      // Check if folder has children or files
      if (folder.children.length > 0 || folder.files.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete folder with contents. Please remove all files and subfolders first.',
        });
      }

      await prisma.folder.delete({
        where: { id },
      });

      return res.json({
        success: true,
        message: 'Folder deleted successfully',
      });
    } catch (error) {
      console.error('Delete folder error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete folder',
      });
    }
  }

  // Get folder by ID
  static async getFolder(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<Response<ApiResponse>> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      const folder = await prisma.folder.findFirst({
        where: { id, userId },
        include: {
          children: true,
          files: true,
          parent: true,
        },
      });

      if (!folder) {
        return res.status(404).json({
          success: false,
          message: 'Folder not found',
        });
      }

      return res.json({
        success: true,
        message: 'Folder retrieved successfully',
        data: { folder },
      });
    } catch (error) {
      console.error('Get folder error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve folder',
      });
    }
  }
}
