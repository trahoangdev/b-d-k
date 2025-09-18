const API_BASE_URL = 'http://localhost:3001/api';

// Types
export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface File {
  id: string;
  name: string;
  original_name: string;
  size: string;
  mime_type: string;
  extension: string;
  description?: string;
  tags?: string[];
  is_public: boolean;
  uploaded_at: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

// API Client class
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data?.token) {
      this.token = response.data.token;
      localStorage.setItem('auth_token', this.token);
    }

    return response;
  }

  async logout(): Promise<void> {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>('/auth/profile');
  }

  // File methods
  async getFiles(): Promise<ApiResponse<{ files: File[] }>> {
    return this.request<{ files: File[] }>('/files');
  }

  async uploadFile(file: globalThis.File, onProgress?: (progress: number) => void): Promise<ApiResponse<{ file: File }>> {
    const formData = new FormData();
    formData.append('file', file as Blob);

    const url = `${this.baseURL}/files/upload`;
    
    const headers: Record<string, string> = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Invalid response format'));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.message || 'Upload failed'));
          } catch {
            reject(new Error('Upload failed'));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error'));
      });

      xhr.open('POST', url);
      
      // Set headers
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });

      xhr.send(formData);
    });
  }

  async downloadFile(fileId: string): Promise<void> {
    const url = `${this.baseURL}/files/${fileId}/download`;
    
    const headers: Record<string, string> = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error('Download failed');
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

  async deleteFile(fileId: string): Promise<ApiResponse> {
    return this.request(`/files/${fileId}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return this.request('/health');
  }
}

// Create and export API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export individual methods for convenience
export const authApi = {
  login: (credentials: LoginRequest) => apiClient.login(credentials),
  logout: () => apiClient.logout(),
  getProfile: () => apiClient.getProfile(),
};

export const fileApi = {
  getFiles: () => apiClient.getFiles(),
  uploadFile: (file: globalThis.File, onProgress?: (progress: number) => void) => 
    apiClient.uploadFile(file, onProgress),
  downloadFile: (fileId: string) => apiClient.downloadFile(fileId),
  deleteFile: (fileId: string) => apiClient.deleteFile(fileId),
};

export const systemApi = {
  healthCheck: () => apiClient.healthCheck(),
};
