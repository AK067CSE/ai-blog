/**
 * Image utility functions for compression and optimization
 */

export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

/**
 * Compress an image file to reduce size while maintaining quality
 */
export function compressImage(
  file: File, 
  options: ImageCompressionOptions = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 1200,
      maxHeight = 800,
      quality = 0.8,
      format = 'jpeg'
    } = options;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        
        const mimeType = `image/${format}`;
        const compressedDataUrl = canvas.toDataURL(mimeType, quality);
        
        resolve(compressedDataUrl);
      } else {
        reject(new Error('Could not get canvas context'));
      }
    };

    img.onerror = () => {
      reject(new Error('Could not load image'));
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Convert base64 image to a more efficient format
 */
export function optimizeBase64Image(
  base64: string,
  options: ImageCompressionOptions = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 1200,
      maxHeight = 800,
      quality = 0.8,
      format = 'jpeg'
    } = options;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;
      
      // Calculate new dimensions
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        
        const mimeType = `image/${format}`;
        const optimizedDataUrl = canvas.toDataURL(mimeType, quality);
        
        resolve(optimizedDataUrl);
      } else {
        reject(new Error('Could not get canvas context'));
      }
    };

    img.onerror = () => {
      reject(new Error('Could not load image'));
    };

    img.src = base64;
  });
}

/**
 * Get image dimensions from file
 */
export function getImageDimensions(file: File): Promise<{width: number, height: number}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };

    img.onerror = () => {
      reject(new Error('Could not load image'));
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Check if file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): {valid: boolean, error?: string} {
  // Check if it's an image
  if (!isImageFile(file)) {
    return {
      valid: false,
      error: 'File must be an image'
    };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size must be less than ${formatFileSize(maxSize)}`
    };
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'File type not supported. Use JPEG, PNG, GIF, or WebP'
    };
  }

  return { valid: true };
}

/**
 * Create a thumbnail from an image file
 */
export function createThumbnail(
  file: File,
  size: number = 150
): Promise<string> {
  return compressImage(file, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.7,
    format: 'jpeg'
  });
}
