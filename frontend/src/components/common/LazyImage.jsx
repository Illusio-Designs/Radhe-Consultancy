import React from 'react';

const LazyImage = ({ src, srcSet, alt, loading }) => {
  return (
    <img
      src={src}
      srcSet={srcSet}
      alt={alt}
      loading={loading}
      style={{ width: '100%', height: 'auto' }}
    />
  );
};

export default LazyImage;
