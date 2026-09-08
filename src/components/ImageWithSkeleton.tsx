import { useState, type ImgHTMLAttributes } from 'react';

/**
 * <img> that covers its loading window with the site's shimmer placeholder
 * (same visual language as ContributionHeatmap's loading state) instead of a
 * blank flash, then fades in once loaded. The parent element must be
 * `position: relative` -- the shimmer overlay is `absolute inset-0`.
 */
const ImageWithSkeleton = ({ className, onLoad, ...rest }: ImgHTMLAttributes<HTMLImageElement>) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded && <div className="shimmer absolute inset-0" aria-hidden="true" />}
      <img
        {...rest}
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
        className={`${className ?? ''} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </>
  );
};

export default ImageWithSkeleton;
