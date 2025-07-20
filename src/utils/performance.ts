// Performance optimization utilities

/**
 * Preload critical resources
 */
export const preloadResource = (href: string, as: string = 'script') => {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  }
};

/**
 * Lazy load images with intersection observer
 */
export const createLazyImageObserver = () => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }

  return new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            img.classList.add('loaded');
          }
        }
      });
    },
    {
      rootMargin: '50px 0px',
      threshold: 0.01,
    }
  );
};

/**
 * Debounce function for performance optimization
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
};

/**
 * Throttle function for performance optimization
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get connection speed information
 */
export const getConnectionSpeed = (): string => {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return 'unknown';
  }
  
  const connection = (navigator as any).connection;
  return connection?.effectiveType || 'unknown';
};

/**
 * Optimize images based on device capabilities
 */
export const getOptimizedImageUrl = (baseUrl: string, width: number, quality: number = 80): string => {
  const connectionSpeed = getConnectionSpeed();
  const devicePixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  
  // Adjust quality based on connection speed
  let adjustedQuality = quality;
  if (connectionSpeed === 'slow-2g' || connectionSpeed === '2g') {
    adjustedQuality = Math.max(40, quality - 30);
  } else if (connectionSpeed === '3g') {
    adjustedQuality = Math.max(60, quality - 15);
  }
  
  // Adjust width based on device pixel ratio
  const adjustedWidth = Math.round(width * devicePixelRatio);
  
  return `${baseUrl}?w=${adjustedWidth}&q=${adjustedQuality}&f=webp`;
};

/**
 * Measure and log performance metrics
 */
export const measurePerformance = (name: string, fn: () => void | Promise<void>) => {
  if (typeof performance === 'undefined') {
    return fn();
  }
  
  const start = performance.now();
  const result = fn();
  
  if (result instanceof Promise) {
    return result.finally(() => {
      const end = performance.now();
      console.log(`${name} took ${end - start} milliseconds`);
    });
  } else {
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
    return result;
  }
};

/**
 * Preload critical CSS
 */
export const preloadCSS = (href: string) => {
  if (typeof document === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'style';
  link.href = href;
  link.onload = () => {
    link.rel = 'stylesheet';
  };
  document.head.appendChild(link);
};

/**
 * Critical resource hints
 */
export const addResourceHints = () => {
  if (typeof document === 'undefined') return;
  
  // Add DNS prefetch for external resources
  const dnsPrefetchUrls = [
    '//fonts.googleapis.com',
    '//fonts.gstatic.com',
    '//api.example.com', // Replace with your API domain
  ];
  
  dnsPrefetchUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = url;
    document.head.appendChild(link);
  });
};