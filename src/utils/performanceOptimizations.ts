/**
 * Performance Optimization Utilities
 *
 * Collection of utilities to improve application performance:
 * - Debouncing and throttling
 * - Memoization
 * - Performance monitoring
 */

/**
 * Debounce function that delays execution until call frequency decreases
 * Useful for resize, scroll, and input events
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delayMs: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delayMs);
  };
};

/**
 * Throttle function that limits execution frequency
 * Useful for scroll and resize events that fire very frequently
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delayMs: number
): ((...args: Parameters<T>) => void) => {
  let lastCallTime = 0;
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    const now = Date.now();

    if (now - lastCallTime >= delayMs) {
      func(...args);
      lastCallTime = now;
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
        lastCallTime = Date.now();
      }, delayMs - (now - lastCallTime));
    }
  };
};

/**
 * Simple memoization cache for expensive computations
 * Returns same reference if inputs haven't changed
 */
export const memoize = <T extends (...args: any[]) => any>(func: T, { maxSize = 10 } = {}) => {
  const cache = new Map<string, any>();

  return (...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = func(...args);

    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) cache.delete(firstKey);
    }

    cache.set(key, result);
    return result;
  };
};

/**
 * Performance monitoring utility
 * Tracks component render times and reports metrics
 */
export class PerformanceMonitor {
  private static measurements = new Map<string, number[]>();

  static mark(label: string): void {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(label);
    }
  }

  static measure(label: string, startMark: string, endMark: string): number {
    if (typeof performance !== 'undefined' && performance.measure) {
      try {
        performance.measure(label, startMark, endMark);
        const measure = performance.getEntriesByName(label)[0];
        return measure?.duration || 0;
      } catch {
        return 0;
      }
    }
    return 0;
  }

  static recordMetric(label: string, value: number): void {
    if (!this.measurements.has(label)) {
      this.measurements.set(label, []);
    }
    this.measurements.get(label)!.push(value);
  }

  static getMetrics(label: string) {
    const values = this.measurements.get(label) || [];
    if (values.length === 0) {
      return { count: 0, average: 0, min: 0, max: 0 };
    }

    return {
      count: values.length,
      average: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }

  static clear(): void {
    this.measurements.clear();
  }
}

/**
 * Request animation frame based throttle
 * Optimal for animations and visual updates
 */
export const rafThrottle = <T extends (...args: any[]) => any>(
  func: T
): ((...args: Parameters<T>) => void) => {
  let rafId: number | null = null;

  return (...args: Parameters<T>) => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }
    rafId = requestAnimationFrame(() => {
      func(...args);
      rafId = null;
    });
  };
};

/**
 * LRU (Least Recently Used) Cache implementation
 * Automatically evicts least recently used items
 */
export class LRUCache<K, V> {
  private cache: Map<K, V> = new Map();
  private maxSize: number;

  constructor(maxSize: number = 50) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      return undefined;
    }

    const value = this.cache.get(key)!;
    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) this.cache.delete(firstKey);
    }

    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }
}
