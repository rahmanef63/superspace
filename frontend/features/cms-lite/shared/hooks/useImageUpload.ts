import { useState, useCallback } from 'react';
import { optimizeImage, CompressionOptions, ImageMetadata } from '../utils/imageCompression';

/**
 * TODO: Integrate with Convex storage API
 * This hook currently has placeholder upload logic.
 * Need to implement proper Convex file storage integration.
 */

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface UploadOptions extends CompressionOptions {
  maxRetries?: number;
  retryDelay?: number;
}

interface UseImageUploadReturn {
  upload: (file: File, options?: UploadOptions) => Promise<string>;
  isUploading: boolean;
  progress: UploadProgress | null;
  error: string | null;
  metadata: ImageMetadata | null;
  retryCount: number;
}

export function useImageUpload(): UseImageUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const performUpload = async (uploadUrl: string, file: File): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          setProgress({
            loaded: e.loaded,
            total: e.total,
            percentage: Math.round((e.loaded / e.total) * 100),
          });
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload timeout'));
      });

      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.timeout = 60000;
      xhr.send(file);
    });
  };

  const upload = useCallback(async (file: File, options?: UploadOptions): Promise<string> => {
    const maxRetries = options?.maxRetries ?? 3;
    const retryDelay = options?.retryDelay ?? 1000;

    setIsUploading(true);
    setError(null);
    setProgress(null);
    setMetadata(null);
    setRetryCount(0);

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        setRetryCount(attempt);

        const optimized = await optimizeImage(file, options);
        setMetadata(optimized.metadata);

        // TODO: Replace with actual Convex storage upload
        console.warn('TODO: Implement Convex storage upload');
        
        // Placeholder - simulate upload
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockPublicUrl = URL.createObjectURL(optimized.file);

        setIsUploading(false);
        setRetryCount(0);
        return mockPublicUrl;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error('Upload failed');
        console.error(`Upload attempt ${attempt + 1} failed:`, lastError);

        if (attempt < maxRetries) {
          const delay = retryDelay * Math.pow(2, attempt);
          console.log(`Retrying in ${delay}ms...`);
          await sleep(delay);
        }
      }
    }

    const message = lastError?.message || 'Upload failed after multiple attempts';
    setError(message);
    setIsUploading(false);
    throw lastError || new Error(message);
  }, []);

  return { upload, isUploading, progress, error, metadata, retryCount };
}
