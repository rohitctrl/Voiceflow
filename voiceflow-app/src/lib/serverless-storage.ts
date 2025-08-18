/**
 * Serverless-compatible storage utilities for Netlify deployment
 * Handles file uploads using temporary storage and external services
 */

export interface UploadResult {
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export class ServerlessStorage {
  
  /**
   * Process file for serverless environment
   * In Netlify Functions, files are handled in memory
   */
  static async processFile(file: File): Promise<UploadResult> {
    // Convert File to Buffer for processing
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2);
    const fileName = `${timestamp}-${randomId}-${file.name}`;
    
    // For Netlify, we'll use temporary storage or external service
    // Options: Netlify Blobs, AWS S3, Cloudinary, etc.
    
    if (process.env.NETLIFY_BLOB_TOKEN) {
      // Use Netlify Blobs if available
      return this.uploadToNetlifyBlobs(buffer, fileName, file.type);
    }
    
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      // Use AWS S3 if configured
      return this.uploadToS3(buffer, fileName, file.type);
    }
    
    // Fallback: Use temporary storage (not recommended for production)
    console.warn('⚠️  Using temporary storage - consider configuring Netlify Blobs or AWS S3');
    return this.uploadToTemporary(buffer, fileName, file.type);
  }
  
  /**
   * Upload to Netlify Blobs (recommended for Netlify)
   */
  private static async uploadToNetlifyBlobs(
    buffer: Buffer, 
    fileName: string, 
    mimeType: string
  ): Promise<UploadResult> {
    // Netlify Blobs implementation would go here
    // For now, return a placeholder
    return {
      url: `/api/files/${fileName}`,
      fileName,
      fileSize: buffer.length,
      mimeType
    };
  }
  
  /**
   * Upload to AWS S3 (alternative option)
   */
  private static async uploadToS3(
    buffer: Buffer, 
    fileName: string, 
    mimeType: string
  ): Promise<UploadResult> {
    // AWS S3 implementation would go here
    // For now, return a placeholder
    return {
      url: `/api/files/${fileName}`,
      fileName,
      fileSize: buffer.length,
      mimeType
    };
  }
  
  /**
   * Temporary storage (not recommended for production)
   */
  private static async uploadToTemporary(
    buffer: Buffer, 
    fileName: string, 
    mimeType: string
  ): Promise<UploadResult> {
    // Store in /tmp directory (cleaned up after function execution)
    const tmpPath = `/tmp/${fileName}`;
    
    // In serverless environment, this is temporary
    // File will be deleted after function execution
    
    return {
      url: `/api/files/${fileName}`,
      fileName,
      fileSize: buffer.length,
      mimeType
    };
  }
  
  /**
   * Get file URL for serving
   */
  static getFileUrl(fileName: string): string {
    if (process.env.NETLIFY_BLOB_TOKEN) {
      return `/api/files/${fileName}`;
    }
    
    if (process.env.AWS_S3_BUCKET) {
      return `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${fileName}`;
    }
    
    return `/api/files/${fileName}`;
  }
  
  /**
   * Validate file for serverless processing
   */
  static validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = parseInt(process.env.MAX_FILE_SIZE || '25000000'); // 25MB default
    const allowedTypes = process.env.ALLOWED_AUDIO_TYPES?.split(',') || [
      'audio/mpeg',
      'audio/wav', 
      'audio/mp4',
      'audio/m4a',
      'audio/webm',
      'audio/opus',
      'audio/ogg'
    ];
    
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size (${Math.round(file.size / 1024 / 1024)}MB) exceeds limit (${Math.round(maxSize / 1024 / 1024)}MB)`
      };
    }
    
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not supported`
      };
    }
    
    return { valid: true };
  }
}