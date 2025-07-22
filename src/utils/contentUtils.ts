/**
 * Content utility functions for handling large content
 */

export interface ContentChunk {
  id: string;
  content: string;
  order: number;
  size: number;
}

/**
 * Split large content into manageable chunks
 */
export function chunkContent(content: string, maxChunkSize: number = 1024 * 1024): ContentChunk[] {
  if (content.length <= maxChunkSize) {
    return [{
      id: '1',
      content,
      order: 1,
      size: content.length
    }];
  }

  const chunks: ContentChunk[] = [];
  let currentPosition = 0;
  let chunkIndex = 1;

  while (currentPosition < content.length) {
    let chunkEnd = Math.min(currentPosition + maxChunkSize, content.length);
    
    // Try to break at a natural boundary (end of tag, sentence, etc.)
    if (chunkEnd < content.length) {
      // Look for tag boundaries
      const tagEnd = content.lastIndexOf('>', chunkEnd);
      const tagStart = content.lastIndexOf('<', chunkEnd);
      
      if (tagEnd > tagStart && tagEnd > currentPosition) {
        chunkEnd = tagEnd + 1;
      } else {
        // Look for sentence boundaries
        const sentenceEnd = content.lastIndexOf('.', chunkEnd);
        if (sentenceEnd > currentPosition) {
          chunkEnd = sentenceEnd + 1;
        } else {
          // Look for word boundaries
          const wordEnd = content.lastIndexOf(' ', chunkEnd);
          if (wordEnd > currentPosition) {
            chunkEnd = wordEnd;
          }
        }
      }
    }

    const chunkContent = content.slice(currentPosition, chunkEnd);
    chunks.push({
      id: chunkIndex.toString(),
      content: chunkContent,
      order: chunkIndex,
      size: chunkContent.length
    });

    currentPosition = chunkEnd;
    chunkIndex++;
  }

  return chunks;
}

/**
 * Reassemble chunks back into complete content
 */
export function reassembleChunks(chunks: ContentChunk[]): string {
  return chunks
    .sort((a, b) => a.order - b.order)
    .map(chunk => chunk.content)
    .join('');
}

/**
 * Estimate content size in bytes
 */
export function estimateContentSize(content: string): number {
  return new Blob([content]).size;
}

/**
 * Compress content by removing unnecessary whitespace
 */
export function compressContent(content: string): string {
  return content
    // Remove extra whitespace between tags
    .replace(/>\s+</g, '><')
    // Remove leading/trailing whitespace in text nodes
    .replace(/>\s+/g, '>')
    .replace(/\s+</g, '<')
    // Normalize multiple spaces to single space
    .replace(/\s{2,}/g, ' ')
    // Remove empty paragraphs
    .replace(/<p[^>]*>\s*<\/p>/gi, '')
    // Remove empty divs
    .replace(/<div[^>]*>\s*<\/div>/gi, '');
}

/**
 * Extract images from content for separate handling
 */
export function extractImages(content: string): {
  content: string;
  images: Array<{id: string, src: string, alt: string}>;
} {
  const images: Array<{id: string, src: string, alt: string}> = [];
  let imageIndex = 1;

  const contentWithPlaceholders = content.replace(
    /<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>/gi,
    (match, src, alt) => {
      const imageId = `IMG_${imageIndex++}`;
      images.push({ id: imageId, src, alt });
      return `<img-placeholder id="${imageId}" alt="${alt}" />`;
    }
  );

  return {
    content: contentWithPlaceholders,
    images
  };
}

/**
 * Restore images back into content
 */
export function restoreImages(
  content: string, 
  images: Array<{id: string, src: string, alt: string}>
): string {
  let restoredContent = content;

  images.forEach(image => {
    const placeholder = `<img-placeholder id="${image.id}" alt="${image.alt}" />`;
    const imgTag = `<img src="${image.src}" alt="${image.alt}" style="max-width: 100%; height: auto;" />`;
    restoredContent = restoredContent.replace(placeholder, imgTag);
  });

  return restoredContent;
}

/**
 * Validate content size and provide recommendations
 */
export function validateContentSize(content: string): {
  valid: boolean;
  size: number;
  recommendations: string[];
} {
  const size = estimateContentSize(content);
  const maxSize = 16 * 1024 * 1024; // 16MB limit
  const recommendations: string[] = [];

  if (size > maxSize) {
    recommendations.push('Content is too large. Consider splitting into multiple posts.');
  }

  if (size > 5 * 1024 * 1024) { // 5MB warning
    recommendations.push('Large content detected. Consider compressing images.');
  }

  // Count images
  const imageCount = (content.match(/<img/gi) || []).length;
  if (imageCount > 20) {
    recommendations.push('Many images detected. Consider using thumbnails or galleries.');
  }

  // Check for very large images (base64 > 1MB)
  const largeImages = content.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/]{1000000,}/g);
  if (largeImages && largeImages.length > 0) {
    recommendations.push('Large uncompressed images found. Use image compression.');
  }

  return {
    valid: size <= maxSize,
    size,
    recommendations
  };
}

/**
 * Format content size for display
 */
export function formatContentSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Optimize content for transmission
 */
export function optimizeContent(content: string): {
  optimized: string;
  originalSize: number;
  optimizedSize: number;
  savings: number;
} {
  const originalSize = estimateContentSize(content);
  const compressed = compressContent(content);
  const optimizedSize = estimateContentSize(compressed);
  const savings = Math.round(((originalSize - optimizedSize) / originalSize) * 100);

  return {
    optimized: compressed,
    originalSize,
    optimizedSize,
    savings
  };
}
