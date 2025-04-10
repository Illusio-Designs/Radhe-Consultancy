export const optimizeImage = (src, sizes) => {
  const webpSrc = src.replace(/\.(jpg|png)$/, '.webp');
  return {
    src,
    srcSet: sizes.map(size => `${src}?w=${size} ${size}w`).join(','),
    webpSrcSet: sizes.map(size => `${webpSrc}?w=${size} ${size}w`).join(','),
    sizes: '(max-width: 768px) 100vw, 50vw'
  };
};