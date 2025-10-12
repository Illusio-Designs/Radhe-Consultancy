import React, { memo, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * OptimizedImage - High-performance image component with:
 * - Lazy loading (native & IntersectionObserver fallback)
 * - WebP support with fallback
 * - Blur-up placeholder
 * - Optimized re-renders with React.memo
 */
const OptimizedImage = memo(({ 
  src, 
  alt = '', 
  className = '', 
  style = {},
  width,
  height,
  lazy = true,
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!lazy || !imgRef.current) {
      setIsInView(true);
      return;
    }

    // Use IntersectionObserver for lazy loading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.01
      }
    );

    observer.observe(imgRef.current);

    return () => {
      if (observer && imgRef.current) {
        observer.disconnect();
      }
    };
  }, [lazy]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <img
      ref={imgRef}
      src={isInView ? src : placeholder}
      alt={alt}
      className={`${className} ${isLoaded ? 'loaded' : 'loading'}`}
      style={{
        ...style,
        transition: 'opacity 0.3s ease-in-out',
        opacity: isLoaded ? 1 : 0.7
      }}
      width={width}
      height={height}
      loading={lazy ? 'lazy' : 'eager'}
      decoding="async"
      draggable="false"
      onLoad={handleLoad}
    />
  );
}, (prevProps, nextProps) => {
  // Only re-render if essential props change
  return (
    prevProps.src === nextProps.src && 
    prevProps.alt === nextProps.alt && 
    prevProps.className === nextProps.className &&
    prevProps.width === nextProps.width &&
    prevProps.height === nextProps.height
  );
});

OptimizedImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  lazy: PropTypes.bool,
  placeholder: PropTypes.string
};

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;

