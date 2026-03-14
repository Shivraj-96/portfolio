/**
 * imageOptimizer.js
 * Client-side image compression utility.
 * Resizes and compresses images to WebP before they are sent to the server.
 * Drop this file in: src/utils/imageOptimizer.js
 */

const DEFAULT_OPTIONS = {
  maxWidth:  800,    // max pixel width
  maxHeight: 600,    // max pixel height
  quality:   0.82,   // 0–1  (0.82 = good quality, ~60–70% smaller than raw)
  format:    'image/webp',  // best compression; falls back to jpeg if unsupported
};

/**
 * Compress and resize an image File/Blob.
 * Returns a base64 data-URL of the compressed image.
 *
 * Usage:
 *   import { compressImage } from '../utils/imageOptimizer';
 *   const compressed = await compressImage(file);
 *   setForm(p => ({ ...p, image: compressed }));
 */
export async function compressImage(file, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    // 1. Validate file type
    if (!file.type.startsWith('image/')) {
      reject(new Error('File is not an image.'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // 2. Calculate scaled dimensions (maintain aspect ratio)
        let { width, height } = img;
        const aspectRatio = width / height;

        if (width > opts.maxWidth) {
          width  = opts.maxWidth;
          height = Math.round(width / aspectRatio);
        }
        if (height > opts.maxHeight) {
          height = opts.maxHeight;
          width  = Math.round(height * aspectRatio);
        }

        // 3. Draw to canvas at reduced size
        const canvas = document.createElement('canvas');
        canvas.width  = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // 4. Export as WebP (or JPEG as fallback)
        const format = canvas.toDataURL('image/webp').startsWith('data:image/webp')
          ? 'image/webp'
          : 'image/jpeg';

        const compressed = canvas.toDataURL(format, opts.quality);
        resolve(compressed);
      };

      img.onerror = () => reject(new Error('Failed to load image.'));
      img.src = e.target.result;
    };

    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Get human-readable file size string.
 * Usage: getSizeLabel(file.size) → "245 KB"
 */
export function getSizeLabel(bytes) {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Get base64 size in KB (approximate).
 */
export function getBase64SizeKB(base64String) {
  const base64Data = base64String.split(',')[1] || base64String;
  return Math.round((base64Data.length * 3) / 4 / 1024);
}