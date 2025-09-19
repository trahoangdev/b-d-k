import { Response } from 'express';
import { prisma } from '../database/connection';
import { AuthenticatedRequest, ApiResponse } from '../types';
import bcrypt from 'bcryptjs';

export class UserController {
  static async getUsers(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<Response<ApiResponse>> {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      // Check if user is admin
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });

      if (!currentUser || currentUser.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin role required.',
        });
      }

      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return res.json({
        success: true,
        message: 'Users retrieved successfully',
        data: { users },
      });
    } catch (error) {
      console.error('Get users error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve users',
      });
    }
  }

  static async createUser(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<Response<ApiResponse>> {
    try {
      const userId = req.user?.id;
      const { email, username, firstName, lastName, password, role } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      // Check if user is admin
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });

      if (!currentUser || currentUser.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin role required.',
        });
      }

      // Validate required fields
      if (!email || !username || !firstName || !lastName || !password) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required',
        });
      }

      // Check if email already exists
      const existingEmail = await prisma.user.findUnique({
        where: { email }
      });

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists',
        });
      }

      // Check if username already exists
      const existingUsername = await prisma.user.findUnique({
        where: { username }
      });

      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: 'Username already exists',
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          username,
          firstName,
          lastName,
          password: hashedPassword,
          role: role || 'USER',
          isActive: true,
        },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        }
      });

      return res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: { user },
      });
    } catch (error) {
      console.error('Create user error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create user',
      });
    }
  }

  static async updateUser(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<Response<ApiResponse>> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      const { email, username, firstName, lastName, role, isActive } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      // Check if user is admin
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });

      if (!currentUser || currentUser.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin role required.',
        });
      }

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id }
      });

      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Check if email already exists (if changed)
      if (email && email !== existingUser.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email }
        });

        if (emailExists) {
          return res.status(400).json({
            success: false,
            message: 'Email already exists',
          });
        }
      }

      // Check if username already exists (if changed)
      if (username && username !== existingUser.username) {
        const usernameExists = await prisma.user.findUnique({
          where: { username }
        });

        if (usernameExists) {
          return res.status(400).json({
            success: false,
            message: 'Username already exists',
          });
        }
      }

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          ...(email && { email }),
          ...(username && { username }),
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(role && { role }),
          ...(isActive !== undefined && { isActive }),
        },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        }
      });

      return res.json({
        success: true,
        message: 'User updated successfully',
        data: { user: updatedUser },
      });
    } catch (error) {
      console.error('Update user error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update user',
      });
    }
  }

  static async deleteUser(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<Response<ApiResponse>> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      // Check if user is admin
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });

      if (!currentUser || currentUser.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin role required.',
        });
      }

      // Prevent self-deletion
      if (userId === id) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete your own account',
        });
      }

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id }
      });

      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Delete user
      await prisma.user.delete({
        where: { id }
      });

      return res.json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      console.error('Delete user error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete user',
      });
    }
  }

  static async toggleUserStatus(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<Response<ApiResponse>> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      // Check if user is admin
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });

      if (!currentUser || currentUser.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin role required.',
        });
      }

      // Prevent self-deactivation
      if (userId === id) {
        return res.status(400).json({
          success: false,
          message: 'Cannot deactivate your own account',
        });
      }

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id }
      });

      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Toggle user status
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          isActive: !existingUser.isActive,
        },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        }
      });

      return res.json({
        success: true,
        message: `User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`,
        data: { user: updatedUser },
      });
    } catch (error) {
      console.error('Toggle user status error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to toggle user status',
      });
    }
  }
}
