/**
 * Image compression utility for report figures.
 * Resizes large camera photos (3-12MB) down to crisp, web/doc-optimized images (~40-80KB)
 * to prevent browser LocalStorage QuotaExceededError and ensure fast PDF/Docx generation.
 */

export function compressImageFile(file, maxWidth = 900, maxHeight = 900, quality = 0.75) {
  return new Promise((resolve) => {
    if (!file) {
      resolve(null);
      return;
    }

    // If not an image or SVG/GIF, fallback to direct data URL
    if (!file.type || !file.type.startsWith('image/') || file.type.includes('svg')) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result || null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio preserved dimensions
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        try {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            resolve(readerEvent.target?.result || null);
            return;
          }

          // Use high quality image rendering on canvas
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Compress to JPEG format (drastically smaller than raw PNG or raw phone photo)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch (canvasErr) {
          console.warn('Canvas compression failed, falling back to original:', canvasErr);
          resolve(readerEvent.target?.result || null);
        }
      };

      img.onerror = () => {
        resolve(readerEvent.target?.result || null);
      };

      img.src = readerEvent.target?.result;
    };

    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}
