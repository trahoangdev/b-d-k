import { Request } from 'express';
import { User } from '@prisma/client';

// Extend Express Request to include user
export interface AuthenticatedRequest extends Request {
  user?: User;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// File upload types
export interface FileUploadResult {
  id: string;
  name: string;
  originalName: string;
  path: string;
  size: number;
  mimeType: string;
  hash: string;
  uploadedAt: Date;
}

export interface FileUploadRequest {
  file: Express.Multer.File;
  folderId?: string;
  description?: string;
  tags?: string[];
  isPublic?: boolean;
}

// User types
export interface CreateUserRequest {
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

// Folder types
export interface CreateFolderRequest {
  name: string;
  parentId?: string;
  description?: string;
}

export interface UpdateFolderRequest {
  name?: string;
  description?: string;
}

// File types
export interface UpdateFileRequest {
  name?: string;
  description?: string;
  tags?: string[];
  isPublic?: boolean;
}

// Share types
export interface CreateShareRequest {
  fileId: string;
  expiresAt?: Date;
  password?: string;
  maxDownloads?: number;
}

// Analytics types
export interface AnalyticsEvent {
  type: 'FILE_UPLOAD' | 'FILE_DOWNLOAD' | 'FILE_DELETE' | 'FILE_SHARE' | 'USER_LOGIN' | 'USER_LOGOUT' | 'FOLDER_CREATE' | 'FOLDER_DELETE' | 'SYSTEM_EVENT';
  action: string;
  details?: any;
  userId?: string;
  fileId?: string;
}

// Search types
export interface SearchRequest {
  query: string;
  type?: 'file' | 'folder' | 'all';
  folderId?: string;
  tags?: string[];
  mimeType?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
}

// Dashboard types
export interface DashboardStats {
  totalFiles: number;
  totalFolders: number;
  totalSize: number;
  recentUploads: FileUploadResult[];
  storageUsage: {
    used: number;
    available: number;
    percentage: number;
  };
  userActivity: {
    uploads: number;
    downloads: number;
    shares: number;
  };
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Error types
export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

// JWT Payload
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// File validation types
export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// System configuration types
export interface SystemConfig {
  maxFileSize: number;
  allowedFileTypes: string[];
  maxFilesPerUpload: number;
  storageQuota: number;
  maintenanceMode: boolean;
}
