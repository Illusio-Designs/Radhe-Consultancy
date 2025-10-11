/**
 * Generate WebP source path from original image path
 */
export const getWebPSrc = (src) => {
  if (!src) return null;
  return src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
};

/**
 * Get optimized image sources for responsive images
 */
export const optimizeImage = (src, sizes = [640, 768, 1024, 1280]) => {
  const webpSrc = getWebPSrc(src);
  return {
    src,
    webpSrc,
    srcSet: sizes.map(size => `${src}?w=${size} ${size}w`).join(','),
    webpSrcSet: sizes.map(size => `${webpSrc}?w=${size} ${size}w`).join(','),
    sizes: '(max-width: 768px) 100vw, 50vw'
  };
};

/**
 * Get all image formats for a picture element
 */
export const getImageSources = (src) => {
  const webpSrc = getWebPSrc(src);
  return {
    webp: webpSrc,
    original: src
  };
};

/**
 * Check if browser supports WebP
 */
export const supportsWebP = () => {
  if (typeof document === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  if (canvas.getContext && canvas.getContext('2d')) {
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }
  return false;
};

/**
 * Preload images for better performance
 */
export const preloadImage = (src, useWebP = true) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const imageSrc = useWebP ? getWebPSrc(src) : src;
    
    img.onload = () => resolve(img);
    img.onerror = () => {
      // Fallback to original if WebP fails
      if (useWebP) {
        preloadImage(src, false).then(resolve).catch(reject);
      } else {
        reject(new Error(`Failed to load image: ${src}`));
      }
    };
    
    img.src = imageSrc;
  });
};