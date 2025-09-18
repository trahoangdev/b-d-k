import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { prisma } from '../database/connection';
import { ApiResponse, CreateUserRequest, LoginRequest, AuthenticatedRequest } from '../types';

export class AuthController {
  // Register new user
  static async register(req: Request<object, ApiResponse, CreateUserRequest>, res: Response<ApiResponse>): Promise<Response<ApiResponse>> {
    try {
      const { email, username, firstName, lastName, password } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { username },
          ],
        },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email or username already exists',
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS || '12'));

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          username,
          firstName,
          lastName,
          password: hashedPassword,
        },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          avatar: true,
          role: true,
          createdAt: true,
        },
      });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
      );

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user,
          token,
        },
      });
    } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  // Login user
  static async login(req: Request<object, ApiResponse, LoginRequest>, res: Response<ApiResponse>): Promise<Response<ApiResponse>> {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
      );

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: userWithoutPassword,
          token,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  // Get current user profile
  static async getProfile(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<Response<ApiResponse>> {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      // Get user stats
      const [fileCount, folderCount, totalSize] = await Promise.all([
        prisma.file.count({ where: { userId: user.id } }),
        prisma.folder.count({ where: { userId: user.id } }),
        prisma.file.aggregate({
          where: { userId: user.id },
          _sum: { size: true },
        }),
      ]);

      return res.json({
        success: true,
        message: 'Profile retrieved successfully',
        data: {
          user,
          stats: {
            fileCount,
            folderCount,
            totalSize: totalSize._sum.size || 0,
          },
        },
      });
    } catch (error) {
      console.error('Get profile error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  // Update user profile
  static async updateProfile(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<Response<ApiResponse>> {
    try {
      const userId = req.user?.id;
      const { firstName, lastName, avatar } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          firstName,
          lastName,
          avatar,
        },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          avatar: true,
          role: true,
          updatedAt: true,
        },
      });

      return res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user: updatedUser },
      });
    } catch (error) {
      console.error('Update profile error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  // Logout (client-side token removal)
  static async logout(req: Request, res: Response<ApiResponse>): Promise<Response<ApiResponse>> {
    return res.json({
      success: true,
      message: 'Logout successful',
    });
  }
}
