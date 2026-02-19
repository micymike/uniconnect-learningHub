// Memory optimization utilities for React components

export const createImageURL = (file: File): string => {
  return URL.createObjectURL(file);
};

export const revokeImageURL = (url: string): void => {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};

export const limitArraySize = <T>(array: T[], maxSize: number): T[] => {
  return array.length > maxSize ? array.slice(-maxSize) : array;
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

// File size validation
export const validateFileSize = (file: File, maxSizeMB: number = 5): boolean => {
  return file.size <= maxSizeMB * 1024 * 1024;
};

// Memory usage monitoring (development only)
export const logMemoryUsage = (): void => {
  if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
    const memInfo = (performance as any).memory;
    console.log('Memory Usage:', {
      used: Math.round(memInfo.usedJSHeapSize / 1024 / 1024) + ' MB',
      total: Math.round(memInfo.totalJSHeapSize / 1024 / 1024) + ' MB',
      limit: Math.round(memInfo.jsHeapSizeLimit / 1024 / 1024) + ' MB'
    });
  }
};