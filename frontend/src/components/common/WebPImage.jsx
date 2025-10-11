import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * WebPImage Component
 * 
 * Automatically uses WebP images with fallback to original format
 * 
 * @example
 * <WebPImage 
 *   src="/images/photo.jpg" 
 *   alt="Description"
 *   className="w-full h-auto"
 * />
 */
const WebPImage = ({ 
  src, 
  alt = '', 
  className = '',
  style = {},
  loading = 'lazy',
  onLoad,
  onError,
  ...props 
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Generate WebP source from original image path
  const getWebPSrc = (originalSrc) => {
    if (!originalSrc) return null;
    // Replace common image extensions with .webp
    return originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  };

  const webpSrc = getWebPSrc(src);

  const handleLoad = (e) => {
    setIsLoading(false);
    if (onLoad) onLoad(e);
  };

  const handleError = (e) => {
    setHasError(true);
    if (onError) onError(e);
  };

  return (
    <picture className={className}>
      {/* Try WebP first if available and no error occurred */}
      {webpSrc && !hasError && (
        <source 
          srcSet={webpSrc} 
          type="image/webp"
        />
      )}
      
      {/* Fallback to original image */}
      <img
        src={hasError ? src : (webpSrc || src)}
        alt={alt}
        className={className}
        style={style}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </picture>
  );
};

WebPImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  loading: PropTypes.oneOf(['lazy', 'eager']),
  onLoad: PropTypes.func,
  onError: PropTypes.func
};

export default WebPImage;

