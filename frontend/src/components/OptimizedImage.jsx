import React, { memo } from 'react';
import PropTypes from 'prop-types';

/**
 * OptimizedImage - Prevents re-rendering and image reloading
 * Uses React.memo to prevent unnecessary re-renders
 */
const OptimizedImage = memo(({ src, alt, className, style }) => {
  return (
    <img 
      src={src} 
      alt={alt} 
      className={className}
      style={style}
      draggable="false"
    />
  );
}, (prevProps, nextProps) => {
  // Only re-render if src, alt, or className changes
  return prevProps.src === nextProps.src && 
         prevProps.alt === nextProps.alt && 
         prevProps.className === nextProps.className;
});

OptimizedImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object
};

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;

