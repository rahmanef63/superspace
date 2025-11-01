import { useState, useEffect, useRef, ImgHTMLAttributes } from 'react';

interface LazyImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  alt: string;
  placeholderSrc?: string;
  threshold?: number;
  rootMargin?: string;
  onLoad?: () => void;
  onError?: () => void;
  srcSet?: string;
  sizes?: string;
}

export function LazyImage({
  src,
  alt,
  placeholderSrc,
  threshold = 0.1,
  rootMargin = '50px',
  onLoad,
  onError,
  srcSet,
  sizes,
  className = '',
  ...props
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState<string | undefined>(placeholderSrc);
  const [imageSrcSet, setImageSrcSet] = useState<string | undefined>(undefined);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            if (srcSet) {
              setImageSrcSet(srcSet);
            }
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(imgRef.current);

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src, srcSet, threshold, rootMargin]);

  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) {
      onLoad();
    }
  };

  const handleError = () => {
    setHasError(true);
    if (onError) {
      onError();
    }
  };

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      srcSet={imageSrcSet}
      sizes={sizes}
      alt={alt}
      loading="lazy"
      decoding="async"
      onLoad={handleLoad}
      onError={handleError}
      className={`transition-opacity duration-300 ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      } ${hasError ? 'bg-muted' : ''} ${className}`}
      {...props}
    />
  );
}

interface ProgressiveImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  alt: string;
  placeholderSrc?: string;
  blur?: boolean;
}

export function ProgressiveImage({
  src,
  alt,
  placeholderSrc,
  blur = true,
  className = '',
  ...props
}: ProgressiveImageProps) {
  const [currentSrc, setCurrentSrc] = useState(placeholderSrc || src);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoading(false);
    };

    img.onerror = () => {
      setIsLoading(false);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={`transition-all duration-300 ${
        isLoading && blur ? 'blur-sm scale-105' : 'blur-0 scale-100'
      } ${className}`}
      {...props}
    />
  );
}

interface ResponsiveImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  alt: string;
  sizes?: string;
  srcSet?: string;
  loading?: 'lazy' | 'eager';
}

export function ResponsiveImage({
  src,
  alt,
  sizes,
  srcSet,
  loading = 'lazy',
  className = '',
  ...props
}: ResponsiveImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      sizes={sizes}
      srcSet={srcSet}
      loading={loading}
      decoding="async"
      className={className}
      {...props}
    />
  );
}
