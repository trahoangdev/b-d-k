const { Client } = require('minio');
const crypto = require('crypto');

class MinIOService {
  constructor() {
    this.client = new Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9000'),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    });

    this.bucketName = process.env.MINIO_BUCKET || 'big-data-keeper';
    this.initializeBucket();
  }

  async initializeBucket() {
    try {
      const exists = await this.client.bucketExists(this.bucketName);
      if (!exists) {
        await this.client.makeBucket(this.bucketName, 'us-east-1');
        console.log(`✅ Created bucket: ${this.bucketName}`);
      } else {
        console.log(`✅ Bucket exists: ${this.bucketName}`);
      }
    } catch (error) {
      console.error('❌ Error initializing bucket:', error.message);
    }
  }

  // Upload file
  async uploadFile(file, folder = 'uploads') {
    try {
      const fileHash = crypto.createHash('sha256').update(file.buffer).digest('hex');
      const fileName = `${fileHash}_${file.originalname}`;
      const filePath = `${folder}/${fileName}`;

      const result = await this.client.putObject(
        this.bucketName,
        filePath,
        file.buffer,
        file.size,
        {
          'Content-Type': file.mimetype,
          'X-File-Hash': fileHash,
          'X-Original-Name': file.originalname,
        }
      );

      return {
        path: filePath,
        hash: fileHash,
        size: file.size,
        etag: result.etag
      };
    } catch (error) {
      console.error('❌ Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  }

  // Download file
  async downloadFile(filePath) {
    try {
      return await this.client.getObject(this.bucketName, filePath);
    } catch (error) {
      console.error('❌ Error downloading file:', error);
      throw new Error('File not found');
    }
  }

  // Delete file
  async deleteFile(filePath) {
    try {
      await this.client.removeObject(this.bucketName, filePath);
    } catch (error) {
      console.error('❌ Error deleting file:', error);
      throw new Error('Failed to delete file');
    }
  }

  // Get file info
  async getFileInfo(filePath) {
    try {
      const stat = await this.client.statObject(this.bucketName, filePath);
      return {
        size: stat.size,
        lastModified: stat.lastModified,
        etag: stat.etag,
        contentType: stat.metaData['content-type'],
        hash: stat.metaData['x-file-hash'],
        originalName: stat.metaData['x-original-name'],
      };
    } catch (error) {
      console.error('❌ Error getting file info:', error);
      throw new Error('File not found');
    }
  }

  // Generate presigned URL for download
  async getPresignedUrl(filePath, expiresIn = 3600) {
    try {
      return await this.client.presignedGetObject(this.bucketName, filePath, expiresIn);
    } catch (error) {
      console.error('❌ Error generating presigned URL:', error);
      throw new Error('Failed to generate download URL');
    }
  }

  // Check if file exists
  async fileExists(filePath) {
    try {
      await this.client.statObject(this.bucketName, filePath);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get storage usage
  async getStorageUsage() {
    try {
      const objects = [];
      const stream = this.client.listObjects(this.bucketName, '', true);
      
      return new Promise((resolve, reject) => {
        stream.on('data', (obj) => objects.push(obj));
        stream.on('error', reject);
        stream.on('end', () => {
          const totalSize = objects.reduce((sum, obj) => sum + obj.size, 0);
          const fileCount = objects.length;
          resolve({ totalSize, fileCount });
        });
      });
    } catch (error) {
      console.error('❌ Error getting storage usage:', error);
      throw new Error('Failed to get storage usage');
    }
  }
}

module.exports = new MinIOService();
